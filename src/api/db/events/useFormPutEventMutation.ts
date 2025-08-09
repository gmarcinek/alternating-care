import { CalendarEvent } from '@api/db/types';
import { useMutation } from '@tanstack/react-query';
import { useDbContext } from '../../../api/db/DbContext';

export const useFormPutEventMutation = (
  props: {
    onSuccess?: (data?: CalendarEvent[]) => void;
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

        // Mark events as unsynced when user edits them
        const eventsWithUnsyncedFlag = events.map((event) => ({
          ...event,
          unsynced: true, // Mark as locally modified
          lastEditTime: Date.now(), // Track when edited
        }));

        // Add each event to the transaction
        eventsWithUnsyncedFlag.forEach((event) => store.put(event));

        await transaction.done;

        console.log(`Marked ${events.length} events as unsynced`);
        return eventsWithUnsyncedFlag;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      onSuccess(data);
    },
    onError: (error) => {
      onError(error);
    },
  });

  return mutation;
};
