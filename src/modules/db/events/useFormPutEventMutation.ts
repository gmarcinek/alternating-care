import { useMutation } from '@tanstack/react-query';
import { useDbContext } from '../DbContext';
import { CalendarEvent } from '../types';

/**
 * Hak `useFormPutEventMutation` do zapisywania nowych zdarzeń kalendarza w bazie danych.
 *
 * Hak wykorzystuje kontekst bazy danych (`useDbContext`) do uzyskania instancji bazy i wykonania operacji zapisu.
 * Używa `react-query` do zarządzania stanem mutacji, w tym sukcesem i błędami operacji.
 *
 * @param {Object} [props] - Opcjonalne właściwości:
 * @param {Function} [props.onSuccess] - Funkcja wywoływana, gdy zapis zakończy się sukcesem. Otrzymuje tablicę zapisanych zdarzeń jako argument.
 * @param {Function} [props.onError] - Funkcja wywoływana, gdy zapis zakończy się błędem. Otrzymuje obiekt błędu jako argument.
 *
 * @returns {Object} Obiekt zawierający:
 * - `mutate` (Function): Funkcja do wywołania mutacji, czyli zapisania zdarzeń w bazie danych.
 * - `mutateAsync` (Function): Asynchroniczna wersja funkcji `mutate`.
 * - `isPending` (boolean): `true`, jeśli zapisywanie jest w toku.
 * - `isSuccess` (boolean): `true`, jeśli zapisywanie zakończyło się sukcesem.
 * - `isError` (boolean): `true`, jeśli zapisywanie zakończyło się błędem.
 * - `error` (unknown): Obiekt błędu, jeśli wystąpił podczas zapisywania.
 *
 * @example
 * // Przykład użycia haka
 * import React from 'react';
 * import { useFormPutEventMutation } from './useFormPutEventMutation'; // Załóżmy, że hak jest zapisany w pliku `useFormPutEventMutation.ts`
 * import { CalendarEvent } from '../types'; // Typy zdarzeń kalendarza
 *
 * const MyComponent: React.FC = () => {
 *   const { mutate, isPending, isSuccess, isError, error } = useFormPutEventMutation({
 *     onSuccess: (events) => {
 *       console.log('Events saved successfully:', events);
 *     },
 *     onError: (err) => {
 *       console.log('Failed to save events:', err);
 *     },
 *   });
 *
 *   const handleSaveEvents = () => {
 *     const events: CalendarEvent[] = [dane zdarzeń kalendarza];
 *     mutate(events); // Wywołanie zapisu zdarzeń
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleSaveEvents} disabled={isPending}>
 *         Save Events
 *       </button>
 *       {isPending && <div>Saving...</div>}
 *       {isSuccess && <div>Events saved successfully!</div>}
 *       {isError && <div>Error saving events: {error?.message}</div>}
 *     </div>
 *   );
 * };
 *
 * export default MyComponent;
 */
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
