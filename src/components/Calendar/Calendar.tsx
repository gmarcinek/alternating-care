import { Stack, StackGap } from '@/src/components/Stack/Stack';
import { splitEvenly } from '@/src/utils/array';
import { NUMBER_SEVEN } from '@/src/utils/number';
import { useMemo } from 'react';
import { CalendarItem } from './components/CalendarItem/CalendarItem';
import { useCalendarUtil } from './useCalendarUtil';

interface CalendarProps {
  countingRange: number;
  startDate: string;
  rowSize: number;
}

export function Calendar(props: CalendarProps) {
  const { countingRange, startDate, rowSize = NUMBER_SEVEN } = props;
  const { calendarDates } = useCalendarUtil({
    countingRange,
    startDate,
  });

  const { weeks, gapSize } = useMemo(() => {
    const weeks = splitEvenly(calendarDates, rowSize);
    const gapSize = toGapSize(rowSize);

    return {
      weeks,
      gapSize,
    };
  }, [rowSize]);

  return (
    <Stack gap={gapSize}>
      {weeks.map((week, weekIndex) => {
        return (
          <Stack
            gap={gapSize}
            key={`week-of-${week[0].date}-${weekIndex}`}
            direction='horizontal'
          >
            {week.map((day) => {
              return (
                <CalendarItem day={day} key={day.date} rowSize={rowSize} />
              );
            })}
          </Stack>
        );
      })}
    </Stack>
  );
}

function toGapSize(rowSize: number): StackGap {
  if (rowSize <= 7) {
    return 16;
  }
  if (rowSize <= 9) {
    return 12;
  }
  if (rowSize <= 12) {
    return 8;
  }

  return 4;
}
