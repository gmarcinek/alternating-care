'use client';

import { Stack, StackGap } from '@components/Stack/Stack';
import { CalendarDayType } from '@modules/db/types';
import { useMemo } from 'react';
import { useCalenderContext } from '../../Calendar.context';
import CalendarDay from '../CalendarDay/CalendarDay';
import { CalendarPlanSection } from '../CalendarPlanSection/CalendarPlanSection';
import CalendarWeekInfoSection from '../CalendarWeekInfoSection/CalendarWeekInfoSection';
import style from './CalendarWeek.module.scss';

interface CallendarWeekProps {
  week: CalendarDayType[];
  gap: StackGap;
  monthIndex?: number;
}

export function CalendarWeek(props: CallendarWeekProps) {
  const { week, gap } = props;
  const { rowSize, isPlanVisible, events } = useCalenderContext();

  const eventsOfTheWeek = useMemo(() => {
    const weekDates = week.map((day) => day.date);

    return events.filter((event) => weekDates.includes(event.date));
  }, [events, week]);

  return (
    <Stack gap={8} className={style.calendarWeek}>
      {rowSize !== 1 && isPlanVisible && (
        <CalendarWeekInfoSection week={week} />
      )}

      <Stack gap={gap} direction='horizontal' contentAlignment='between'>
        {week.map((day, weekDayIndex) => {
          return (
            <CalendarDay
              day={day}
              key={`day-${day.date}-${weekDayIndex}`}
              className={style.item}
            />
          );
        })}
      </Stack>
      {rowSize !== 1 && isPlanVisible && (
        <CalendarPlanSection eventsOfTheWeek={eventsOfTheWeek} week={week} />
      )}
    </Stack>
  );
}
