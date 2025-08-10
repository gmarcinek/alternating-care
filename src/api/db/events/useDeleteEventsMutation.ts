import { useMutation } from '@tanstack/react-query';
import { useDbContext } from '../DbContext';

export const useDeleteEventsMutation = (
  props: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  } = {}
) => {
  const { onSuccess = () => {}, onError = () => {} } = props;
  const { db } = useDbContext();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!db) {
        throw new Error('Database not available');
      }

      try {
        const transaction = db.transaction('events', 'readwrite');
        const store = transaction.objectStore('events');

        // DON'T use store.clear() - it wipes everything!
        // Instead, get all events and selectively delete
        const allEvents = await store.getAll();

        let deletedCount = 0;
        let preservedCount = 0;

        for (const event of allEvents) {
          if (event.unsynced) {
            // Preserve unsynced events - user wants to keep them
            preservedCount++;
            console.log(`Preserved unsynced event: ${event.name}`);
          } else {
            // Safe to delete - not locally modified
            await store.delete(event.id);
            deletedCount++;
          }
        }

        await transaction.done;

        console.log(
          `Mass delete: ${deletedCount} deleted, ${preservedCount} preserved`
        );
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
