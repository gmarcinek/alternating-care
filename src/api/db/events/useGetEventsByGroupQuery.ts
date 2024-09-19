import { CalendarEvent } from '@api/db/types';
import { useQuery } from '@tanstack/react-query';
import { useDbContext } from '../../../api/db/DbContext';

export const useGetEventsByGroupQuery = (groupId: string) => {
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

    // Sprawdzamy czy istnieje indeks 'by-groupId' (na wszelki wypadek)
    if (!store.indexNames.contains('by-groupId')) {
      throw new Error('Index "by-groupId" not found');
    }

    // Używamy indeksu 'by-groupId' do filtrowania zdarzeń po określonym typie
    const index = store.index('by-groupId');
    const keyRange = IDBKeyRange.only(groupId); // eventType np. 'ALTERNATING'

    // Pobieramy wszystkie eventy o podanym typie
    return index.getAll(keyRange);
  };

  // Hook useMutation zarządza stanem mutacji
  const query = useQuery({
    queryFn: fetchEventsByType,
    queryKey: ['fetchEventsByGroupId'],
  });

  return {
    query,
    data: query.data || [],
    isPending: query.isPending,
    isSuccess: query.isSuccess,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
