'use client';

import { Calendar } from '@components/Calendar/Calendar';
import { CalendarEvent } from '@modules/db/types';
import { dateFormat } from '@utils/dates';
import dayjs from 'dayjs';
import { CalendarPointerHandlers } from '../Dashboard/useSelection';
import styles from './CalendarGrid.module.scss';

interface CalendarGridProps {
  data: CalendarEvent[];
  isPlanVisible: boolean;
  isAlternatingVisible: boolean;
  handlers: CalendarPointerHandlers;
  selection: Set<string>;
}

export const CalendarGrid = (props: CalendarGridProps) => {
  const { data, isAlternatingVisible, isPlanVisible, selection, handlers } =
    props;
  const startDate = dayjs().format(dateFormat);

  return (
    <div className={styles.calendarGrid}>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((m, index) => {
        return (
          <Calendar
            className={styles.calendar}
            key={`month-plan-view-${index}`}
            startDate={dayjs(startDate)
              .add(index, 'month')
              .startOf('month')
              .format(dateFormat)}
            endDate={dayjs(startDate)
              .add(index, 'month')
              .endOf('month')
              .add(1, 'day')
              .format(dateFormat)}
            rowSize={7}
            isTodayVisible
            isWeekendsVisible
            isPlanVisible={false}
            isAlternatingVisible={isAlternatingVisible}
            displayStrategy='separateMonths'
            events={data}
            {...handlers}
            selection={Array.from(selection)}
          />
        );
      })}
    </div>
  );
};
