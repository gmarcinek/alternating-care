import { useMutation } from '@tanstack/react-query';
import crypto from 'crypto';
import { useDbContext } from '../DbContext';
import { CalendarDayType, CalendarEvent, CalendarEventType } from '../types';

export const useUpsertEventsMutation = (
  props: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  } = {}
) => {
  const { onSuccess = () => {}, onError = () => {} } = props;
  const { db } = useDbContext(); // Pobieramy instancję bazy danych z kontekstu

  const mutation = useMutation({
    mutationFn: async (dates: CalendarDayType[]) => {
      if (!db) {
        throw new Error('Database not available');
      }

      try {
        // Tworzymy transakcję do odczytu z obiektu store 'events'
        const transaction = db.transaction('events', 'readwrite');
        const store = transaction.objectStore('events');

        // Sprawdzamy czy istnieje indeks 'by-type' (na wszelki wypadek)
        if (!store.indexNames.contains('by-type')) {
          throw new Error('Index "by-type" not found');
        }

        // Używamy indeksu 'by-type' do filtrowania zdarzeń po określonym typie
        const index = store.index('by-type');
        const keyRange = IDBKeyRange.only(CalendarEventType.Alternating);
        const alternatingEvents = await index.getAll(keyRange);

        // Przechodzimy przez każdy event i sprawdzamy, czy już istnieje
        for (const date of dates) {
          const existingEvents = alternatingEvents.filter(
            (item) => item.date === date.date
          );
          const existingEventsEventsDates = existingEvents.map(
            (item) => item.date
          );
          for (const event of existingEvents) {
            await store.delete(event.id);
          }

          if (!existingEventsEventsDates.includes(date.date)) {
            const newEvent: CalendarEvent = {
              id: crypto.randomBytes(16).toString('hex'),
              groupId: CalendarEventType.Alternating,
              date: date.date,
              type: CalendarEventType.Alternating,
              name: 'Opieka',
              description: '',
              creationTime: Date.now(),
              issuer: 'Admin',
            };
            await store.put(newEvent);
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
      onError(error); // Wywołanie callbacka w przypadku błędu
    },
  });

  return mutation;
};
