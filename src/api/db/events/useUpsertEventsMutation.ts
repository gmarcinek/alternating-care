import { CalendarEvent, CalendarEventType } from '@api/db/types';
import { CalendarDayType } from '@components/Calendar/Calendar.types';
import { useMutation } from '@tanstack/react-query';
import crypto from 'crypto';
import { useDbContext } from '../../../api/db/DbContext';

export const useUpsertEventsMutation = (
  groupId: string,
  props: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  } = {}
) => {
  const { onSuccess = () => {}, onError = () => {} } = props;
  const { db } = useDbContext();

  const mutation = useMutation({
    mutationFn: async (dates: CalendarDayType[]) => {
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

        const {
          type = groupId as CalendarEventType,
          name = '',
          description = '',
          style = undefined,
        } = allEvents.length > 0 ? allEvents[0] : {};

        let createdCount = 0;
        let deletedCount = 0;

        // Process each date - delete existing and optionally create new
        for (const date of dates) {
          const existingEvents = allEvents.filter(
            (item) => item.date === date.date
          );

          // Delete existing events for this date
          for (const event of existingEvents) {
            // Check if it's a remote event - use smart delete
            if (event.issuer === 'remote') {
              // Mark as deleted but keep for sync
              const deletedEvent = {
                ...event,
                deleted: true,
                unsynced: true,
                deletedAt: Date.now(),
              };
              await store.put(deletedEvent);
            } else {
              // Local-only event - safe to delete completely
              await store.delete(event.id);
            }
            deletedCount++;
          }

          // Create new event if not already existing
          const existingEventsDates = existingEvents.map((item) => item.date);
          if (!existingEventsDates.includes(date.date)) {
            const newEvent: CalendarEvent = {
              id: crypto.randomBytes(16).toString('hex'),
              date: date.date,
              groupId,
              type,
              name,
              description,
              creationTime: Date.now(),
              issuer: 'Admin',
              style,
              unsynced: true, // Mark new events as unsynced
              lastEditTime: Date.now(), // Track creation time
            };
            await store.put(newEvent);
            createdCount++;
          }
        }

        await transaction.done;

        console.log(
          `Upsert complete: ${createdCount} created, ${deletedCount} deleted (all marked unsynced)`
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
