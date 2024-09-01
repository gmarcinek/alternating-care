import { CalendarDayType, CalendarEvent } from '@modules/db/types';
import dayjs, { Dayjs } from 'dayjs';

export const dateFormat = 'YYYY-MM-DD';

/**
 * Generuje tablicę dat pomiędzy dwoma podanymi datami, które są dostosowane do określonego interwału.
 * Daty są generowane od początku tygodnia przed datą początkową, do daty końcowej. Jeśli różnica dni
 * między datami nie jest podzielna przez `x`, ostatnie daty zostaną usunięte, aby zapewnić, że
 * wynikowa tablica zawiera daty, które są wielokrotnościami `x` dni.
 *
 * @param start - Data początkowa, która może być w formie łańcucha znaków (w formacie akceptowanym przez `dayjs`)
 *                lub obiektu `Dayjs`.
 * @param end - Data końcowa, która może być w formie łańcucha znaków (w formacie akceptowanym przez `dayjs`)
 *              lub obiektu `Dayjs`.
 * @param x - Liczba dni, która określa interwał między kolejnymi datami w wynikowej tablicy.
 *            Musi być liczbą całkowitą większą od zera.
 * @returns Tablica obiektów `Dayjs`, które są datami od `start` do `end`, z usuniętymi datami na końcu,
 *          jeśli ich liczba nie jest wielokrotnością `x`.
 *
 * @template Dayjs - Typ używany do reprezentacji dat. Funkcja wykorzystuje bibliotekę `dayjs`.
 */
export function toRowXDates(
  start: string | Dayjs,
  end: string | Dayjs,
  x: number
) {
  const startDate = dayjs(start)
    .startOf('week')
    .subtract(1, 'week')
    .startOf('week');
  const endDate = dayjs(end);
  const diff = startDate.diff(endDate, 'day');
  const offset = Math.abs(diff % x);
  const result = getDaysBetweenDates(startDate, endDate);
  result.splice(result.length - offset, offset);

  return result;
}

export function toFullWeeksDates(start: string | Dayjs, end: string | Dayjs) {
  const startDate = dayjs(start).startOf('week');
  const endDate = dayjs(end)
    .endOf('week')
    .clone()
    .add(1, 'week')
    .startOf('week');

  return getDaysBetweenDates(startDate, endDate);
}

export function toFullMonthsDates(start: string | Dayjs, end: string | Dayjs) {
  const startDate = dayjs(start).startOf('month').clone().startOf('week');
  const endDate = dayjs(end)
    .endOf('month')
    .clone()
    .add(1, 'week')
    .startOf('week');

  return getDaysBetweenDates(startDate, endDate);
}

/**
 * Funkcja `getDaysBetweenDates` oblicza wszystkie dni pomiędzy dwoma datami, włącznie z datą początkową.
 * Zwraca tablicę obiektów, z których każdy reprezentuje jeden dzień w przedziale dat.
 * Obiekty zawierają daty sformatowane według zdefiniowanego formatu.
 *
 * @param start - Data początkowa przedziału. Może być przekazana jako ciąg znaków (string) w formacie akceptowanym przez `dayjs` lub obiekt typu `Dayjs`.
 * @param end - Data końcowa przedziału. Może być przekazana jako ciąg znaków (string) w formacie akceptowanym przez `dayjs` lub obiekt typu `Dayjs`.
 *
 * @returns Tablica obiektów `CalendarDayType`, gdzie każdy obiekt reprezentuje jeden dzień w przedziale dat.
 *          Jeśli daty są niepoprawne, lub data początkowa jest późniejsza niż data końcowa, funkcja zwraca pustą tablicę.
 *
 * @throws W przypadku niepoprawnych dat lub błędów wewnętrznych mogą wystąpić błędy w konsoli.
 *
 * @example
 * // Przykład użycia funkcji:
 *
 * // Definiowanie formatu daty
 * const dateFormat = 'YYYY-MM-DD';
 *
 * // Przykład 1: Przekazanie dat jako ciągi znaków
 * const days1 = getDaysBetweenDates('2024-08-01', '2024-08-05');
 * console.log(days1);
 * // Oczekiwany wynik: [{ date: '2024-08-01' }, { date: '2024-08-02' }, { date: '2024-08-03' }, { date: '2024-08-04' }, { date: '2024-08-05' }]
 *
 * // Przykład 2: Przekazanie dat jako obiekty Dayjs
 * const startDate = dayjs('2024-08-01');
 * const endDate = dayjs('2024-08-05');
 * const days2 = getDaysBetweenDates(startDate, endDate);
 * console.log(days2);
 * // Oczekiwany wynik: [{ date: '2024-08-01' }, { date: '2024-08-02' }, { date: '2024-08-03' }, { date: '2024-08-04' }, { date: '2024-08-05' }]
 *
 * // Przykład 3: Niepoprawna data początkowa
 * const invalidDays = getDaysBetweenDates('invalid-date', '2024-08-05');
 * console.log(invalidDays);
 * // Oczekiwany wynik: []
 */
export function getDaysBetweenDates(
  start: string | Dayjs,
  end: string | Dayjs
) {
  const days: CalendarDayType[] = [];
  const startDate = dayjs(start);
  const endDate = dayjs(end);

  if (!startDate.isValid() || !endDate.isValid()) {
    console.log('startDate IS INVALID');
    return days;
  }

  if (!endDate.isValid()) {
    console.log('endDate IS INVALID');
    return days;
  }

  if (startDate.isAfter(endDate)) {
    console.log('startDate IS AFTER endDate');
    return days;
  }

  const diffCounter = Math.abs(endDate.diff(startDate, 'days'));

  void new Array<string>(diffCounter)
    .fill('', 0, diffCounter)
    .reduce<Dayjs>((indexDay) => {
      if (startDate === indexDay) {
        days.push({
          date: startDate.format(dateFormat),
        });
      } else {
        days.push({
          date: indexDay.format(dateFormat),
        });
      }

      return indexDay.add(1, 'day');
    }, startDate);

  return days;
}

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
