import { Stack, StackGap } from '@/src/components/Stack/Stack';
import { splitEvenly } from '@/src/utils/array';
import { NUMBER_SEVEN } from '@/src/utils/number';
import { useBreakpoints } from '@/src/utils/useBreakpoints';
import { useMemo } from 'react';
import { CalendarItemBodySingle } from './components/CalendarItemBodySingle/CalendarItemBodySingle';
import { CalendarItemBodyTwoWeeks } from './components/CalendarItemBodyTwoWeeks/CalendarItemBodyTwoWeeks';
import { CalendarItemBodyWeek } from './components/CalendarItemBodyWeek/CalendarItemBodyWeek';
import { useCalendarUtil } from './useCalendarUtil';

interface CalendarProps {
  startDate: string;
  rowSize: number;
}

export function Calendar(props: CalendarProps) {
  const { startDate, rowSize = NUMBER_SEVEN } = props;

  const { calendarDates } = useCalendarUtil({
    startDate,
    rowSize,
  });

  const { isBigDesktop, isDesktop, isMobile, isTablet } = useBreakpoints();

  const { weeks, gap } = useMemo(() => {
    const weeks = splitEvenly(calendarDates, rowSize);
    const gap = toGapSize({
      rowSize,
      isMobile,
      isTablet,
      isDesktop,
      isBigDesktop,
    });

    return {
      weeks,
      gap,
    };
  }, [rowSize, calendarDates, isMobile, isTablet, isDesktop, isBigDesktop]);

  return (
    <Stack gap={gap}>
      {weeks.map((week, weekIndex) => {
        return (
          <Stack
            gap={gap}
            key={`week-of-${week[0].date}-${weekIndex}`}
            direction='horizontal'
            contentAlignment='between'
          >
            {week.map((day) => {
              switch (rowSize) {
                case 1:
                  return <CalendarItemBodySingle day={day} key={day.date} />;
                case 7:
                  return <CalendarItemBodyWeek day={day} key={day.date} />;
                case 10:
                case 14:
                  return <CalendarItemBodyTwoWeeks day={day} key={day.date} />;
                default:
                  return <CalendarItemBodyTwoWeeks day={day} key={day.date} />;
              }
            })}
          </Stack>
        );
      })}
    </Stack>
  );
}

interface ToGapSizeProps {
  rowSize: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isBigDesktop: boolean;
}
function toGapSize(props: ToGapSizeProps): StackGap {
  const { isBigDesktop, isDesktop, isMobile, isTablet, rowSize } = props;

  if (isMobile) {
    switch (rowSize) {
      case 1:
        return 12;
      case 7:
        return 4;
      case 10:
      case 14:
        return 2;
    }
  }

  if (isTablet) {
    switch (rowSize) {
      case 1:
        return 12;
      case 7:
        return 12;
      case 10:
      case 14:
        return 4;
    }
  }

  if (isDesktop) {
    switch (rowSize) {
      case 1:
        return 16;
      case 7:
        return 12;
      case 10:
      case 14:
        return 8;
    }
  }

  if (isBigDesktop) {
    switch (rowSize) {
      case 1:
        return 16;
      case 7:
        return 12;
      case 10:
      case 14:
        return 8;
    }
  }

  return 2;
}
