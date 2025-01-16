'use client';

import { CalendarEvent } from '@api/db/types';
import { Calendar } from '@components/Calendar/Calendar';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import { useDashboardPageContext } from '@modules/DashboardPage/DashboardPage.context';
import { generateAbsArray } from '@utils/array';
import dayjs from 'dayjs';
import { CalendarPointerHandlers } from '../Dashboard/useSelection';
import styles from './CalendarGrid.module.scss';

interface CalendarGridProps {
  data: CalendarEvent[];
  isAlternatingVisible: boolean;
  isEventsVisible: boolean;
  isMultiSelectionMode: boolean;
  handlers: CalendarPointerHandlers;
  selection: Set<string>;
}

export const CalendarGrid = (props: CalendarGridProps) => {
  const { startDate, endDate } = useDashboardPageContext();
  const {
    data,
    isAlternatingVisible,
    isMultiSelectionMode,
    selection,
    handlers,
    isEventsVisible,
  } = props;

  const startingDate = dayjs(startDate).format(dateFormat);
  const gridLength = endDate
    ? Math.abs(dayjs(endDate).diff(startingDate, 'month')) + 1
    : 12;

  return (
    <div className={styles.calendarGrid}>
      {generateAbsArray(gridLength).map((m, index) => {
        return (
          <Calendar
            className={styles.calendar}
            key={`month-plan-view-${index}`}
            startDate={dayjs(startingDate)
              .add(index, 'month')
              .startOf('month')
              .format(dateFormat)}
            endDate={dayjs(startingDate)
              .add(index, 'month')
              .endOf('month')
              .add(1, 'day')
              .format(dateFormat)}
            rowSize={7}
            isTodayVisible
            isWeekendsVisible
            isPlanVisible={false}
            isAlternatingVisible={isAlternatingVisible}
            isEventsVisible={isEventsVisible}
            displayStrategy='separateMonths'
            events={data}
            {...handlers}
            selection={Array.from(selection)}
            isMultiSelectionMode={isMultiSelectionMode}
          />
        );
      })}
    </div>
  );
};
