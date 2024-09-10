import { useMutation } from '@tanstack/react-query';
import { useDbContext } from '../DbContext';

export const useDeleteEventMutation = (
  props: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  } = {}
) => {
  const { onSuccess = () => {}, onError = () => {} } = props;
  const { db } = useDbContext(); // Pobieramy instancję bazy danych z kontekstu

  const mutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!db) {
        throw new Error('Database not available');
      }

      try {
        // Tworzymy transakcję do zapisu w obiekcie store 'events'
        const transaction = db.transaction('events', 'readwrite');
        const store = transaction.objectStore('events');

        // Sprawdzamy, czy event o podanym id istnieje
        const event = await store.get(eventId);

        if (!event) {
          throw new Error(`Event with id "${eventId}" not found`);
        }

        // Usuwamy event
        await store.delete(eventId);

        await transaction.done;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      onSuccess(); // Wywołanie callbacka po pomyślnym usunięciu
    },
    onError: (error) => {
      onError(error); // Wywołanie callbacka w przypadku błędu
    },
  });

  return mutation;
};
