'use client';

import { useUpsertEventsMutation } from '@api/db/events/useUpsertEventsMutation';
import { CalendarEvent } from '@api/db/types';
import { Calendar } from '@components/Calendar/Calendar';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import { useEditPageContext } from '@modules/EditPage/EditPage.context';
import { UseQueryResult } from '@tanstack/react-query';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import styles from './EditFormCalendar.module.scss';
import { useEditSelection } from './useEditSelection';

interface EventFormCalendarProps {
  fetchEventsMutation: UseQueryResult<CalendarEvent[], Error>;
}

export const EditFormCalendar = (props: EventFormCalendarProps) => {
  const { fetchEventsMutation } = props;
  const startDate = dayjs().format(dateFormat);
  const { selection, handlers, setSelection } = useEditSelection({
    isMultiSelectionAvailable: true,
  });
  const { groupId } = useEditPageContext();

  const { mutate: upsertEvents } = useUpsertEventsMutation(groupId, {
    onSuccess() {
      setSelection(new Set([]));
      fetchEventsMutation.refetch();
    },
  });

  const sortedEvents = useMemo(() => {
    return fetchEventsMutation.data || ([] as CalendarEvent[]);
  }, [fetchEventsMutation.data]);

  const formClasses = classNames(styles.editFormCalendar, 'py-4 pt-8');

  return (
    <div className={styles.editFormCalendarPage}>
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
              isAlternatingVisible={false}
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
