'use client';

import { Stack, StackGap } from '@/src/components/Stack/Stack';
import { CalendarDay } from '@/src/modules/db/types';
import { useCalenderContext } from '../../Calendar.context';
import { CalendarItemBodySingle } from '../CalendarItemBodySingle/CalendarItemBodySingle';
import { CalendarItemBodyTwoWeeks } from '../CalendarItemBodyTwoWeeks/CalendarItemBodyTwoWeeks';
import { CalendarItemBodyWeek } from '../CalendarItemBodyWeek/CalendarItemBodyWeek';
import { CalendarPlanSection } from '../CalendarPlanSection/CalendarPlanSection';
import CalendarWeekInfoSection from '../CalendarWeekInfoSection/CalendarWeekInfoSection';

interface CallendarWeekProps {
  week: CalendarDay[];
  gap: StackGap;
}

export function CallendarWeek(props: CallendarWeekProps) {
  const { week, gap } = props;
  const { rowSize, isWeeksSplitted } = useCalenderContext();
  return (
    <Stack gap={8}>
      {rowSize !== 1 && isWeeksSplitted && (
        <CalendarWeekInfoSection week={week} />
      )}

      <Stack gap={gap} direction='horizontal' contentAlignment='between'>
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
      {![1, 10, 14].includes(rowSize) && isWeeksSplitted && (
        <CalendarPlanSection week={week} />
      )}
    </Stack>
  );
}
