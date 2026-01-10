import { useDbContext } from '@api/db/DbContext';
import { CalendarEvent, CalendarEventType } from '@api/db/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { apiClient } from './apiClient';
import { BackgroundSyncWorker, SyncWorkerState } from './BackgroundSyncWorker';
import { SyncOperationType } from './SyncQueue';

interface SyncStatus {
  isLoading: boolean;
  error: string | null;
  lastSync: Date | null;
  workerState: SyncWorkerState;
  queueSize: number;
  syncStats: {
    totalSyncs: number;
    successfulSyncs: number;
    failedSyncs: number;
    eventsUploaded: number;
    eventsDownloaded: number;
  };
}

export const useSyncEvents = () => {
  const { db } = useDbContext();
  const { isAuthenticated, user } = useAuth();
  const [status, setStatus] = useState<SyncStatus>({
    isLoading: false,
    error: null,
    lastSync: null,
    workerState: SyncWorkerState.IDLE,
    queueSize: 0,
    syncStats: {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      eventsUploaded: 0,
      eventsDownloaded: 0,
    },
  });

  // Background sync worker instance (singleton per hook instance)
  const workerRef = useRef<BackgroundSyncWorker | null>(null);
  const groupIdRef = useRef<string | null>(null);

  /**
   * Initialize background sync worker
   */
  useEffect(() => {
    if (!db || !isAuthenticated) {
      // Stop worker if not authenticated
      if (workerRef.current) {
        workerRef.current.stop();
        workerRef.current = null;
      }
      return;
    }

    // Create worker if it doesn't exist
    if (!workerRef.current) {
      workerRef.current = new BackgroundSyncWorker({
        intervalMs: 7000, // 7 seconds - balance between real-time and performance
        batchSize: 20,
        enabled: true,
        syncOnVisibilityChange: true,
        syncOnNetworkReconnect: true,
      });

      // Initialize worker with database and sync callback
      workerRef.current.init(db, async (type, event) => {
        const groupId = groupIdRef.current;
        if (!groupId) {
          console.error('❌ No group ID set for sync!');
          throw new Error('No group ID set for sync');
        }

        console.log(`🔄 Syncing ${type} event: ${event.name || event.id} to group: ${groupId}`);

        // Execute sync operation based on type
        try {
          switch (type) {
            case SyncOperationType.CREATE:
              await apiClient.createEvent(groupId, {
                date: event.date,
                type: event.type,
                payload: {
                  name: event.name,
                  description: event.description,
                  style: event.style,
                },
              });
              console.log(`✓ Created event: ${event.name}`);
              break;

            case SyncOperationType.UPDATE:
              await apiClient.updateEvent(groupId, event.id, {
                date: event.date,
                type: event.type,
                payload: {
                  name: event.name,
                  description: event.description,
                  style: event.style,
                },
              });
              console.log(`✓ Updated event: ${event.name}`);
              break;

            case SyncOperationType.DELETE:
              await apiClient.deleteEvent(groupId, event.id);
              console.log(`✓ Deleted event: ${event.id}`);
              break;
          }
        } catch (error) {
          console.error(`❌ Failed to sync ${type} event:`, error);
          throw error;
        }
      });

      // Subscribe to worker stats
      workerRef.current.onStats((stats) => {
        setStatus((prev) => ({
          ...prev,
          workerState: stats.state,
          queueSize: stats.queueSize,
          lastSync: stats.lastSyncTime ? new Date(stats.lastSyncTime) : null,
          syncStats: {
            totalSyncs: stats.totalSyncs,
            successfulSyncs: stats.successfulSyncs,
            failedSyncs: stats.failedSyncs,
            eventsUploaded: stats.eventsUploaded,
            eventsDownloaded: stats.eventsDownloaded,
          },
        }));
      });
    }

    return () => {
      // Cleanup on unmount
      if (workerRef.current) {
        workerRef.current.stop();
        workerRef.current = null;
      }
    };
  }, [db, isAuthenticated]);

  /**
   * Start background sync for a specific group
   */
  const startBackgroundSync = useCallback((groupId: string) => {
    console.log(`📍 Setting groupId: ${groupId}`);
    groupIdRef.current = groupId;

    if (!workerRef.current) {
      console.error('❌ Worker not initialized!');
      return;
    }

    const stats = workerRef.current.getStats();
    console.log('📊 Worker stats before start:', stats);

    if (!stats.nextSyncTime) {
      workerRef.current.start();
      console.log(`🔄 Background sync started for group: ${groupId}`);
    } else {
      console.log('ℹ️ Background sync already running');
    }
  }, []);

  /**
   * Stop background sync
   */
  const stopBackgroundSync = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.stop();
      console.log('⏸️ Background sync stopped');
    }
  }, []);

  /**
   * Pause background sync
   */
  const pauseBackgroundSync = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.pause();
    }
  }, []);

  /**
   * Resume background sync
   */
  const resumeBackgroundSync = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.resume();
    }
  }, []);

  /**
   * Force immediate sync
   */
  const forceSyncNow = useCallback(async () => {
    if (workerRef.current) {
      await workerRef.current.forceSyncNow();
    }
  }, []);

  /**
   * Manual upload to remote (legacy method - now handled by background worker)
   * Kept for backwards compatibility
   */
  const syncToRemote = async (groupId: string) => {
    if (!db || !isAuthenticated) {
      throw new Error('Database or authentication not available');
    }

    setStatus((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Use background worker for sync instead
      groupIdRef.current = groupId;
      if (workerRef.current) {
        await workerRef.current.forceSyncNow();
      }

      setStatus((prev) => ({
        ...prev,
        isLoading: false,
        lastSync: new Date(),
      }));
    } catch (error: any) {
      setStatus((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      throw error;
    }
  };

  /**
   * Smart download from remote with conflict resolution
   */
  const smartSyncDown = async (groupId: string) => {
    if (!db || !isAuthenticated) {
      throw new Error('Database or authentication not available');
    }

    setStatus((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // 1. Get remote events
      const remoteEvents = await apiClient.getEvents(groupId);
      const remoteIds = new Set(remoteEvents.map((e) => e._id));

      // 2. Get local events
      const localEvents = await db.getAll('events');
      const localIds = new Set(localEvents.map((e) => e.id));

      let added = 0,
        removed = 0,
        preserved = 0;

      // 3a. Add new remote events
      for (const remoteEvent of remoteEvents) {
        if (!localIds.has(remoteEvent._id)) {
          // Type-safe enum conversion
          let eventType = CalendarEventType.Event; // default
          if (remoteEvent.type && remoteEvent.type in CalendarEventType) {
            eventType =
              CalendarEventType[
                remoteEvent.type as keyof typeof CalendarEventType
              ];
          }

          const localFormat: CalendarEvent = {
            id: remoteEvent._id,
            groupId: remoteEvent.groupId,
            date: remoteEvent.date,
            type: eventType,
            issuer: 'remote',
            creationTime: new Date(remoteEvent.createdAt).getTime(),
            name: remoteEvent.payload?.name || 'Imported Event',
            description: remoteEvent.payload?.description || '',
            style: remoteEvent.payload?.style || {
              background: '#E57373',
              color: '#ffffff',
            },
          };

          await db.add('events', localFormat);
          added++;
        }
      }

      // 3b + 3c. Handle missing events (only if not empty download)
      if (localEvents.length > 0) {
        for (const localEvent of localEvents) {
          if (!remoteIds.has(localEvent.id)) {
            if (localEvent.unsynced) {
              // User wants to keep it - preserve with flag
              preserved++;
              console.log(`Preserved unsynced event: ${localEvent.name}`);
            } else {
              // Safe to remove - was deleted remotely
              await db.delete('events', localEvent.id);
              removed++;
            }
          }
        }
      }

      console.log(
        `Smart sync down: +${added} new, -${removed} deleted, ${preserved} preserved`
      );

      setStatus((prev) => ({
        ...prev,
        isLoading: false,
        lastSync: new Date(),
      }));

      // Update worker's change detector
      if (workerRef.current && db) {
        await workerRef.current.getChangeDetector().takeSnapshot(db);
      }

      return { added, removed, preserved };
    } catch (error: any) {
      setStatus((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      throw error;
    }
  };

  const autoSyncIfEmpty = async (groupId: string) => {
    if (!db) return false;

    const localCount = await db.count('events');

    if (localCount === 0) {
      console.log('No local events, auto-downloading...');
      await smartSyncDown(groupId);
      return true;
    }

    return false;
  };

  const fullSync = async (groupId: string) => {
    await smartSyncDown(groupId); // Download first
    await syncToRemote(groupId); // Then upload any local changes
  };

  /**
   * Get current sync worker stats
   */
  const getSyncStats = useCallback(() => {
    return workerRef.current?.getStats() || null;
  }, []);

  /**
   * Get pending operations count
   */
  const getPendingOperations = useCallback(() => {
    return workerRef.current?.getQueue().getPending() || [];
  }, []);

  return {
    // Legacy methods (for backwards compatibility)
    syncToRemote,
    syncFromRemote: smartSyncDown,
    fullSync,
    autoSyncIfEmpty,

    // New background sync methods
    startBackgroundSync,
    stopBackgroundSync,
    pauseBackgroundSync,
    resumeBackgroundSync,
    forceSyncNow,
    getSyncStats,
    getPendingOperations,

    // Status
    status,
    canSync: isAuthenticated && !!db,
    isBackgroundSyncActive:
      workerRef.current?.getStats().state !== SyncWorkerState.IDLE,
  };
};
