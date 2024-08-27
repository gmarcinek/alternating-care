import { CalendarDayType } from '@modules/db/types';
import { dateFormat } from '@utils/dates';
import dayjs, { Dayjs } from 'dayjs';
import { useMemo } from 'react';

interface UseCalendarDatesProps {
  startDate: string;
  rowSize: number;
}

export const useCalendarDates = (props: UseCalendarDatesProps) => {
  const { startDate, rowSize } = props;
  const baseDate = dayjs(startDate);

  const splits = useMemo(() => {
    return {
      row1: toFullWeeksDates(baseDate, baseDate.add(3, 'month')),
      row7: toFullMonthsDates(baseDate, baseDate.add(12, 'month')),
      row14: toRowXDates(baseDate, baseDate.add(12, 'month'), 14),
    };
  }, [startDate]);

  const calendarDates = useMemo(() => {
    switch (rowSize) {
      case 1:
        return splits.row1;

      case 7:
        return splits.row7;

      case 14:
        return splits.row14;

      default:
        return splits.row7;
    }
  }, [startDate, rowSize, splits]);

  return calendarDates;
};

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
