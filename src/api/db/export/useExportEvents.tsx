import { CalendarEvent } from '@api/db/types';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import dayjs from 'dayjs';
import { useGetAllEventsMutation } from '../events/useGetAllEventsMutation';

export const useExportEvents = () => {
  const { mutation, refetch } = useGetAllEventsMutation(); // Korzystamy z zapytania do bazy

  const exportEventsToFile = async () => {
    try {
      await refetch(); // Czekamy na zakończenie refetch

      if (mutation.isPending) {
        alert('Ładowanie danych...');
        return;
      }

      if (mutation.isError) {
        alert('Wystąpił błąd podczas pobierania wydarzeń');
        return;
      }

      const events: CalendarEvent[] = mutation.data || [];

      if (events.length === 0) {
        alert('Brak wydarzeń do eksportu');
        return;
      }

      // Konwertujemy wydarzenia na format JSON
      const jsonBlob = new Blob([JSON.stringify(events)], {
        type: 'application/json',
      });

      // Tworzymy link do pobrania
      const link = document.createElement('a');
      link.href = URL.createObjectURL(jsonBlob);
      link.download = generateFileName();
      link.click();
    } catch (error) {
      alert('Wystąpił nieoczekiwany błąd');
    }
  };

  return {
    exportEventsToFile,
  };
};

const generateFileName = (): string => {
  const date = new Date();
  const timestamp = date.getTime();
  const formated = dayjs(date).format(dateFormat);

  // Generowanie nazwy pliku z datą i sekundą
  const fileName = `alternatinCareApp-${formated}-${timestamp}.json`;
  return fileName;
};
