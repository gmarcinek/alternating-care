import { useMutation } from '@tanstack/react-query';
import { useDbContext } from '../DbContext'; // Korzystamy z kontekstu bazy danych
import { AppUser } from '../types';

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
