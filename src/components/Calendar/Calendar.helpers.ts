import { CalendarDayType } from '@modules/db/types';
import { splitEvenly } from '@utils/array';
import { dateFormat } from '@utils/dates';
import dayjs from 'dayjs';
import { CalendarMonthRawType, CalendarMonthType } from './Calendar.types';
import { getDaysBetweenDates } from './hooks/useCalendarDates';

type MonthsRaw = Record<string, CalendarMonthRawType>;
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
