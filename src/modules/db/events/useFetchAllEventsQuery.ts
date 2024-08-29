import { useQuery } from '@tanstack/react-query';
import { useDbContext } from '../DbContext';
import { CalendarEvent } from '../types';

// Hook do pobierania wszystkich zdarzeń kalendarza
export const useFetchAllEventsQuery = () => {
  const { db } = useDbContext(); // Pobieramy instancję bazy danych z kontekstu

  const query = useQuery<CalendarEvent[], Error>({
    queryKey: ['getAllEvents'],
    queryFn: async () => {
      if (!db) {
        throw new Error('Database not available');
      }

      try {
        // Otwieramy transakcję tylko do odczytu
        const transaction = db.transaction('events', 'readonly');
        const store = transaction.objectStore('events');

        // Pobieramy wszystkie zdarzenia z magazynu danych
        const events = await store.getAll();

        return events;
      } catch (error) {
        throw error;
      }
    },
  });

  return query;
};
