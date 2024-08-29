import { useMutation } from '@tanstack/react-query';
import { useDbContext } from '../DbContext'; // Użycie kontekstu bazy danych
import { CalendarEvent } from '../types';

interface OseGetAllEventsMutationProps {
  onSuccess?: (data?: CalendarEvent[]) => void;
  onError?: (error: unknown) => void;
}

export const useGetAllEventsMutation = (
  props: OseGetAllEventsMutationProps = {}
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
