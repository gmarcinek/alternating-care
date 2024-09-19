import { CalendarEvent, CalendarEventType } from '@api/db/types';
import { CalendarDayType } from '@components/Calendar/Calendar.types';
import { useMutation } from '@tanstack/react-query';
import crypto from 'crypto';
import { useDbContext } from '../../../api/db/DbContext';

export const useUpsertEventsMutation = (
  groupId: string, // Dodanie groupId jako parametru
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
        if (!store.indexNames.contains('by-groupId')) {
          throw new Error('Index "by-groupId" not found');
        }

        // Używamy indeksu 'by-groupId' do filtrowania zdarzeń po określonym groupId
        const index = store.index('by-groupId');
        const keyRange = IDBKeyRange.only(groupId);
        const allEvents = await index.getAll(keyRange);

        const {
          type = CalendarEventType.Event,
          name = '',
          description = '',
          style,
        } = allEvents[0];

        // Przechodzimy przez każdy event i sprawdzamy, czy już istnieje
        for (const date of dates) {
          const existingEvents = allEvents.filter(
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
              date: date.date,
              groupId, // edytowana grupa
              type,
              name,
              description,
              creationTime: Date.now(),
              issuer: 'Admin',
              style,
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
