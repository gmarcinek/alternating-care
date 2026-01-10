import { CalendarEvent } from '@api/db/types';

export enum SyncOperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export interface SyncOperation {
  id: string;
  type: SyncOperationType;
  event: CalendarEvent;
  retries: number;
  maxRetries: number;
  nextRetry: number | null;
  createdAt: number;
  lastAttempt: number | null;
  error: string | null;
  priority: number; // Higher = more important (ALTERNATING events get priority)
}

interface SyncQueueState {
  operations: SyncOperation[];
  processing: boolean;
  lastProcessedAt: number | null;
}

const STORAGE_KEY = 'sync_queue_v1';
const MAX_RETRIES = 5;
const BASE_RETRY_DELAY = 2000; // 2 seconds
const MAX_RETRY_DELAY = 300000; // 5 minutes

export class SyncQueue {
  private queue: SyncOperation[] = [];
  private processing = false;
  private onQueueChange?: () => void;

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Add operation to queue with priority for ALTERNATING events
   */
  enqueue(
    type: SyncOperationType,
    event: CalendarEvent,
    priority?: number
  ): string {
    const operationId = `${type}_${event.id}_${Date.now()}`;

    // ALTERNATING events get higher priority
    const isAlternating = event.type === 'ALTERNATING';
    const calculatedPriority = priority ?? (isAlternating ? 10 : 5);

    const operation: SyncOperation = {
      id: operationId,
      type,
      event,
      retries: 0,
      maxRetries: MAX_RETRIES,
      nextRetry: null,
      createdAt: Date.now(),
      lastAttempt: null,
      error: null,
      priority: calculatedPriority,
    };

    // Remove duplicate operations for the same event
    this.queue = this.queue.filter(
      (op) => !(op.event.id === event.id && op.type === type)
    );

    this.queue.push(operation);
    this.sortQueue();
    this.saveToStorage();
    this.notifyChange();

    return operationId;
  }

  /**
   * Remove operation from queue
   */
  dequeue(operationId: string): boolean {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter((op) => op.id !== operationId);

    if (this.queue.length !== initialLength) {
      this.saveToStorage();
      this.notifyChange();
      return true;
    }

    return false;
  }

  /**
   * Get next operation ready to process
   */
  getNext(): SyncOperation | null {
    const now = Date.now();

    // Find first operation that's ready (sorted by priority)
    for (const op of this.queue) {
      if (op.nextRetry === null || op.nextRetry <= now) {
        return op;
      }
    }

    return null;
  }

  /**
   * Mark operation as failed and schedule retry with exponential backoff
   */
  markFailed(operationId: string, error: string): void {
    const operation = this.queue.find((op) => op.id === operationId);

    if (!operation) return;

    operation.retries++;
    operation.lastAttempt = Date.now();
    operation.error = error;

    if (operation.retries >= operation.maxRetries) {
      // Max retries exceeded - remove from queue
      console.error(
        `Operation ${operationId} failed after ${operation.maxRetries} retries:`,
        error
      );
      this.dequeue(operationId);
      return;
    }

    // Calculate exponential backoff: 2s, 4s, 8s, 16s, 32s (capped at 5 min)
    const delay = Math.min(
      BASE_RETRY_DELAY * Math.pow(2, operation.retries),
      MAX_RETRY_DELAY
    );

    operation.nextRetry = Date.now() + delay;

    console.log(
      `Operation ${operationId} failed (attempt ${operation.retries}/${operation.maxRetries}). Retrying in ${delay}ms`
    );

    this.saveToStorage();
    this.notifyChange();
  }

  /**
   * Mark operation as successful
   */
  markSuccess(operationId: string): void {
    this.dequeue(operationId);
  }

  /**
   * Sort queue by priority (high to low) then by creation time (old to new)
   */
  private sortQueue(): void {
    this.queue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return a.createdAt - b.createdAt; // Older first
    });
  }

  /**
   * Get all pending operations
   */
  getPending(): SyncOperation[] {
    return [...this.queue];
  }

  /**
   * Get operations ready for processing
   */
  getReady(): SyncOperation[] {
    const now = Date.now();
    return this.queue.filter(
      (op) => op.nextRetry === null || op.nextRetry <= now
    );
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Clear all operations
   */
  clear(): void {
    this.queue = [];
    this.saveToStorage();
    this.notifyChange();
  }

  /**
   * Set processing state
   */
  setProcessing(processing: boolean): void {
    this.processing = processing;
    this.notifyChange();
  }

  /**
   * Check if queue is currently processing
   */
  isProcessing(): boolean {
    return this.processing;
  }

  /**
   * Subscribe to queue changes
   */
  onChange(callback: () => void): () => void {
    this.onQueueChange = callback;
    return () => {
      this.onQueueChange = undefined;
    };
  }

  private notifyChange(): void {
    if (this.onQueueChange) {
      this.onQueueChange();
    }
  }

  /**
   * Persist queue to localStorage
   */
  private saveToStorage(): void {
    try {
      const state: SyncQueueState = {
        operations: this.queue,
        processing: this.processing,
        lastProcessedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save sync queue to storage:', error);
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state: SyncQueueState = JSON.parse(stored);
        this.queue = state.operations || [];
        this.sortQueue();
        console.log(`Loaded ${this.queue.length} operations from storage`);
      }
    } catch (error) {
      console.error('Failed to load sync queue from storage:', error);
      this.queue = [];
    }
  }

  /**
   * Get statistics about the queue
   */
  getStats() {
    const ready = this.getReady().length;
    const waiting = this.queue.filter(
      (op) => op.nextRetry && op.nextRetry > Date.now()
    ).length;
    const failed = this.queue.filter((op) => op.retries > 0).length;

    return {
      total: this.queue.length,
      ready,
      waiting,
      failed,
      processing: this.processing,
    };
  }
}
