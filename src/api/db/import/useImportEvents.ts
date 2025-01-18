import { CalendarEvent } from '@api/db/types';
import { useDbContext } from '../../../api/db/DbContext';
import { useGetAllEventsMutation } from '../events/useGetAllEventsMutation';
import { useImportEventsFromJsonMutation } from '../events/useImportEventsFromJsonMutation';

export const useImportEvents = () => {
  const { db } = useDbContext(); // Korzystamy z bazy danych z kontekstu
  const { data: allEvents, refetch } = useGetAllEventsMutation(); // Używamy już istniejącej mutacji do pobierania wydarzeń
  const importEventsFromJsonMutation = useImportEventsFromJsonMutation(''); // Używamy upserta (na razie bez groupId)

  const importEventsFromFile = async (file: Blob): Promise<void> => {
    if (!db) {
      alert('Brak instancji bazy danych');
      return;
    }

    try {
      const events = await fileToJSON(file); // Konwertujemy plik na obiekty

      // Pobieramy listę wszystkich istniejących wydarzeń
      const existingIds = new Set(allEvents?.map((event) => event.id));

      const eventsToUpsert = events.filter(
        (event: CalendarEvent) => !existingIds.has(event.id)
      );

      // Wywołujemy mutation upsertu dla nowych wydarzeń
      if (eventsToUpsert.length > 0) {
        importEventsFromJsonMutation.mutate(eventsToUpsert, {
          onSuccess: () => {
            alert('Import zakończony');
            refetch(); // Odświeżamy dane po udanym imporcie
          },
          onError: (error) => {
            console.error(error);
            alert('Błąd podczas importu');
          },
        });
      } else {
        alert('Brak nowych wydarzeń do zaimportowania');
      }
    } catch (error) {
      alert('Błąd podczas importu: ' + error);
      console.error(error);
    }
  };

  // Funkcja pomocnicza do konwersji pliku na JSON
  function fileToJSON(file: Blob): Promise<CalendarEvent[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          resolve(data);
        } catch (error) {
          reject('Niepoprawny format pliku');
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }

  return {
    importEventsFromFile,
  };
};
