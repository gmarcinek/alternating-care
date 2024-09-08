import { useMutation } from '@tanstack/react-query';
import { useDbContext } from '../../../api/db/DbContext'; // Użycie kontekstu bazy danych
import { AppUser } from '../../../api/db/types';

interface UseFormReadUsersMutationProps {
  onSuccess?: (data?: AppUser[]) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hak `useFormReadUsersMutation` wykorzystuje `react-query` do pobierania wszystkich użytkowników z bazy danych.
 *
 * Hak korzysta z kontekstu bazy danych (`useDbContext`) w celu uzyskania instancji bazy danych i wykonania zapytania.
 *
 * @param {UseFormReadUsersMutationProps} [props] - Opcjonalne właściwości:
 * - `onSuccess` (Function): Funkcja wywoływana, gdy zapytanie do bazy danych zakończy się sukcesem. Otrzymuje tablicę użytkowników jako argument.
 * - `onError` (Function): Funkcja wywoływana, gdy zapytanie do bazy danych zakończy się błędem. Otrzymuje obiekt błędu jako argument.
 *
 * @returns {Object} Obiekt zawierający:
 * - `data` (AppUser[]): Dane zwrócone przez zapytanie, domyślnie pusta tablica, jeśli brak danych.
 * - `isPending` (boolean): `true`, jeśli zapytanie jest w toku.
 * - `isSuccess` (boolean): `true`, jeśli zapytanie zakończyło się sukcesem.
 * - `isError` (boolean): `true`, jeśli zapytanie zakończyło się błędem.
 * - `error` (unknown): Obiekt błędu, jeśli wystąpił podczas zapytania.
 * - `refetch` (Function): Funkcja do wywołania mutacji, czyli ponownego pobrania danych.
 *
 * @example
 * // Przykład użycia haka
 * import React from 'react';
 * import { useFormReadUsersMutation } from './useFormReadUsersMutation'; // Załóżmy, że hak jest zapisany w pliku `useFormReadUsersMutation.ts`
 *
 * const MyComponent: React.FC = () => {
 *   const { data, isPending, isSuccess, isError, error, refetch } = useFormReadUsersMutation({
 *     onSuccess: (users) => {
 *       console.log('Users fetched successfully:', users);
 *     },
 *     onError: (err) => {
 *       console.log('Failed to fetch users:', err);
 *     },
 *   });
 *
 *   return (
 *     <div>
 *       <button onClick={() => refetch()}>Fetch Users</button>
 *       {isPending && <div>Loading...</div>}
 *       {isSuccess && (
 *         <ul>
 *           {data.map(user => (
 *             <li key={user.id}>{user.name}</li>
 *           ))}
 *         </ul>
 *       )}
 *       {isError && <div>Error fetching users: {error?.message}</div>}
 *     </div>
 *   );
 * };
 *
 * export default MyComponent;
 */
export const useFormReadUsersMutation = (
  props: UseFormReadUsersMutationProps = {}
) => {
  const { onSuccess = () => {}, onError = () => {} } = props;

  // Pobieramy instancję bazy danych z kontekstu
  const { db } = useDbContext();

  // Funkcja zapytania do bazy danych
  const fetchUsers = async (): Promise<AppUser[]> => {
    if (!db) {
      throw new Error('No database instance available');
    }
    return db.getAll('users'); // Wykonujemy zapytanie do bazy danych
  };

  // Hook useMutation zarządza stanem mutacji
  const mutation = useMutation({
    mutationFn: fetchUsers, // Funkcja zapytania
    onSuccess, // Funkcja sukcesu
    onError, // Funkcja błędu
  });

  return {
    data: mutation.data || [], // Dane zapytania
    isPending: mutation.isPending, // Stan oczekiwania
    isSuccess: mutation.isSuccess, // Stan sukcesu
    isError: mutation.isError, // Stan błędu
    error: mutation.error, // Błąd zapytania
    refetch: mutation.mutate, // Funkcja do wywołania mutacji
  };
};
