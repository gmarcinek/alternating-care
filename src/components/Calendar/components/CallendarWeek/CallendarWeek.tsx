'use client';

import { Stack, StackGap } from '@/src/components/Stack/Stack';
import { CalendarDay } from '@/src/modules/db/types';
import { useCalenderContext } from '../../Calendar.context';
import { CalendarItemBodySingle } from '../CalendarItemBodySingle/CalendarItemBodySingle';
import { CalendarItemBodyTwoWeeks } from '../CalendarItemBodyTwoWeeks/CalendarItemBodyTwoWeeks';
import { CalendarItemBodyWeek } from '../CalendarItemBodyWeek/CalendarItemBodyWeek';
import { CalendarPlanSection } from '../CalendarPlanSection/CalendarPlanSection';
import CalendarWeekInfoSection from '../CalendarWeekInfoSection/CalendarWeekInfoSection';
import styles from './CallendarWeek.module.scss';

interface CallendarWeekProps {
  week: CalendarDay[];
  gap: StackGap;
  monthIndex?: number;
}

export function CallendarWeek(props: CallendarWeekProps) {
  const { week, gap } = props;
  const { rowSize, isPlanVisible } = useCalenderContext();

  return (
    <Stack gap={8}>
      {rowSize !== 1 && isPlanVisible && (
        <CalendarWeekInfoSection week={week} />
      )}

      <Stack gap={gap} direction='horizontal' contentAlignment='between'>
        {week.map((day, weekDayIndex) => {
          if (day.isOffset) {
            return (
              <div
                className={styles.emptyDay}
                key={`empty-day-${day.date}-${weekDayIndex}`}
              ></div>
            );
          }

          switch (rowSize) {
            case 1:
              return (
                <CalendarItemBodySingle
                  day={day}
                  key={`day-single-${day.date}`}
                />
              );

            case 7:
              return (
                <CalendarItemBodyWeek day={day} key={`day-wweek-${day.date}`} />
              );

            case 14:
              return (
                <CalendarItemBodyTwoWeeks
                  day={day}
                  key={`day-two-wweeks-${day.date}`}
                />
              );

            default:
              return (
                <CalendarItemBodyTwoWeeks
                  day={day}
                  key={`day-two-wweeks-default-${day.date}`}
                />
              );
          }
        })}
      </Stack>
      {![1, 10, 14].includes(rowSize) && isPlanVisible && (
        <CalendarPlanSection week={week} />
      )}
    </Stack>
  );
}
