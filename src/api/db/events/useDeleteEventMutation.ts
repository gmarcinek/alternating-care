import { useMutation } from '@tanstack/react-query';
import { useDbContext } from '../DbContext';
import { CalendarEvent } from '../types';

export const useDeleteEventMutation = (
  props: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  } = {}
) => {
  const { onSuccess = () => {}, onError = () => {} } = props;
  const { db } = useDbContext();

  const mutation = useMutation({
    mutationFn: async (calendarEvent: CalendarEvent) => {
      if (!db) {
        throw new Error('Database not available');
      }

      try {
        const transaction = db.transaction('events', 'readwrite');
        const store = transaction.objectStore('events');

        // Check if event exists
        const event = await store.get(calendarEvent.id);

        if (!event) {
          throw new Error(`Event with id "${calendarEvent.id}" not found`);
        }

        // If event came from remote, mark as deleted (tombstone)
        // If event is local-only, actually delete it
        if (event.issuer === 'remote') {
          // Mark as deleted but keep for sync
          const deletedEvent = {
            ...event,
            deleted: true,
            unsynced: true,
            deletedAt: Date.now(),
          };
          await store.put(deletedEvent);
          console.log(`Marked remote event ${event.id} as deleted`);
        } else {
          // Local-only event - safe to delete completely
          await store.delete(calendarEvent.id);
          console.log(`Deleted local-only event ${event.id}`);
        }

        await transaction.done;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      onError(error);
    },
  });

  return mutation;
};
