import { CalendarDayType } from '@modules/db/types';
import { splitEvenly } from '@utils/array';
import { dateFormat, getDaysBetweenDates } from '@utils/dates';
import dayjs from 'dayjs';
import { CalendarMonthRawType, CalendarMonthType } from './Calendar.types';

type MonthsRaw = Record<string, CalendarMonthRawType>;

/**
 * Segreguje dane o dniach według miesięcy, dodając dni offsetowe na początku i końcu miesięcy,
 * a następnie dzieli te dane na tygodnie według zadanego rozmiaru wiersza.
 *
 * @param days - Tablica obiektów `CalendarDayType`, gdzie każdy obiekt reprezentuje pojedynczy dzień.
 *               Obiekt `CalendarDayType` powinien zawierać przynajmniej pole `date` w formacie ISO 8601.
 *
 * @param rowSize - Liczba dni, które mają być wyświetlane w jednym wierszu tygodnia.
 *
 * @returns Tablica obiektów `CalendarMonthType`, gdzie każdy obiekt reprezentuje miesiąc z podziałem na tygodnie.
 *          Obiekt `CalendarMonthType` zawiera:
 *          - `monthIndex`: Indeks miesiąca (0 = styczeń, 1 = luty, ..., 11 = grudzień).
 *          - `yearIndex`: Rok, do którego należy miesiąc.
 *          - `weeks`: Tablica tygodni, gdzie każdy tydzień to tablica dni (`CalendarDayType`), która została podzielona
 *            na podstawie `rowSize`. Dni offsetowe są oznaczone flagą `isOffset: true`.
 *
 * Proces działania funkcji:
 *
 * 1. **Grupowanie dni według miesiąca i roku**:
 *    - Funkcja przekształca tablicę dni `days` w obiekt `monthsRaw`, gdzie kluczem jest rok i miesiąc
 *      (w formacie "YYYY-MM"), a wartością jest obiekt zawierający miesiąc, rok oraz tablicę dni w tym miesiącu.
 *
 * 2. **Obliczanie prefiksów i sufiksów dla każdego miesiąca**:
 *    - Dla każdego miesiąca sprawdzane są dni offsetowe (dni przed pierwszym dniem miesiąca i po ostatnim dniu miesiąca).
 *    - Jeżeli liczba dni w miesiącu jest mniejsza lub równa 7, prefiks i sufiks są pomijane.
 *    - Dni offsetowe są generowane na podstawie dnia tygodnia, w którym znajduje się pierwszy i ostatni dzień miesiąca.
 *      Są dodawane dni przed pierwszym dniem i po ostatnim dniu miesiąca, aby uzupełnić widok kalendarza.
 *
 * 3. **Mapowanie na `CalendarMonthType`**:
 *    - Obiekty `monthsRaw` są mapowane na format `CalendarMonthType`, gdzie dni są dzielone na tygodnie według `rowSize`.
 *    - Dni offsetowe są oznaczane jako `isOffset: true` w celu odróżnienia ich od standardowych dni miesiąca.
 *
 * 4. **Filtrowanie nulli**:
 *    - Na końcu funkcja filtruje wyniki, usuwając ewentualne `null` z tablicy, co może mieć miejsce, gdy miesiąc
 *      ma mniej niż 8 dni.
 */
export function segregateDatesMonthly(
  days: CalendarDayType[],
  rowSize: number
): CalendarMonthType[] {
  // 1. Group days by month and year
  const monthsRaw: MonthsRaw = days.reduce((acc, day) => {
    const monthKey = day.date.slice(0, 7);
    const currentDay = dayjs(day.date);

    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: currentDay.month(),
        year: currentDay.year(),
        days: [],
      };
    }

    acc[monthKey].days.push(day);

    return acc;
  }, {} as MonthsRaw);

  // 2. calculate prefix and suffix of each month
  const prefixedAdnSuffixedMonths = Object.values(monthsRaw).map(
    (monthItem) => {
      if (monthItem.days.length <= 7) {
        return null;
      }
      const firstDay = monthItem.days[0].date;
      const lastDay = monthItem.days[monthItem.days.length - 1].date;

      const prefixStartOfWeek = dayjs(firstDay).startOf('week');
      const prefixStart =
        prefixStartOfWeek.format(dateFormat) ===
        dayjs(firstDay).format(dateFormat)
          ? dayjs(firstDay).clone().subtract(1, 'week')
          : dayjs(firstDay).startOf('week');
      const prefixEnd = dayjs(firstDay);

      const suffixStart = dayjs(lastDay).clone().add(1, 'day');
      const suffixEnd = dayjs(lastDay).endOf('week').clone().add(1, 'day');

      const prefix = getDaysBetweenDates(prefixStart, prefixEnd).map((day) => {
        return {
          ...day,
          isOffset: true,
        };
      });

      const suffix = getDaysBetweenDates(suffixStart, suffixEnd).map((day) => {
        return {
          ...day,
          isOffset: true,
        };
      });

      // 3. map to CalendarMonthType
      return {
        monthIndex: monthItem.month,
        yearIndex: monthItem.year,
        weeks: splitEvenly([...prefix, ...monthItem.days, ...suffix], rowSize),
      };
    }
  );

  return prefixedAdnSuffixedMonths.filter((item) => item !== null);
}
