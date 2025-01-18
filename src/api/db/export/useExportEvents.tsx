import { CalendarEvent } from '@api/db/types';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import dayjs from 'dayjs';
import { useGetAllEventsQuery } from '../events/useGetAllEventsQuery';

export const useExportEvents = () => {
  const { query } = useGetAllEventsQuery(); // Korzystamy z zapytania do bazy

  const exportEventsToFile = () => {
    if (query.isLoading) {
      alert('Ładowanie danych...');
      return;
    }

    if (query.error) {
      alert('Wystąpił błąd podczas pobierania wydarzeń');
      return;
    }

    const events: CalendarEvent[] = query.data || [];

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
