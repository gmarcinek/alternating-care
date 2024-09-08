import { useMutation } from '@tanstack/react-query';
import { useDbContext } from '../../../api/db/DbContext'; // Korzystamy z kontekstu bazy danych
import { AppUser } from '../../../api/db/types';

/**
 * Hak `useFormPutUserMutation` wykorzystuje `react-query` do przeprowadzania operacji `put` w bazie danych
 * dla obiektu typu `AppUser`. Umożliwia to aktualizację użytkownika w bazie danych oraz obsługę stanu operacji.
 *
 * Hak korzysta z kontekstu bazy danych (`useDbContext`), aby uzyskać instancję bazy danych i wykonać operację.
 *
 * @param {UseFormPutUserMutationProps} [props] - Opcjonalne właściwości:
 * - `onSuccess` (Function): Funkcja wywoływana, gdy operacja `put` zakończy się sukcesem.
 * - `onError` (Function): Funkcja wywoływana, gdy operacja `put` zakończy się błędem.
 *
 * @returns {Object} Obiekt zawierający:
 * - `mutate` (Function): Funkcja do wywołania mutacji (aktualizacji użytkownika). Przyjmuje obiekt `AppUser` jako argument.
 * - `mutateAsync` (Function): Asynchroniczna wersja funkcji `mutate`.
 * - `isPending` (boolean): `true`, jeśli operacja `put` jest w toku.
 * - `isSuccess` (boolean): `true`, jeśli operacja `put` zakończyła się sukcesem.
 * - `isError` (boolean): `true`, jeśli operacja `put` zakończyła się błędem.
 * - `error` (Error | null): Obiekt błędu, jeśli wystąpił podczas operacji `put`.
 *
 * @example
 * // Przykład użycia haka
 * import React from 'react';
 * import { useFormPutUserMutation } from './useFormPutUserMutation'; // Załóżmy, że hak jest zapisany w pliku `useFormPutUserMutation.ts`
 * import { AppUser } from '../types';
 *
 * const MyComponent: React.FC = () => {
 *   const { mutate, isSuccess, isError, error } = useFormPutUserMutation({
 *     onSuccess: () => {
 *       console.log('User updated successfully');
 *     },
 *     onError: () => {
 *       console.log('Failed to update user');
 *     },
 *   });
 *
 *   const handleUpdateUser = () => {
 *     const user: AppUser = { id: '1', name: 'John Doe', email: 'john@example.com' }; // Przykładowe dane użytkownika
 *     mutate(user);
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleUpdateUser}>Update User</button>
 *       {isSuccess && <div>User updated successfully!</div>}
 *       {isError && <div>Error updating user: {error?.message}</div>}
 *     </div>
 *   );
 * };
 *
 * export default MyComponent;
 */
interface UseFormPutUserMutationProps {
  onSuccess?: () => void;
  onError?: () => void;
}

export const useFormPutUserMutation = (
  props: UseFormPutUserMutationProps = {}
) => {
  const { db } = useDbContext(); // Pobieramy instancję bazy danych z kontekstu

  const mutation = useMutation({
    mutationFn: async (payload: AppUser) => {
      if (!db) {
        throw new Error('Database instance is not available');
      }

      // Wykonujemy operację `put` w bazie danych
      await db.put('users', payload);
      return payload; // Możemy zwrócić payload lub inny wynik, jeśli potrzebujemy
    },
    onSuccess: () => {
      if (props.onSuccess) {
        props.onSuccess(); // Wywołanie funkcji sukcesu
      }
    },
    onError: (error) => {
      if (props.onError) {
        props.onError(); // Obsługuje błąd
      }
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error, // Możemy również udostępnić błąd
  };
};
