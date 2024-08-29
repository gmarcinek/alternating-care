import { useMutation } from '@tanstack/react-query';
import { useDbContext } from '../DbContext'; // Użycie kontekstu bazy danych
import { AppUser } from '../types';

interface UseFormReadUsersMutationProps {
  onSuccess?: (data?: AppUser[]) => void;
  onError?: (error: unknown) => void;
}

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
