import { useDbContext } from '@api/db/DbContext';
import { CalendarEvent, CalendarEventType } from '@api/db/types';
import { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { apiClient } from './apiClient';

interface SyncStatus {
  isLoading: boolean;
  error: string | null;
  lastSync: Date | null;
}

export const useSyncEvents = () => {
  const { db } = useDbContext();
  const { isAuthenticated, user } = useAuth();
  const [status, setStatus] = useState<SyncStatus>({
    isLoading: false,
    error: null,
    lastSync: null,
  });

  const syncToRemote = async (groupId: string) => {
    if (!db || !isAuthenticated) {
      throw new Error('Database or authentication not available');
    }

    setStatus((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // 1. Get all local events
      const localEvents = await db.getAll('events');

      // 2. Upload events in batches to avoid overwhelming backend
      const BATCH_SIZE = 10;
      const batches = [];
      for (let i = 0; i < localEvents.length; i += BATCH_SIZE) {
        batches.push(localEvents.slice(i, i + BATCH_SIZE));
      }

      console.log(
        `Uploading ${localEvents.length} events in ${batches.length} batches...`
      );

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(
          `Processing batch ${i + 1}/${batches.length} (${batch.length} events)`
        );

        for (const event of batch) {
          try {
            await apiClient.createEvent(groupId, {
              date: event.date,
              type: event.type,
              payload: {
                name: event.name,
                description: event.description,
                style: event.style,
              },
            });
          } catch (error: any) {
            console.warn(`Failed to sync event ${event.id}:`, error.message);
            // Continue with other events
          }
        }

        // Small delay between batches
        if (i < batches.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
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
    await syncToRemote(groupId);
    await smartSyncDown(groupId);
  };

  return {
    syncToRemote,
    syncFromRemote: smartSyncDown,
    fullSync,
    autoSyncIfEmpty,
    status,
    canSync: isAuthenticated && !!db,
  };
};
