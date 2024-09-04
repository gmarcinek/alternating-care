import { useQuery } from '@tanstack/react-query';
import { useDbContext } from '../DbContext'; // Użycie kontekstu bazy danych
import { CalendarEvent } from '../types';

export const useGetAllEventsQuery = () => {
  // Pobieramy instancję bazy danych z kontekstu
  const { db } = useDbContext();

  // Funkcja zapytania do bazy danych
  const fetchEvents = async (): Promise<CalendarEvent[]> => {
    if (!db) {
      throw new Error('No database instance available');
    }
    return db.getAll('events');
  };

  // Hook useQuery zarządza stanem zapytania
  const query = useQuery({
    queryKey: ['getAllEvents'], // Klucz zapytania, który może być używany do cache'owania
    queryFn: fetchEvents,
  });

  return {
    query,
    refetch: query.refetch,
  };
};
