'use client';

import { Stack, StackGap } from '@components/Stack/Stack';
import { CalendarDay } from '@modules/db/types';
import { forwardRef } from 'react';
import { CallendarWeek } from '../CallendarWeek/CallendarWeek';

interface CallendarUngrupedProps {
  weeks: CalendarDay[][];
  gap: StackGap;
}

export const CallendarUngruped = forwardRef<
  HTMLDivElement,
  CallendarUngrupedProps
>((props: CallendarUngrupedProps, ref) => {
  const { weeks, gap } = props;

  return (
    <Stack gap={gap} ref={ref}>
      {weeks.map((week, weekIndex) => {
        return (
          <CallendarWeek
            key={`week-of-${week[0].date}-${weekIndex}`}
            week={week}
            gap={gap}
          />
        );
      })}
    </Stack>
  );
});
