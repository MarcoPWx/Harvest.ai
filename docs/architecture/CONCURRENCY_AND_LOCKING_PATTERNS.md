# 🔒 CONCURRENCY & RESOURCE MANAGEMENT PATTERNS

**Purpose:** Handle thousands of concurrent operations safely and efficiently  
**Focus:** Locking, claiming, resource pools, and coordination patterns

## Table of Contents

1. [Core Locking Patterns](#core-locking-patterns)
2. [Resource Pool Management](#resource-pool-management)
3. [Work Queue Patterns](#work-queue-patterns)
4. [Distributed Coordination](#distributed-coordination)
5. [Production Implementation](#production-implementation)

---

## 🔐 Core Locking Patterns

### 1. Distributed Lock with Redis

#### What is it?
Ensures only one process/thread can access a resource at a time across multiple servers.

```
Thread A ──┐
Thread B ──┼──▶ [Try Acquire Lock] ──▶ [Redis] ──▶ [Process Resource]
Thread C ──┘         │                              │
                     ▼                              ▼
                  [Wait/Retry]                  [Release Lock]
```

#### Implementation:

```python
import asyncio
import uuid
import time
from typing import Optional, Any
import redis.asyncio as redis
from contextlib import asynccontextmanager

class DistributedLock:
    """Redis-based distributed lock with auto-renewal"""
    
    def __init__(self, redis_client: redis.Redis, key: str, ttl: int = 30):
        self.redis = redis_client
        self.key = f"lock:{key}"
        self.ttl = ttl
        self.token = str(uuid.uuid4())
        self._renewal_task = None
    
    async def acquire(self, blocking: bool = True, timeout: float = None) -> bool:
        """Acquire the lock"""
        start_time = time.time()
        
        while True:
            # Try to set lock with NX (only if not exists)
            acquired = await self.redis.set(
                self.key, 
                self.token,
                nx=True,  # Only set if not exists
                ex=self.ttl  # Expire after TTL seconds
            )
            
            if acquired:
                # Start auto-renewal
                self._renewal_task = asyncio.create_task(self._auto_renew())
                return True
            
            if not blocking:
                return False
            
            # Check timeout
            if timeout and (time.time() - start_time) > timeout:
                return False
            
            # Wait before retry
            await asyncio.sleep(0.1)
    
    async def release(self) -> bool:
        """Release the lock if we own it"""
        # Stop auto-renewal
        if self._renewal_task:
            self._renewal_task.cancel()
        
        # Use Lua script for atomic check-and-delete
        lua_script = """
        if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
        else
            return 0
        end
        """
        
        result = await self.redis.eval(
            lua_script,
            1,  # Number of keys
            self.key,  # KEYS[1]
            self.token  # ARGV[1]
        )
        
        return bool(result)
    
    async def _auto_renew(self):
        """Auto-renew lock while held"""
        while True:
            try:
                await asyncio.sleep(self.ttl / 3)  # Renew at 1/3 TTL
                
                # Check if we still own the lock and renew
                lua_script = """
                if redis.call("get", KEYS[1]) == ARGV[1] then
                    return redis.call("expire", KEYS[1], ARGV[2])
                else
                    return 0
                end
                """
                
                await self.redis.eval(
                    lua_script,
                    1,
                    self.key,
                    self.token,
                    self.ttl
                )
            except asyncio.CancelledError:
                break
    
    @asynccontextmanager
    async def lock_context(self, blocking: bool = True, timeout: float = None):
        """Context manager for lock"""
        try:
            acquired = await self.acquire(blocking, timeout)
            if not acquired:
                raise LockAcquisitionError(f"Could not acquire lock {self.key}")
            yield self
        finally:
            await self.release()

# Usage
redis_client = redis.Redis.from_url("redis://localhost")

async def process_resource(resource_id: str):
    lock = DistributedLock(redis_client, f"resource:{resource_id}")
    
    async with lock.lock_context(timeout=10):
        # Critical section - only one thread/process can be here
        await process_expensive_operation(resource_id)
```

### 2. Semaphore for Rate Limiting

#### What is it?
Limits the number of concurrent operations.

```python
class DistributedSemaphore:
    """Distributed semaphore for rate limiting"""
    
    def __init__(self, redis_client: redis.Redis, key: str, max_permits: int):
        self.redis = redis_client
        self.key = f"semaphore:{key}"
        self.max_permits = max_permits
        self.permit_id = str(uuid.uuid4())
        
    async def acquire(self, permits: int = 1, timeout: float = None) -> bool:
        """Acquire permits from semaphore"""
        start_time = time.time()
        
        while True:
            # Get current permit count
            current = await self.redis.zcard(self.key)
            
            if current + permits <= self.max_permits:
                # Add our permits with timestamp score
                pipe = self.redis.pipeline()
                timestamp = time.time()
                
                for i in range(permits):
                    member = f"{self.permit_id}:{i}:{timestamp}"
                    pipe.zadd(self.key, {member: timestamp})
                
                pipe.expire(self.key, 3600)  # Clean up after 1 hour
                await pipe.execute()
                return True
            
            if timeout and (time.time() - start_time) > timeout:
                return False
            
            await asyncio.sleep(0.1)
    
    async def release(self, permits: int = 1):
        """Release permits back to semaphore"""
        # Remove oldest permits matching our ID
        members = await self.redis.zrange(self.key, 0, -1)
        
        to_remove = []
        for member in members:
            if member.decode().startswith(self.permit_id):
                to_remove.append(member)
                if len(to_remove) >= permits:
                    break
        
        if to_remove:
            await self.redis.zrem(self.key, *to_remove)

# Usage - Limit to 10 concurrent API calls
api_semaphore = DistributedSemaphore(redis_client, "api_calls", max_permits=10)

async def call_api_with_limit():
    if await api_semaphore.acquire(timeout=5):
        try:
            return await make_api_call()
        finally:
            await api_semaphore.release()
```

---

## 💼 Resource Pool Management

### 3. Resource Claim/Release System

#### What is it?
Manages a pool of resources (API keys, connections, etc.) that can be claimed and released.

```python
class ResourcePool:
    """Manages a pool of claimable resources"""
    
    def __init__(self, redis_client: redis.Redis, pool_name: str):
        self.redis = redis_client
        self.pool_name = pool_name
        self.available_key = f"pool:{pool_name}:available"
        self.claimed_key = f"pool:{pool_name}:claimed"
        self.stats_key = f"pool:{pool_name}:stats"
    
    async def add_resource(self, resource_id: str, metadata: dict = None):
        """Add a resource to the pool"""
        resource_data = {
            'id': resource_id,
            'metadata': metadata or {},
            'added_at': time.time()
        }
        
        await self.redis.sadd(self.available_key, json.dumps(resource_data))
        await self.redis.hincrby(self.stats_key, 'total_resources', 1)
    
    async def claim(self, 
                   claimer_id: str, 
                   duration: int = 300,
                   wait: bool = True,
                   timeout: float = None) -> Optional[dict]:
        """Claim a resource from the pool"""
        start_time = time.time()
        
        while True:
            # Pop from available pool
            resource_json = await self.redis.spop(self.available_key)
            
            if resource_json:
                resource = json.loads(resource_json)
                
                # Add to claimed set with expiry
                claim_data = {
                    'resource': resource,
                    'claimer_id': claimer_id,
                    'claimed_at': time.time(),
                    'expires_at': time.time() + duration
                }
                
                claim_key = f"{self.claimed_key}:{resource['id']}"
                await self.redis.setex(
                    claim_key,
                    duration,
                    json.dumps(claim_data)
                )
                
                # Update stats
                await self.redis.hincrby(self.stats_key, 'claims', 1)
                
                # Start heartbeat for auto-renewal
                asyncio.create_task(
                    self._heartbeat(resource['id'], claimer_id, duration)
                )
                
                return resource
            
            if not wait:
                return None
            
            if timeout and (time.time() - start_time) > timeout:
                return None
            
            # Wait for resource to become available
            await asyncio.sleep(0.5)
    
    async def release(self, resource_id: str, claimer_id: str) -> bool:
        """Release a claimed resource"""
        claim_key = f"{self.claimed_key}:{resource_id}"
        
        # Verify ownership
        claim_data = await self.redis.get(claim_key)
        if not claim_data:
            return False
        
        claim = json.loads(claim_data)
        if claim['claimer_id'] != claimer_id:
            return False
        
        # Return to available pool
        await self.redis.sadd(
            self.available_key,
            json.dumps(claim['resource'])
        )
        
        # Remove from claimed
        await self.redis.delete(claim_key)
        
        # Update stats
        await self.redis.hincrby(self.stats_key, 'releases', 1)
        
        return True
    
    async def _heartbeat(self, resource_id: str, claimer_id: str, duration: int):
        """Keep claim alive with heartbeat"""
        claim_key = f"{self.claimed_key}:{resource_id}"
        
        while True:
            await asyncio.sleep(duration / 3)
            
            # Check if still claimed by us
            claim_data = await self.redis.get(claim_key)
            if not claim_data:
                break
            
            claim = json.loads(claim_data)
            if claim['claimer_id'] != claimer_id:
                break
            
            # Extend expiry
            await self.redis.expire(claim_key, duration)
    
    async def get_stats(self) -> dict:
        """Get pool statistics"""
        stats = await self.redis.hgetall(self.stats_key)
        available_count = await self.redis.scard(self.available_key)
        
        # Count claimed resources
        claimed_pattern = f"{self.claimed_key}:*"
        claimed_keys = await self.redis.keys(claimed_pattern)
        
        return {
            'total_resources': int(stats.get(b'total_resources', 0)),
            'available': available_count,
            'claimed': len(claimed_keys),
            'total_claims': int(stats.get(b'claims', 0)),
            'total_releases': int(stats.get(b'releases', 0))
        }

# Usage Example - API Key Pool
api_key_pool = ResourcePool(redis_client, "api_keys")

# Add API keys to pool
await api_key_pool.add_resource("key1", {"provider": "openai", "tier": "paid"})
await api_key_pool.add_resource("key2", {"provider": "openai", "tier": "free"})

# Claim an API key
async def process_with_api_key(worker_id: str):
    resource = await api_key_pool.claim(
        claimer_id=worker_id,
        duration=60,  # Hold for 60 seconds
        timeout=10    # Wait up to 10 seconds
    )
    
    if resource:
        try:
            # Use the API key
            result = await call_api(resource['id'])
            return result
        finally:
            # Always release when done
            await api_key_pool.release(resource['id'], worker_id)
```

### 4. Connection Pool with Health Checks

```python
class ManagedConnectionPool:
    """Connection pool with health monitoring"""
    
    def __init__(self, create_connection_func, max_size: int = 10):
        self.create_connection = create_connection_func
        self.max_size = max_size
        self.available = asyncio.Queue(max_size)
        self.in_use = set()
        self.unhealthy = set()
        self._lock = asyncio.Lock()
    
    async def acquire(self) -> Any:
        """Get a healthy connection"""
        while True:
            try:
                # Try to get existing connection
                conn = await asyncio.wait_for(
                    self.available.get(),
                    timeout=0.1
                )
                
                # Health check
                if await self._is_healthy(conn):
                    self.in_use.add(conn)
                    return conn
                else:
                    # Mark as unhealthy and try again
                    self.unhealthy.add(conn)
                    continue
                    
            except asyncio.TimeoutError:
                # No available connections, create new one
                async with self._lock:
                    if len(self.in_use) + self.available.qsize() < self.max_size:
                        conn = await self.create_connection()
                        self.in_use.add(conn)
                        return conn
                
                # Pool is full, wait
                await asyncio.sleep(0.1)
    
    async def release(self, conn):
        """Return connection to pool"""
        self.in_use.discard(conn)
        
        if await self._is_healthy(conn):
            await self.available.put(conn)
        else:
            # Don't return unhealthy connections
            self.unhealthy.add(conn)
            # Create replacement
            asyncio.create_task(self._replace_unhealthy())
    
    async def _is_healthy(self, conn) -> bool:
        """Check connection health"""
        try:
            # Implement actual health check
            await conn.ping()
            return True
        except:
            return False
    
    async def _replace_unhealthy(self):
        """Replace unhealthy connections"""
        for conn in list(self.unhealthy):
            try:
                await conn.close()
            except:
                pass
            self.unhealthy.discard(conn)
            
            # Create new connection
            try:
                new_conn = await self.create_connection()
                await self.available.put(new_conn)
            except:
                pass
```

---

## 📋 Work Queue Patterns

### 5. Priority Work Queue with Backpressure

```python
class PriorityWorkQueue:
    """Work queue with priorities and backpressure"""
    
    def __init__(self, redis_client: redis.Redis, queue_name: str, max_size: int = 1000):
        self.redis = redis_client
        self.queue_name = queue_name
        self.max_size = max_size
        self.processing_key = f"queue:{queue_name}:processing"
        self.completed_key = f"queue:{queue_name}:completed"
        self.failed_key = f"queue:{queue_name}:failed"
    
    async def enqueue(self, 
                     task_id: str,
                     task_data: dict,
                     priority: int = 0,
                     delay: int = 0) -> bool:
        """Add task to queue with priority"""
        
        # Check backpressure
        queue_size = await self.redis.zcard(self.queue_name)
        if queue_size >= self.max_size:
            return False  # Queue is full
        
        # Calculate score (lower = higher priority)
        # Score = timestamp + (1000000 - priority)
        score = time.time() + delay + (1000000 - priority)
        
        task = {
            'id': task_id,
            'data': task_data,
            'enqueued_at': time.time(),
            'priority': priority,
            'attempts': 0
        }
        
        await self.redis.zadd(
            self.queue_name,
            {json.dumps(task): score}
        )
        
        return True
    
    async def dequeue(self, worker_id: str) -> Optional[dict]:
        """Get next task from queue"""
        
        # Get highest priority task
        tasks = await self.redis.zrange(
            self.queue_name,
            0, 0,  # Get first item
            withscores=True
        )
        
        if not tasks:
            return None
        
        task_json, score = tasks[0]
        task = json.loads(task_json)
        
        # Move to processing
        pipe = self.redis.pipeline()
        pipe.zrem(self.queue_name, task_json)
        pipe.hset(
            self.processing_key,
            task['id'],
            json.dumps({
                **task,
                'worker_id': worker_id,
                'started_at': time.time()
            })
        )
        pipe.expire(self.processing_key, 3600)  # Auto-cleanup
        
        results = await pipe.execute()
        
        if results[0]:  # Successfully removed from queue
            return task
        
        return None  # Someone else got it
    
    async def complete(self, task_id: str, result: Any):
        """Mark task as completed"""
        # Remove from processing
        task_data = await self.redis.hget(self.processing_key, task_id)
        await self.redis.hdel(self.processing_key, task_id)
        
        # Store completion
        await self.redis.hset(
            self.completed_key,
            task_id,
            json.dumps({
                'task': json.loads(task_data) if task_data else {},
                'result': result,
                'completed_at': time.time()
            })
        )
        
        # Expire old completions
        await self.redis.expire(self.completed_key, 86400)  # 24 hours
    
    async def fail(self, task_id: str, error: str, retry: bool = True):
        """Handle failed task"""
        task_data = await self.redis.hget(self.processing_key, task_id)
        
        if not task_data:
            return
        
        task = json.loads(task_data)
        task['attempts'] += 1
        
        if retry and task['attempts'] < 3:
            # Re-queue with lower priority
            await self.enqueue(
                task_id,
                task['data'],
                priority=task['priority'] - 100,
                delay=60 * task['attempts']  # Exponential backoff
            )
        else:
            # Move to failed queue
            await self.redis.hset(
                self.failed_key,
                task_id,
                json.dumps({
                    **task,
                    'error': error,
                    'failed_at': time.time()
                })
            )
        
        # Remove from processing
        await self.redis.hdel(self.processing_key, task_id)

# Worker Implementation
class QueueWorker:
    """Worker that processes tasks from queue"""
    
    def __init__(self, queue: PriorityWorkQueue, worker_id: str):
        self.queue = queue
        self.worker_id = worker_id
        self.running = True
    
    async def run(self):
        """Main worker loop"""
        while self.running:
            try:
                # Get next task
                task = await self.queue.dequeue(self.worker_id)
                
                if not task:
                    await asyncio.sleep(1)
                    continue
                
                # Process task
                try:
                    result = await self.process_task(task)
                    await self.queue.complete(task['id'], result)
                except Exception as e:
                    await self.queue.fail(task['id'], str(e))
                    
            except Exception as e:
                print(f"Worker {self.worker_id} error: {e}")
                await asyncio.sleep(1)
    
    async def process_task(self, task: dict):
        """Override this to implement task processing"""
        raise NotImplementedError
```

---

## 🌐 Distributed Coordination

### 6. Leader Election

```python
class LeaderElection:
    """Distributed leader election using Redis"""
    
    def __init__(self, redis_client: redis.Redis, cluster_name: str, node_id: str):
        self.redis = redis_client
        self.cluster_name = cluster_name
        self.node_id = node_id
        self.leader_key = f"leader:{cluster_name}"
        self.ttl = 10  # Leadership expires after 10 seconds
        self.is_leader = False
        self._renewal_task = None
    
    async def start(self):
        """Start leader election process"""
        while True:
            try:
                # Try to become leader
                became_leader = await self.redis.set(
                    self.leader_key,
                    self.node_id,
                    nx=True,  # Only if not exists
                    ex=self.ttl
                )
                
                if became_leader:
                    self.is_leader = True
                    print(f"Node {self.node_id} became leader")
                    
                    # Start renewal
                    self._renewal_task = asyncio.create_task(
                        self._renew_leadership()
                    )
                    
                    # Do leader work
                    await self.leader_work()
                else:
                    # Check who is leader
                    current_leader = await self.redis.get(self.leader_key)
                    
                    if current_leader == self.node_id.encode():
                        # We're still leader
                        continue
                    
                    # Someone else is leader
                    self.is_leader = False
                    await self.follower_work()
                
                await asyncio.sleep(self.ttl / 3)
                
            except Exception as e:
                print(f"Election error: {e}")
                await asyncio.sleep(1)
    
    async def _renew_leadership(self):
        """Renew leadership while active"""
        while self.is_leader:
            await asyncio.sleep(self.ttl / 3)
            
            # Renew if still leader
            lua_script = """
            if redis.call("get", KEYS[1]) == ARGV[1] then
                return redis.call("expire", KEYS[1], ARGV[2])
            else
                return 0
            end
            """
            
            renewed = await self.redis.eval(
                lua_script,
                1,
                self.leader_key,
                self.node_id,
                self.ttl
            )
            
            if not renewed:
                self.is_leader = False
                break
    
    async def leader_work(self):
        """Override this - work done by leader"""
        pass
    
    async def follower_work(self):
        """Override this - work done by followers"""
        pass
```

### 7. Distributed Barrier

```python
class DistributedBarrier:
    """Synchronization barrier for distributed workers"""
    
    def __init__(self, redis_client: redis.Redis, barrier_name: str, participant_count: int):
        self.redis = redis_client
        self.barrier_name = barrier_name
        self.participant_count = participant_count
        self.participants_key = f"barrier:{barrier_name}:participants"
        self.ready_key = f"barrier:{barrier_name}:ready"
    
    async def wait(self, participant_id: str, timeout: float = None):
        """Wait at barrier until all participants arrive"""
        start_time = time.time()
        
        # Register arrival
        await self.redis.sadd(self.participants_key, participant_id)
        await self.redis.expire(self.participants_key, 300)  # 5 min timeout
        
        # Wait for all participants
        while True:
            count = await self.redis.scard(self.participants_key)
            
            if count >= self.participant_count:
                # All participants have arrived
                await self.redis.setex(self.ready_key, 60, "ready")
                return True
            
            if timeout and (time.time() - start_time) > timeout:
                # Timeout - remove ourselves and return
                await self.redis.srem(self.participants_key, participant_id)
                return False
            
            await asyncio.sleep(0.1)
    
    async def reset(self):
        """Reset barrier for reuse"""
        await self.redis.delete(self.participants_key)
        await self.redis.delete(self.ready_key)
```

---

## 🚀 Production Implementation

### Complete Concurrent Processing System

```python
class HarvestConcurrentProcessor:
    """Production-ready concurrent processing system"""
    
    def __init__(self, redis_url: str, max_workers: int = 100):
        self.redis = redis.Redis.from_url(redis_url, decode_responses=True)
        self.max_workers = max_workers
        
        # Resource pools
        self.api_key_pool = ResourcePool(self.redis, "api_keys")
        self.connection_pool = ManagedConnectionPool(
            self.create_ai_connection,
            max_size=20
        )
        
        # Work queue
        self.work_queue = PriorityWorkQueue(
            self.redis,
            "harvest_tasks",
            max_size=10000
        )
        
        # Semaphores for rate limiting
        self.api_semaphore = DistributedSemaphore(
            self.redis,
            "api_rate_limit",
            max_permits=100  # 100 concurrent API calls
        )
        
        # Locks for critical resources
        self.cache_lock = DistributedLock(self.redis, "cache_update")
        
        # Workers
        self.workers = []
    
    async def start(self):
        """Start the processing system"""
        # Start workers
        for i in range(self.max_workers):
            worker = ProcessingWorker(
                worker_id=f"worker_{i}",
                processor=self
            )
            self.workers.append(worker)
            asyncio.create_task(worker.run())
        
        # Start monitoring
        asyncio.create_task(self.monitor())
    
    async def submit_task(self, task_data: dict, priority: int = 0):
        """Submit a task for processing"""
        task_id = str(uuid.uuid4())
        
        success = await self.work_queue.enqueue(
            task_id=task_id,
            task_data=task_data,
            priority=priority
        )
        
        if not success:
            raise QueueFullError("Work queue is at capacity")
        
        return task_id
    
    async def monitor(self):
        """Monitor system health"""
        while True:
            stats = {
                'api_keys': await self.api_key_pool.get_stats(),
                'queue_size': await self.redis.zcard(self.work_queue.queue_name),
                'processing': await self.redis.hlen(self.work_queue.processing_key),
                'workers': len(self.workers)
            }
            
            print(f"System stats: {json.dumps(stats, indent=2)}")
            await asyncio.sleep(10)

class ProcessingWorker(QueueWorker):
    """Worker that processes harvest tasks"""
    
    def __init__(self, worker_id: str, processor: HarvestConcurrentProcessor):
        super().__init__(processor.work_queue, worker_id)
        self.processor = processor
    
    async def process_task(self, task: dict):
        """Process a single task with all safety measures"""
        
        # Claim an API key
        api_key = await self.processor.api_key_pool.claim(
            claimer_id=self.worker_id,
            duration=300
        )
        
        if not api_key:
            raise ResourceUnavailableError("No API keys available")
        
        try:
            # Acquire rate limit permit
            if not await self.processor.api_semaphore.acquire(timeout=30):
                raise RateLimitError("Rate limit exceeded")
            
            try:
                # Get AI connection
                conn = await self.processor.connection_pool.acquire()
                
                try:
                    # Process with the connection
                    result = await self.process_with_ai(
                        task['data'],
                        api_key,
                        conn
                    )
                    
                    # Update cache with lock
                    async with self.processor.cache_lock.lock_context():
                        await self.update_cache(result)
                    
                    return result
                    
                finally:
                    await self.processor.connection_pool.release(conn)
                    
            finally:
                await self.processor.api_semaphore.release()
                
        finally:
            await self.processor.api_key_pool.release(
                api_key['id'],
                self.worker_id
            )
    
    async def process_with_ai(self, data, api_key, conn):
        """Actual AI processing logic"""
        # Your processing logic here
        pass
    
    async def update_cache(self, result):
        """Update shared cache safely"""
        # Your cache update logic here
        pass

# Usage
processor = HarvestConcurrentProcessor(
    redis_url="redis://localhost",
    max_workers=50
)

await processor.start()

# Submit tasks
for i in range(1000):
    await processor.submit_task(
        task_data={'url': f'https://example.com/page{i}'},
        priority=100 if i < 10 else 0  # First 10 are high priority
    )
```

---

## 📊 Performance Considerations

### Tuning for High Concurrency

```python
# Configuration for different scales
CONCURRENCY_CONFIGS = {
    'small': {
        'max_workers': 10,
        'connection_pool_size': 5,
        'api_rate_limit': 20,
        'queue_size': 1000,
        'redis_pool_size': 10
    },
    'medium': {
        'max_workers': 50,
        'connection_pool_size': 20,
        'api_rate_limit': 100,
        'queue_size': 10000,
        'redis_pool_size': 50
    },
    'large': {
        'max_workers': 200,
        'connection_pool_size': 50,
        'api_rate_limit': 500,
        'queue_size': 100000,
        'redis_pool_size': 100
    },
    'xlarge': {
        'max_workers': 1000,
        'connection_pool_size': 200,
        'api_rate_limit': 2000,
        'queue_size': 1000000,
        'redis_pool_size': 500
    }
}
```

### Monitoring Metrics

```python
CONCURRENCY_METRICS = {
    'throughput': 'tasks_per_second',
    'latency': 'task_processing_time_p50_p95_p99',
    'queue_depth': 'pending_tasks_count',
    'resource_utilization': {
        'api_keys': 'percent_in_use',
        'connections': 'percent_in_use',
        'workers': 'percent_busy'
    },
    'errors': {
        'lock_timeouts': 'count_per_minute',
        'resource_exhaustion': 'count_per_minute',
        'task_failures': 'count_per_minute'
    }
}
```

---

## 🎯 Key Takeaways

1. **Always use distributed locks** for shared resources
2. **Implement backpressure** to prevent system overload
3. **Use semaphores** for rate limiting
4. **Pool and reuse** expensive resources
5. **Monitor everything** - you can't optimize what you don't measure
6. **Plan for failure** - every lock can timeout, every claim can fail
7. **Test at scale** - 10 threads work differently than 1000

This system can handle thousands of concurrent operations safely and efficiently! 🚀
