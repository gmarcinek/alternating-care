import { CalendarDay } from '@/src/modules/db/types';
import { dateFormat } from '@/src/utils/dates';
import dayjs, { Dayjs } from 'dayjs';
import { useMemo } from 'react';

interface UseCalendarUtilProps {
  startDate: string;
  countingRange: number;
}

export const useCalendarUtil = (props: UseCalendarUtilProps) => {
  const { countingRange, startDate } = props;

  const api = useMemo(() => {
    const today = dayjs().format(dateFormat);

    return {
      today,
      calendarDates: toRangeDates(startDate),
    };
  }, [startDate]);

  return {
    ...api,
  };
};

export function toRangeDates(start: string | Dayjs) {
  const startDate = dayjs(start);
  const startDateFirstDayOfTheMonth = startDate
    .startOf('month')
    .clone()
    .startOf('week');
  const endDate = startDate
    .add(6, 'months')
    .endOf('month')
    .clone()
    .endOf('week')
    .clone()
    .add(1, 'day');

  return getDaysBetweenDates(startDateFirstDayOfTheMonth, endDate);
}

function getDaysBetweenDates(start: string | Dayjs, end: string | Dayjs) {
  const days: CalendarDay[] = [];
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
          day: startDate.format('D'),
          weekday: startDate.format('dd'),
        });
      } else {
        days.push({
          date: indexDay.format(dateFormat),
          day: indexDay.format('D'),
          weekday: indexDay.format('dd'),
        });
      }

      return indexDay.add(1, 'day');
    }, startDate);

  return days;
  // return days.length % 2 !== 0 ? days.slice(0, days.length - 7) : days;
}
