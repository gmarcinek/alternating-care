import { CalendarEvent } from '@api/db/types';
import { useMutation } from '@tanstack/react-query';
import { useDbContext } from '../../../api/db/DbContext'; // Użycie kontekstu bazy danych

interface UseGetAllEventsMutationProps {
  onSuccess?: (data?: CalendarEvent[]) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hak `useGetAllEventsMutation` wykorzystuje `react-query` do pobierania wszystkich zdarzeń z bazy danych.
 *
 * Hak korzysta z kontekstu bazy danych (`useDbContext`) w celu uzyskania instancji bazy danych i wykonania zapytania.
 *
 * @param {UseGetAllEventsMutationProps} [props] - Opcjonalne właściwości:
 * - `onSuccess` (Function): Funkcja wywoływana, gdy zapytanie do bazy danych zakończy się sukcesem. Otrzymuje tablicę zdarzeń jako argument.
 * - `onError` (Function): Funkcja wywoływana, gdy zapytanie do bazy danych zakończy się błędem. Otrzymuje obiekt błędu jako argument.
 *
 * @returns {Object} Obiekt zawierający:
 * - `mutation` (Object): Obiekt `react-query` z pełnym stanem mutacji, w tym metodami `mutate` i `mutateAsync`.
 * - `data` (CalendarEvent[]): Dane zwrócone przez zapytanie, domyślnie pusta tablica, jeśli brak danych.
 * - `isPending` (boolean): `true`, jeśli zapytanie jest w toku.
 * - `isSuccess` (boolean): `true`, jeśli zapytanie zakończyło się sukcesem.
 * - `isError` (boolean): `true`, jeśli zapytanie zakończyło się błędem.
 * - `error` (unknown): Obiekt błędu, jeśli wystąpił podczas zapytania.
 * - `refetch` (Function): Funkcja do wywołania mutacji, czyli ponownego pobrania danych.
 *
 * @example
 * // Przykład użycia haka
 * import React from 'react';
 * import { useGetAllEventsMutation } from './useGetAllEventsMutation'; // Załóżmy, że hak jest zapisany w pliku `useGetAllEventsMutation.ts`
 *
 * const MyComponent: React.FC = () => {
 *   const { data, isPending, isSuccess, isError, error, refetch } = useGetAllEventsMutation({
 *     onSuccess: (events) => {
 *       console.log('Events fetched successfully:', events);
 *     },
 *     onError: (err) => {
 *       console.log('Failed to fetch events:', err);
 *     },
 *   });
 *
 *   return (
 *     <div>
 *       <button onClick={() => refetch()}>Fetch Events</button>
 *       {isPending && <div>Loading...</div>}
 *       {isSuccess && (
 *         <ul>
 *           {data.map(event => (
 *             <li key={event.id}>{event.title}</li>
 *           ))}
 *         </ul>
 *       )}
 *       {isError && <div>Error fetching events: {error?.message}</div>}
 *     </div>
 *   );
 * };
 *
 * export default MyComponent;
 */
export const useGetAllEventsMutation = (
  props: UseGetAllEventsMutationProps = {}
) => {
  const { onSuccess = () => {}, onError = () => {} } = props;

  // Pobieramy instancję bazy danych z kontekstu
  const { db } = useDbContext();

  // Funkcja zapytania do bazy danych
  const fetchEvents = async (): Promise<CalendarEvent[]> => {
    if (!db) {
      throw new Error('No database instance available');
    }
    return db.getAll('events');
  };

  // Hook useMutation zarządza stanem mutacji
  const mutation = useMutation({
    mutationFn: fetchEvents,
    onSuccess,
    onError,
  });

  return {
    mutation,
    data: mutation.data || [],
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    refetch: mutation.mutate,
  };
};
