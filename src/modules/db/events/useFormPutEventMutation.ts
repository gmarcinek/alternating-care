import { useMutation } from '@tanstack/react-query';
import { useDbContext } from '../DbContext';
import { CalendarEvent } from '../types';

// Hook do zapisywania nowych zdarzeń kalendarza
export const useFormPutEventMutation = (
  props: {
    onSuccess?: (data?: CalendarEvent[]) => void;
    onError?: (error: unknown) => void;
  } = {}
) => {
  const { onSuccess = () => {}, onError = () => {} } = props;
  const { db } = useDbContext(); // Pobieramy instancję bazy danych z kontekstu

  const mutation = useMutation({
    mutationFn: async (events: CalendarEvent[]) => {
      if (!db) {
        throw new Error('Database not available');
      }

      try {
        // Tworzenie transakcji do grupowania wielu operacji zapisu
        const transaction = db.transaction('events', 'readwrite');
        const store = transaction.objectStore('events');

        // Dodawanie każdego zdarzenia do obiektu transakcji
        events.forEach((event) => store.put(event));

        // Czekamy na zakończenie transakcji
        await transaction.done;

        return events;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      onSuccess(data); // Wywołanie callbacka po pomyślnym zapisaniu
    },
    onError: (error) => {
      onError(error); // Wywołanie callbacka w przypadku błędu
    },
  });

  return mutation;
};
