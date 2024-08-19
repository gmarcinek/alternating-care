'use client';

import { Stack, StackGap } from '@/src/components/Stack/Stack';
import { CalendarMonthType } from '../../Calendar.types';
import { CallendarWeek } from '../CallendarWeek/CallendarWeek';

interface CalendarMonthProps {
  month: CalendarMonthType;
  gap: StackGap;
}

export function CalendarMonth(props: CalendarMonthProps) {
  const { month, gap } = props;
  return (
    <Stack gap={gap}>
      <h4>{month.monthIndex}</h4>
      {month.weeks.map((week, weekIndex) => {
        return (
          <CallendarWeek
            key={`week-of-${week[0].date}-${weekIndex}`}
            week={week}
            gap={gap}
            monthIndex={month.monthIndex}
          />
        );
      })}
    </Stack>
  );
}
