import { AlternatingCareDBSchema } from '@api/db/schema';
import { CalendarEvent } from '@api/db/types';
import { IDBPDatabase } from 'idb';
import { ChangeDetector } from './ChangeDetector';
import { SyncOperationType, SyncQueue } from './SyncQueue';

export enum SyncWorkerState {
  IDLE = 'IDLE',
  SYNCING = 'SYNCING',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR',
}

interface SyncWorkerConfig {
  intervalMs: number; // How often to check for changes (default 5-10 sec)
  batchSize: number; // Max operations per sync cycle
  enabled: boolean; // Can pause/resume
  syncOnVisibilityChange: boolean; // Sync when tab becomes visible
  syncOnNetworkReconnect: boolean; // Sync when network reconnects
}

interface SyncWorkerStats {
  state: SyncWorkerState;
  lastSyncTime: number | null;
  nextSyncTime: number | null;
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  eventsUploaded: number;
  eventsDownloaded: number;
  queueSize: number;
}

type SyncCallback = (
  operation: SyncOperationType,
  event: CalendarEvent
) => Promise<void>;

/**
 * Background worker that automatically syncs changes every 5-10 seconds
 * Handles visibility changes, network reconnection, and intelligent scheduling
 */
export class BackgroundSyncWorker {
  private config: SyncWorkerConfig;
  private state: SyncWorkerState = SyncWorkerState.IDLE;
  private intervalId: number | null = null;
  private lastSyncTime: number | null = null;
  private nextSyncTime: number | null = null;

  // Statistics
  private totalSyncs = 0;
  private successfulSyncs = 0;
  private failedSyncs = 0;
  private eventsUploaded = 0;
  private eventsDownloaded = 0;

  // Callbacks
  private onStateChange?: (stats: SyncWorkerStats) => void;
  private syncCallback?: SyncCallback;

  // Dependencies
  private db: IDBPDatabase<AlternatingCareDBSchema> | null = null;
  private changeDetector: ChangeDetector;
  private syncQueue: SyncQueue;

  constructor(config?: Partial<SyncWorkerConfig>) {
    this.config = {
      intervalMs: 7000, // Default 7 seconds
      batchSize: 20,
      enabled: true,
      syncOnVisibilityChange: true,
      syncOnNetworkReconnect: true,
      ...config,
    };

    this.changeDetector = new ChangeDetector();
    this.syncQueue = new SyncQueue();

    this.setupEventListeners();
  }

  /**
   * Initialize with database and sync callback
   */
  init(
    db: IDBPDatabase<AlternatingCareDBSchema>,
    syncCallback: SyncCallback
  ): void {
    this.db = db;
    this.syncCallback = syncCallback;
  }

  /**
   * Start background sync worker
   */
  start(): void {
    console.log('🎬 BackgroundSyncWorker.start() called');

    if (!this.db || !this.syncCallback) {
      console.error(
        '❌ BackgroundSyncWorker not initialized - db:',
        !!this.db,
        'callback:',
        !!this.syncCallback
      );
      return;
    }

    if (this.intervalId !== null) {
      console.warn(
        '⚠️ BackgroundSyncWorker already running (intervalId:',
        this.intervalId,
        ')'
      );
      return;
    }

    this.config.enabled = true;
    this.setState(SyncWorkerState.IDLE);

    console.log(
      '📸 Skipping initial snapshot - will detect unsynced events on first tick'
    );

    // Start interval
    this.intervalId = window.setInterval(() => {
      this.tick();
    }, this.config.intervalMs);

    this.nextSyncTime = Date.now() + this.config.intervalMs;
    this.notifyStateChange();

    console.log(
      `✅ BackgroundSyncWorker started (interval: ${this.config.intervalMs}ms)`
    );
    console.log('⏱️ First sync will trigger in 1 second...');

    // Trigger immediate first sync to catch any unsynced events
    setTimeout(() => {
      console.log('🔔 Triggering first sync tick...');
      this.tick();
    }, 1000);
  }

  /**
   * Stop background sync worker
   */
  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.setState(SyncWorkerState.IDLE);
    this.nextSyncTime = null;
    this.notifyStateChange();

    console.log('BackgroundSyncWorker stopped');
  }

  /**
   * Pause sync (keeps running but skips sync operations)
   */
  pause(): void {
    this.config.enabled = false;
    this.setState(SyncWorkerState.PAUSED);
    this.notifyStateChange();
    console.log('BackgroundSyncWorker paused');
  }

  /**
   * Resume sync
   */
  resume(): void {
    this.config.enabled = true;
    this.setState(SyncWorkerState.IDLE);
    this.notifyStateChange();
    console.log('BackgroundSyncWorker resumed');
  }

  /**
   * Force immediate sync
   */
  async forceSyncNow(): Promise<void> {
    if (!this.config.enabled) {
      console.warn('BackgroundSyncWorker is paused');
      return;
    }

    await this.performSync();
  }

  /**
   * Main sync tick - called every interval
   */
  private async tick(): Promise<void> {
    if (!this.config.enabled || !this.db || !this.syncCallback) {
      return;
    }

    if (this.state === SyncWorkerState.SYNCING) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    this.nextSyncTime = Date.now() + this.config.intervalMs;

    // Check if there are changes to sync
    const hasChanges = await this.changeDetector.hasChanges(this.db);
    const hasQueuedOperations = !this.syncQueue.isEmpty();

    if (hasChanges || hasQueuedOperations) {
      console.log(
        `🔄 Changes detected: ${hasChanges}, Queued operations: ${this.syncQueue.size()}`
      );
      await this.performSync();
    } else {
      console.log('✅ No changes detected, skipping sync');
    }
  }

  /**
   * Perform sync operation
   */
  private async performSync(): Promise<void> {
    if (!this.db || !this.syncCallback) return;

    this.setState(SyncWorkerState.SYNCING);
    this.totalSyncs++;
    const syncStartTime = Date.now();

    try {
      // 1. Process queued operations (retry failed uploads)
      const processedCount = await this.processQueue();
      this.eventsUploaded += processedCount;

      // 2. Detect and queue new changes
      const changes = await this.changeDetector.detectChanges(this.db);

      console.log(
        `📊 Change detection: ${changes.created.length} created, ${changes.updated.length} updated, ${changes.deleted.length} deleted`
      );

      for (const event of changes.created) {
        this.syncQueue.enqueue(SyncOperationType.CREATE, event);
      }

      for (const event of changes.updated) {
        this.syncQueue.enqueue(SyncOperationType.UPDATE, event);
      }

      for (const eventId of changes.deleted) {
        // Create tombstone for deleted event
        const tombstone: CalendarEvent = {
          id: eventId,
          groupId: '',
          date: '',
          type: 'EVENT' as any,
          issuer: 'local',
          creationTime: Date.now(),
          deleted: true,
          deletedAt: Date.now(),
        };
        this.syncQueue.enqueue(SyncOperationType.DELETE, tombstone);
      }

      // 3. Process newly queued operations
      const newProcessedCount = await this.processQueue();
      this.eventsUploaded += newProcessedCount;

      // 4. Update snapshot
      await this.changeDetector.takeSnapshot(this.db);

      this.lastSyncTime = Date.now();
      this.successfulSyncs++;
      this.setState(SyncWorkerState.IDLE);

      const duration = Date.now() - syncStartTime;
      console.log(
        `Sync completed in ${duration}ms (${processedCount + newProcessedCount} operations)`
      );
    } catch (error) {
      console.error('Sync failed:', error);
      this.failedSyncs++;
      this.setState(SyncWorkerState.ERROR);

      // Auto-retry after error
      setTimeout(() => {
        if (this.state === SyncWorkerState.ERROR) {
          this.setState(SyncWorkerState.IDLE);
        }
      }, 5000);
    }

    this.notifyStateChange();
  }

  /**
   * Process operations from queue
   */
  private async processQueue(): Promise<number> {
    if (!this.syncCallback) return 0;

    let processed = 0;
    const maxOperations = this.config.batchSize;

    while (processed < maxOperations) {
      const operation = this.syncQueue.getNext();
      if (!operation) break;

      this.syncQueue.setProcessing(true);

      try {
        // Execute sync callback
        await this.syncCallback(operation.type, operation.event);

        // Mark as successful in queue
        this.syncQueue.markSuccess(operation.id);
        this.changeDetector.markAsSynced([operation.event]);

        // Clear unsynced flag in database
        if (this.db && !operation.event.deleted) {
          try {
            const eventInDb = await this.db.get('events', operation.event.id);
            if (eventInDb) {
              await this.db.put('events', {
                ...eventInDb,
                unsynced: false,
                lastEditTime: undefined,
              });
            }
          } catch (dbError) {
            console.warn('Failed to clear unsynced flag:', dbError);
          }
        }

        processed++;
      } catch (error: any) {
        // Mark as failed - will be retried with exponential backoff
        this.syncQueue.markFailed(
          operation.id,
          error.message || 'Unknown error'
        );
      }
    }

    this.syncQueue.setProcessing(false);

    return processed;
  }

  /**
   * Setup event listeners for visibility and network changes
   */
  private setupEventListeners(): void {
    // Sync when tab becomes visible
    if (this.config.syncOnVisibilityChange && typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.config.enabled) {
          console.log('Tab visible - triggering sync');
          this.forceSyncNow();
        }
      });
    }

    // Sync when network reconnects
    if (this.config.syncOnNetworkReconnect && typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('Network reconnected - triggering sync');
        this.forceSyncNow();
      });
    }
  }

  /**
   * Get current statistics
   */
  getStats(): SyncWorkerStats {
    return {
      state: this.state,
      lastSyncTime: this.lastSyncTime,
      nextSyncTime: this.nextSyncTime,
      totalSyncs: this.totalSyncs,
      successfulSyncs: this.successfulSyncs,
      failedSyncs: this.failedSyncs,
      eventsUploaded: this.eventsUploaded,
      eventsDownloaded: this.eventsDownloaded,
      queueSize: this.syncQueue.size(),
    };
  }

  /**
   * Subscribe to state changes
   */
  onStats(callback: (stats: SyncWorkerStats) => void): () => void {
    this.onStateChange = callback;
    return () => {
      this.onStateChange = undefined;
    };
  }

  /**
   * Get sync queue instance (for debugging)
   */
  getQueue(): SyncQueue {
    return this.syncQueue;
  }

  /**
   * Get change detector instance (for debugging)
   */
  getChangeDetector(): ChangeDetector {
    return this.changeDetector;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SyncWorkerConfig>): void {
    const oldInterval = this.config.intervalMs;
    this.config = { ...this.config, ...config };

    // Restart if interval changed
    if (oldInterval !== this.config.intervalMs && this.intervalId !== null) {
      this.stop();
      this.start();
    }
  }

  private setState(state: SyncWorkerState): void {
    this.state = state;
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.getStats());
    }
  }
}
