'use client';

import { useUpsertEventsMutation } from '@api/db/events/useUpsertEventsMutation';
import { CalendarEvent, CalendarEventType } from '@api/db/types';
import { Calendar } from '@components/Calendar/Calendar';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import { RangeNavigation } from '@components/RangeNavigation/RangeNavigation';
import { UseQueryResult } from '@tanstack/react-query';
import { generateAbsArray } from '@utils/array';
import { useAppSearchParams } from '@utils/useAppSearchParams';
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
  const { startDate } = useAppSearchParams();

  const { selection, handlers, setSelection } = useAlternatingSelection({
    isMultiSelectionAvailable: true,
  });
  const { mutate: upsertEvents } = useUpsertEventsMutation(
    CalendarEventType.Alternating,
    {
      onSuccess() {
        setSelection(new Set([]));
        fetchEventsMutation.refetch();
      },
    }
  );

  const sortedEvents = useMemo(() => {
    return fetchEventsMutation.data || ([] as CalendarEvent[]);
  }, [fetchEventsMutation.data]);

  const formClasses = classNames(styles.alternatingFormCalendar, 'py-2');
  const gridLength = 12;

  return (
    <div className={styles.alternatingFormCalendarPage}>
      <div className='mt-4'>
        <RangeNavigation contentAlignment='center' />
      </div>

      <div className={formClasses}>
        {generateAbsArray(gridLength).map((m, index) => {
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
    </div>
  );
};
