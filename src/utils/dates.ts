import { CalendarEvent } from '@components/Calendar/Calendar.types';

/**
 * Interfejs `GroupByDateType` reprezentuje grupę wydarzeń zgrupowanych według daty.
 *
 * @interface GroupByDateType
 * @property {string} date - Data w formacie `YYYY-MM-DD`, według której grupowane są wydarzenia.
 * @property {CalendarEvent[]} events - Tablica wydarzeń przypisanych do danej daty.
 */
export interface GroupByDateType {
  date: string;
  events: CalendarEvent[];
}

/**
 * Funkcja `groupByDate` grupuje wydarzenia według daty.
 *
 * Funkcja przyjmuje tablicę wydarzeń i grupuje je według daty. Każda grupa wydarzeń jest reprezentowana
 * przez obiekt zgodny z interfejsem `GroupByDateType`, który zawiera datę i tablicę wydarzeń przypisanych do tej daty.
 *
 * @param {CalendarEvent[]} events - Tablica wydarzeń do pogrupowania. Każde wydarzenie powinno zawierać pole `date`
 *                                    reprezentujące datę wydarzenia w formacie `YYYY-MM-DD`.
 *
 * @returns {GroupByDateType[]} Tablica obiektów `GroupByDateType`, gdzie każdy obiekt zawiera datę i tablicę wydarzeń
 *                              przypisanych do tej daty. Wydarzenia są grupowane według daty.
 *
 * @example
 * // Przykład użycia funkcji
 * const events = [
 *   { date: '2024-09-01', title: 'Event 1' },
 *   { date: '2024-09-01', title: 'Event 2' },
 *   { date: '2024-09-02', title: 'Event 3' },
 *   { date: '2024-09-03', title: 'Event 4' }
 * ];
 *
 * const groupedEvents = groupByDate(events);
 * console.log(groupedEvents);
 * // Oczekiwany wynik:
 * // [
 * //   { date: '2024-09-01', events: [ { date: '2024-09-01', title: 'Event 1' }, { date: '2024-09-01', title: 'Event 2' } ] },
 * //   { date: '2024-09-02', events: [ { date: '2024-09-02', title: 'Event 3' } ] },
 * //   { date: '2024-09-03', events: [ { date: '2024-09-03', title: 'Event 4' } ] }
 * // ]
 *
 * @throws W przypadku, gdy `events` nie jest tablicą obiektów zawierających pole `date`, może wystąpić błąd.
 */

export const groupByDate = (events: CalendarEvent[]) => {
  return events.reduce((acc, event) => {
    // Sprawdzamy czy istnieje już wpis z daną datą
    const existingGroup = acc.find((group) => group.date === event.date);

    if (existingGroup) {
      // Jeśli tak, dodajemy event do istniejącej grupy
      existingGroup.events.push(event);
    } else {
      // Jeśli nie, tworzymy nową grupę z daną datą
      acc.push({
        date: event.date,
        events: [event],
      });
    }

    return acc;
  }, [] as GroupByDateType[]);
};
