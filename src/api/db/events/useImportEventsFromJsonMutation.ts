import { CalendarEvent } from '@api/db/types';
import { useMutation } from '@tanstack/react-query';
import { useDbContext } from '../../../api/db/DbContext';

export const useImportEventsFromJsonMutation = (
  groupId: string,
  props: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  } = {}
) => {
  const { onSuccess = () => {}, onError = () => {} } = props;
  const { db } = useDbContext();

  const mutation = useMutation({
    mutationFn: async (events: CalendarEvent[]) => {
      if (!db) {
        throw new Error('Database not available');
      }

      try {
        const transaction = db.transaction('events', 'readwrite');
        const store = transaction.objectStore('events');

        if (!store.indexNames.contains('by-groupId')) {
          throw new Error('Index "by-groupId" not found');
        }

        const index = store.index('by-groupId');
        const keyRange = IDBKeyRange.only(groupId);
        const allEvents = await index.getAll(keyRange);

        let updatedCount = 0;
        let addedCount = 0;
        let skippedCount = 0;

        // Process each imported event
        for (const event of events) {
          const existingEvent = allEvents.find(
            (existing) => existing.id === event.id
          );

          if (existingEvent) {
            // Event exists - check if safe to update
            if (existingEvent.unsynced) {
              // Skip updating unsynced events - user has local changes
              skippedCount++;
              console.log(
                `Skipped unsynced event: ${existingEvent.name || existingEvent.id}`
              );
            } else {
              // Safe to update - no local changes
              const updatedEvent = {
                ...existingEvent,
                ...event,
                // Don't mark imported updates as unsynced
                unsynced: false,
                lastEditTime: Date.now(),
              };
              await store.put(updatedEvent);
              updatedCount++;
            }
          } else {
            // New event - add it
            const newEvent = {
              ...event,
              unsynced: false, // Imported events are not local changes
              lastEditTime: Date.now(),
            };
            await store.put(newEvent);
            addedCount++;
          }
        }

        await transaction.done;

        console.log(
          `Import complete: ${addedCount} added, ${updatedCount} updated, ${skippedCount} skipped (unsynced)`
        );
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      console.log('error', error);
      onError(error);
    },
  });

  return mutation;
};
