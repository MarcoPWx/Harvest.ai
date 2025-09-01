/**
 * SSE (Server-Sent Events) Client with Backpressure Handling
 * Per AGENT_BOOT: Production-grade streaming implementation
 * 
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Backpressure handling to prevent overwhelming the client
 * - Circuit breaker integration for fault tolerance
 * - Message queuing and buffering
 * - Progress tracking and metrics
 */

import { CircuitBreaker, createCircuitBreaker, ExponentialBackoff } from '../patterns/circuit-breaker';

export interface SSEConfig {
  url: string;
  reconnectTimeout?: number;
  maxReconnectAttempts?: number;
  bufferSize?: number;
  backpressureThreshold?: number;
  heartbeatInterval?: number;
}

export interface SSEMessage {
  id?: string;
  event?: string;
  data: string;
  retry?: number;
  timestamp: number;
}

export interface SSEMetrics {
  messagesReceived: number;
  bytesReceived: number;
  reconnections: number;
  errors: number;
  bufferSize: number;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastHeartbeat?: number;
}

export type SSEEventHandler = (message: SSEMessage) => void | Promise<void>;
export type SSEErrorHandler = (error: Error) => void;
export type SSEStateChangeHandler = (state: SSEMetrics['connectionState']) => void;

export class SSEClient {
  private eventSource: EventSource | null = null;
  private config: Required<SSEConfig>;
  private messageBuffer: SSEMessage[] = [];
  private metrics: SSEMetrics;
  private circuitBreaker: CircuitBreaker<void>;
  private backoff: ExponentialBackoff;
  private reconnectAttempts = 0;
  private isProcessing = false;
  private abortController: AbortController | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  
  // Event handlers
  private messageHandlers: Set<SSEEventHandler> = new Set();
  private errorHandlers: Set<SSEErrorHandler> = new Set();
  private stateChangeHandlers: Set<SSEStateChangeHandler> = new Set();
  
  constructor(config: SSEConfig) {
    this.config = {
      url: config.url,
      reconnectTimeout: config.reconnectTimeout ?? 5000,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 10,
      bufferSize: config.bufferSize ?? 100,
      backpressureThreshold: config.backpressureThreshold ?? 50,
      heartbeatInterval: config.heartbeatInterval ?? 30000
    };
    
    this.metrics = {
      messagesReceived: 0,
      bytesReceived: 0,
      reconnections: 0,
      errors: 0,
      bufferSize: 0,
      connectionState: 'disconnected'
    };
    
    this.circuitBreaker = createCircuitBreaker({
      failureThreshold: 5,
      recoveryTimeout: this.config.reconnectTimeout * 2
    });
    
    this.backoff = new ExponentialBackoff(
      1000,
      this.config.reconnectTimeout,
      2
    );
  }
  
  /**
   * Connect to SSE endpoint with automatic retry
   */
  async connect(): Promise<void> {
    if (this.eventSource) {
      console.warn('[SSEClient] Already connected');
      return;
    }
    
    this.updateState('connecting');
    
    try {
      await this.circuitBreaker.execute(
        () => this.establishConnection(),
        () => this.handleConnectionFailure()
      );
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }
  
  private async establishConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.abortController = new AbortController();
        
        // Create EventSource with credentials
        this.eventSource = new EventSource(this.config.url);
        
        // Connection opened
        this.eventSource.onopen = () => {
          console.log('[SSEClient] Connection established');
          this.updateState('connected');
          this.reconnectAttempts = 0;
          this.backoff.reset();
          this.startHeartbeat();
          resolve();
        };
        
        // Message received
        this.eventSource.onmessage = (event) => {
          this.handleMessage(event);
        };
        
        // Error occurred
        this.eventSource.onerror = (event) => {
          console.error('[SSEClient] Connection error', event);
          this.updateState('error');
          this.metrics.errors++;
          
          // EventSource will auto-reconnect, but we control it
          this.eventSource?.close();
          this.eventSource = null;
          
          reject(new Error('SSE connection failed'));
        };
        
        // Custom event handlers
        this.eventSource.addEventListener('progress', (event) => {
          this.handleMessage(event, 'progress');
        });
        
        this.eventSource.addEventListener('complete', (event) => {
          this.handleMessage(event, 'complete');
        });
        
        this.eventSource.addEventListener('error', (event) => {
          this.handleMessage(event, 'error');
        });
        
        this.eventSource.addEventListener('heartbeat', (event) => {
          this.metrics.lastHeartbeat = Date.now();
        });
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  private handleMessage(event: MessageEvent, eventType?: string): void {
    const message: SSEMessage = {
      id: event.lastEventId || undefined,
      event: eventType || event.type,
      data: event.data,
      timestamp: Date.now()
    };
    
    // Update metrics
    this.metrics.messagesReceived++;
    this.metrics.bytesReceived += new Blob([event.data]).size;
    
    // Check backpressure
    if (this.messageBuffer.length >= this.config.backpressureThreshold) {
      console.warn('[SSEClient] Backpressure threshold reached, applying flow control');
      this.applyBackpressure();
    }
    
    // Buffer message
    this.messageBuffer.push(message);
    if (this.messageBuffer.length > this.config.bufferSize) {
      // Remove oldest messages if buffer is full
      this.messageBuffer.shift();
    }
    
    this.metrics.bufferSize = this.messageBuffer.length;
    
    // Process messages
    this.processMessages();
  }
  
  private async processMessages(): Promise<void> {
    if (this.isProcessing || this.messageBuffer.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      while (this.messageBuffer.length > 0) {
        const message = this.messageBuffer.shift();
        if (!message) break;
        
        // Notify all handlers
        for (const handler of this.messageHandlers) {
          try {
            await handler(message);
          } catch (error) {
            console.error('[SSEClient] Handler error:', error);
            this.handleError(error as Error);
          }
        }
      }
    } finally {
      this.isProcessing = false;
      this.metrics.bufferSize = this.messageBuffer.length;
    }
  }
  
  private applyBackpressure(): void {
    // Implement backpressure strategies
    // 1. Slow down processing
    // 2. Drop less important messages
    // 3. Request server to slow down (if supported)
    
    // For now, we'll drop old messages if buffer is too full
    const overflow = this.messageBuffer.length - this.config.backpressureThreshold;
    if (overflow > 0) {
      const dropped = this.messageBuffer.splice(0, overflow);
      console.warn(`[SSEClient] Dropped ${dropped.length} messages due to backpressure`);
    }
  }
  
  private async handleConnectionFailure(): Promise<void> {
    this.reconnectAttempts++;
    
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      const error = new Error(`Max reconnection attempts (${this.config.maxReconnectAttempts}) reached`);
      this.handleError(error);
      throw error;
    }
    
    const delay = this.backoff.nextDelay();
    console.log(`[SSEClient] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    this.metrics.reconnections++;
    await this.connect();
  }
  
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      const lastHeartbeat = this.metrics.lastHeartbeat || 0;
      const timeSinceHeartbeat = Date.now() - lastHeartbeat;
      
      if (timeSinceHeartbeat > this.config.heartbeatInterval * 2) {
        console.warn('[SSEClient] Heartbeat timeout, reconnecting...');
        this.disconnect();
        this.connect().catch(error => this.handleError(error));
      }
    }, this.config.heartbeatInterval);
  }
  
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
  
  /**
   * Disconnect from SSE endpoint
   */
  disconnect(): void {
    this.stopHeartbeat();
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    
    this.updateState('disconnected');
  }
  
  /**
   * Subscribe to messages
   */
  onMessage(handler: SSEEventHandler): () => void {
    this.messageHandlers.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.messageHandlers.delete(handler);
    };
  }
  
  /**
   * Subscribe to errors
   */
  onError(handler: SSEErrorHandler): () => void {
    this.errorHandlers.add(handler);
    
    return () => {
      this.errorHandlers.delete(handler);
    };
  }
  
  /**
   * Subscribe to state changes
   */
  onStateChange(handler: SSEStateChangeHandler): () => void {
    this.stateChangeHandlers.add(handler);
    
    return () => {
      this.stateChangeHandlers.delete(handler);
    };
  }
  
  private updateState(state: SSEMetrics['connectionState']): void {
    this.metrics.connectionState = state;
    
    for (const handler of this.stateChangeHandlers) {
      try {
        handler(state);
      } catch (error) {
        console.error('[SSEClient] State change handler error:', error);
      }
    }
  }
  
  private handleError(error: Error): void {
    for (const handler of this.errorHandlers) {
      try {
        handler(error);
      } catch (handlerError) {
        console.error('[SSEClient] Error handler failed:', handlerError);
      }
    }
  }
  
  /**
   * Get current metrics
   */
  getMetrics(): SSEMetrics {
    return { ...this.metrics };
  }
  
  /**
   * Clear message buffer
   */
  clearBuffer(): void {
    this.messageBuffer = [];
    this.metrics.bufferSize = 0;
  }
  
  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.metrics.connectionState === 'connected';
  }
}

/**
 * Factory function to create SSE client with streaming for content generation
 */
export function createContentGeneratorSSE(
  apiKey?: string,
  options?: Partial<SSEConfig>
): SSEClient {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const url = `${baseUrl}/api/generate/stream`;
  
  return new SSEClient({
    url,
    reconnectTimeout: 5000,
    maxReconnectAttempts: 3,
    bufferSize: 50,
    backpressureThreshold: 25,
    heartbeatInterval: 30000,
    ...options
  });
}

/**
 * Helper to parse SSE data for content generation
 */
export function parseContentChunk(data: string): {
  content?: string;
  progress?: number;
  error?: string;
  complete?: boolean;
} {
  try {
    return JSON.parse(data);
  } catch {
    // Plain text chunk
    return { content: data };
  }
}
