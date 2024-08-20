'use client';

import { Stack, StackGap } from '@/src/components/Stack/Stack';
import { forwardRef } from 'react';
import { CalendarMonthType } from '../../Calendar.types';
import { CalendarMonth } from '../CallendarMonth/CallendarMonth';

interface CalendarMonthsProps {
  months: CalendarMonthType[];
  gap: StackGap;
}

export const CalendarMonths = forwardRef<HTMLDivElement, CalendarMonthsProps>(
  (props: CalendarMonthsProps, ref) => {
    const { months, gap } = props;

    return (
      <Stack gap={gap}>
        {months.map((month) => {
          return (
            <CalendarMonth
              gap={gap}
              month={month}
              key={`year-${month.yearIndex}-month-${month.monthIndex}`}
            />
          );
        })}
      </Stack>
    );
  }
);
