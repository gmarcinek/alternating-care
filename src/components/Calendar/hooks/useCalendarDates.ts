import { toFullMonthsDates, toFullWeeksDates, toRowXDates } from '@utils/dates';
import dayjs from 'dayjs';
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
