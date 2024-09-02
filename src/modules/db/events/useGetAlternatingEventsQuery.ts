import { useQuery } from '@tanstack/react-query';
import { useDbContext } from '../DbContext';
import { CalendarEvent, CalendarEventType } from '../types';

export const useGetAlternatingEventsQuery = (eventType: CalendarEventType) => {
  // Pobieramy instancję bazy danych z kontekstu
  const { db } = useDbContext();

  // Funkcja zapytania do bazy danych
  const fetchEventsByType = async (): Promise<CalendarEvent[]> => {
    if (!db) {
      throw new Error('No database instance available');
    }

    // Tworzymy transakcję do odczytu z obiektu store 'events'
    const transaction = db.transaction('events', 'readonly');
    const store = transaction.objectStore('events');

    // Sprawdzamy czy istnieje indeks 'by-type' (na wszelki wypadek)
    if (!store.indexNames.contains('by-type')) {
      throw new Error('Index "by-type" not found');
    }

    // Używamy indeksu 'by-type' do filtrowania zdarzeń po określonym typie
    const index = store.index('by-type');
    const keyRange = IDBKeyRange.only(eventType); // eventType np. 'ALTERNATING'

    // Pobieramy wszystkie eventy o podanym typie
    return index.getAll(keyRange);
  };

  // Hook useMutation zarządza stanem mutacji
  const mutation = useQuery({
    queryFn: fetchEventsByType,
    queryKey: ['fetchEventsByType'],
  });

  return {
    mutation,
    data: mutation.data || [],
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    refetch: mutation.refetch,
  };
};
