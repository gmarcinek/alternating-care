import { CalendarEvent } from '@api/db/types';
import { useMutation } from '@tanstack/react-query';
import { useDbContext } from '../../../api/db/DbContext';

export const useImportEventsFromJsonMutation = (
  groupId: string, // Dodanie groupId jako parametru
  props: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  } = {}
) => {
  const { onSuccess = () => {}, onError = () => {} } = props;
  const { db } = useDbContext(); // Pobieramy instancję bazy danych z kontekstu

  const mutation = useMutation({
    mutationFn: async (events: CalendarEvent[]) => {
      // Zmiana na CalendarEvent[] żeby przyjmować gotowe wydarzenia
      if (!db) {
        throw new Error('Database not available');
      }

      try {
        // Tworzymy transakcję do odczytu z obiektu store 'events'
        const transaction = db.transaction('events', 'readwrite');
        const store = transaction.objectStore('events');

        // Sprawdzamy czy istnieje indeks 'by-groupId' (na wszelki wypadek)
        if (!store.indexNames.contains('by-groupId')) {
          throw new Error('Index "by-groupId" not found');
        }

        // Używamy indeksu 'by-groupId' do filtrowania zdarzeń po określonym groupId
        const index = store.index('by-groupId');
        const keyRange = IDBKeyRange.only(groupId);
        const allEvents = await index.getAll(keyRange);

        // Sprawdzamy, które wydarzenia z importu mają już swoje ID w bazie
        for (const event of events) {
          const existingEvent = allEvents.find(
            (existing) => existing.id === event.id
          );

          if (existingEvent) {
            // Jeśli istnieje, aktualizujemy istniejące wydarzenie
            await store.put({
              ...existingEvent, // zachowujemy wszystkie istniejące dane
              ...event, // nadpisujemy te, które przyszły w importowanych danych
            });
          } else {
            // Jeśli nie istnieje, dodajemy nowe wydarzenie
            await store.put(event);
          }
        }

        await transaction.done;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      onSuccess(); // Wywołanie callbacka po pomyślnym zapisaniu
    },
    onError: (error) => {
      console.log('error', error);
      onError(error); // Wywołanie callbacka w przypadku błędu
    },
  });

  return mutation;
};
