import { Dayjs } from 'dayjs';
import { useMemo } from 'react';

interface UseCalendarItemProps {
  rowSize: number;
  currentDate: Dayjs;
}

export const useCalendarItem = (props: UseCalendarItemProps) => {
  const { rowSize, currentDate } = props;
  const config = useMemo(() => {
    return {
      month: toMonthSetup(rowSize, currentDate),
      day: toDaySetup(rowSize, currentDate),
      weekday: toWeekdaySetup(rowSize, currentDate),
    };
  }, [rowSize, currentDate]);

  return {
    config,
  };
};

function toWeekdaySetup(rowSize: number, currentDate: Dayjs) {
  if (rowSize < 4) {
    return {
      label: currentDate.format('dddd'),
    };
  }

  if (rowSize < 8) {
    return {
      label: currentDate.format('dd'),
    };
  }

  return {
    label: currentDate.format('d'),
  };
}

function toMonthSetup(rowSize: number, currentDate: Dayjs) {
  if (rowSize < 4) {
    return {
      label: currentDate.format('MMMM'),
    };
  }

  if (rowSize < 8) {
    return {
      label: currentDate.format('MM'),
    };
  }

  return {
    label: currentDate.format('M'),
  };
}

function toDaySetup(rowSize: number, currentDate: Dayjs) {
  if (rowSize < 4) {
    return {
      label: currentDate.format('DD'),
    };
  }

  if (rowSize < 9) {
    return {
      label: currentDate.format('DD'),
    };
  }

  return {
    label: currentDate.format('DD'),
  };
}
