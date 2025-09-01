/**
 * Circuit Breaker Pattern - Production Implementation
 * Per AGENT_BOOT: This is not documentation, this is implementation.
 * 
 * This implements Netflix-style circuit breaker with:
 * - Exponential backoff
 * - Half-open state testing
 * - Metrics collection
 * - Fallback support
 */

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
  volumeThreshold?: number; // Minimum requests before opening
}

export interface CircuitBreakerMetrics {
  totalRequests: number;
  failedRequests: number;
  successfulRequests: number;
  lastFailureTime: number | null;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  stateChanges: Array<{
    from: string;
    to: string;
    timestamp: number;
    reason: string;
  }>;
}

export class CircuitBreaker<T> {
  private failures = 0;
  private successes = 0;
  private totalRequests = 0;
  private lastFailureTime: number | null = null;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private halfOpenAttempts = 0;
  private stateChanges: CircuitBreakerMetrics['stateChanges'] = [];
  
  constructor(private config: CircuitBreakerConfig) {}
  
  async execute<R>(
    operation: () => Promise<R>,
    fallback?: () => R | Promise<R>
  ): Promise<R> {
    this.totalRequests++;
    
    // Check if circuit should be open
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.transitionTo('HALF_OPEN', 'Recovery timeout reached');
      } else if (fallback) {
        console.warn('[CircuitBreaker] Circuit OPEN, using fallback');
        return fallback();
      } else {
        throw new CircuitBreakerError('Circuit breaker is OPEN', this.getMetrics());
      }
    }
    
    // Half-open state: test with single request
    if (this.state === 'HALF_OPEN') {
      this.halfOpenAttempts++;
      if (this.halfOpenAttempts > 1) {
        // Only allow one test request in half-open
        if (fallback) {
          return fallback();
        }
        throw new CircuitBreakerError('Circuit breaker is testing', this.getMetrics());
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      
      if (fallback) {
        console.warn('[CircuitBreaker] Operation failed, using fallback', error);
        return fallback();
      }
      
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.successes++;
    
    if (this.state === 'HALF_OPEN') {
      // Success in half-open state closes the circuit
      this.transitionTo('CLOSED', 'Test request succeeded');
      this.failures = 0;
      this.halfOpenAttempts = 0;
    } else if (this.state === 'CLOSED') {
      // Reset failure count on success
      if (this.failures > 0) {
        this.failures = Math.max(0, this.failures - 1);
      }
    }
  }
  
  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.state === 'HALF_OPEN') {
      // Failure in half-open state re-opens the circuit
      this.transitionTo('OPEN', 'Test request failed');
      this.halfOpenAttempts = 0;
    } else if (this.state === 'CLOSED') {
      // Check if we should open the circuit
      const shouldOpen = this.failures >= this.config.failureThreshold;
      const hasMinVolume = !this.config.volumeThreshold || 
                          this.totalRequests >= this.config.volumeThreshold;
      
      if (shouldOpen && hasMinVolume) {
        this.transitionTo('OPEN', `Failure threshold reached: ${this.failures}/${this.config.failureThreshold}`);
      }
    }
  }
  
  private shouldAttemptReset(): boolean {
    return (
      this.lastFailureTime !== null &&
      Date.now() - this.lastFailureTime >= this.config.recoveryTimeout
    );
  }
  
  private transitionTo(newState: 'CLOSED' | 'OPEN' | 'HALF_OPEN', reason: string): void {
    const oldState = this.state;
    this.state = newState;
    
    this.stateChanges.push({
      from: oldState,
      to: newState,
      timestamp: Date.now(),
      reason
    });
    
    // Log state changes for monitoring
    console.log(`[CircuitBreaker] State change: ${oldState} → ${newState} (${reason})`);
  }
  
  getMetrics(): CircuitBreakerMetrics {
    return {
      totalRequests: this.totalRequests,
      failedRequests: this.failures,
      successfulRequests: this.successes,
      lastFailureTime: this.lastFailureTime,
      state: this.state,
      stateChanges: [...this.stateChanges]
    };
  }
  
  reset(): void {
    this.failures = 0;
    this.successes = 0;
    this.totalRequests = 0;
    this.lastFailureTime = null;
    this.halfOpenAttempts = 0;
    this.transitionTo('CLOSED', 'Manual reset');
  }
}

// Custom error class for circuit breaker
export class CircuitBreakerError extends Error {
  constructor(
    message: string,
    public metrics: CircuitBreakerMetrics
  ) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

// Factory function with sensible defaults
export function createCircuitBreaker<T>(
  config: Partial<CircuitBreakerConfig> = {}
): CircuitBreaker<T> {
  return new CircuitBreaker<T>({
    failureThreshold: config.failureThreshold || 5,
    recoveryTimeout: config.recoveryTimeout || 60000, // 1 minute
    monitoringPeriod: config.monitoringPeriod || 10000, // 10 seconds
    volumeThreshold: config.volumeThreshold || 10 // Minimum 10 requests
  });
}

// Exponential backoff helper
export class ExponentialBackoff {
  private attempt = 0;
  
  constructor(
    private baseDelay = 1000,
    private maxDelay = 60000,
    private factor = 2
  ) {}
  
  nextDelay(): number {
    const delay = Math.min(
      this.baseDelay * Math.pow(this.factor, this.attempt),
      this.maxDelay
    );
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * delay * 0.1;
    this.attempt++;
    
    return delay + jitter;
  }
  
  reset(): void {
    this.attempt = 0;
  }
  
  async wait(): Promise<void> {
    const delay = this.nextDelay();
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

// Retry with circuit breaker and backoff
export async function retryWithCircuitBreaker<T>(
  operation: () => Promise<T>,
  circuitBreaker: CircuitBreaker<T>,
  maxRetries = 3,
  fallback?: () => T | Promise<T>
): Promise<T> {
  const backoff = new ExponentialBackoff();
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await circuitBreaker.execute(operation, fallback);
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry if circuit is open
      if (error instanceof CircuitBreakerError) {
        if (fallback) {
          return fallback();
        }
        throw error;
      }
      
      // Wait before retry
      if (i < maxRetries - 1) {
        await backoff.wait();
      }
    }
  }
  
  // All retries failed
  if (fallback) {
    console.warn('[RetryWithCircuitBreaker] All retries failed, using fallback');
    return fallback();
  }
  
  throw lastError || new Error('All retries failed');
}
