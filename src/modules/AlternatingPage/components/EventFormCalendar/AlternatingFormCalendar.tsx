'use client';

import { Calendar } from '@components/Calendar/Calendar';
import { useUpsertEventsMutation } from '@modules/db/events/useUpsertEventsMutation';
import { CalendarEvent } from '@modules/db/types';
import { UseQueryResult } from '@tanstack/react-query';
import { dateFormat } from '@utils/dates';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import styles from './AlternatingFormCalendar.module.scss';
import { useAlternatingSelection } from './useAlternatingSelection';

interface EventFormCalendarProps {
  fetchEventsMutation: UseQueryResult<CalendarEvent[], Error>;
}

export const AlternatingFormCalendar = (props: EventFormCalendarProps) => {
  const { fetchEventsMutation } = props;
  const startDate = dayjs().format(dateFormat);
  const { selection, handlers, setSelection } = useAlternatingSelection({
    isMultiSelectionAvailable: true,
  });
  const { mutate: upsertEvents } = useUpsertEventsMutation({
    onSuccess() {
      setSelection(new Set([]));
      fetchEventsMutation.refetch();
    },
  });

  const sortedEvents = useMemo(() => {
    return fetchEventsMutation.data || ([] as CalendarEvent[]);
  }, [fetchEventsMutation.data]);

  const formClasses = classNames(styles.eventFormCalendar);

  return (
    <div className={formClasses}>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((m, index) => {
        return (
          <Calendar
            key={`month-plan-view-${index}`}
            className={styles.calendar}
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
            // isPlanVisible
            isWeekendsVisible
            isAlternatingVisible
            displayStrategy='separateMonths'
            events={sortedEvents ?? []}
            {...handlers}
            onDayClick={() => {
              upsertEvents(
                Array.from(selection).map((date) => {
                  return {
                    date,
                  };
                })
              );
            }}
            isMultiSelectionMode={false}
          />
        );
      })}
    </div>
  );
};
