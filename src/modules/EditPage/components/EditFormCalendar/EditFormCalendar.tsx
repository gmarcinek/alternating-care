'use client';

import { useUpsertEventsMutation } from '@api/db/events/useUpsertEventsMutation';
import { CalendarEvent } from '@api/db/types';
import { Calendar } from '@components/Calendar/Calendar';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import { useEditPageContext } from '@modules/EditPage/EditPage.context';
import { UseQueryResult } from '@tanstack/react-query';
import { generateAbsArray } from '@utils/array';
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

  const { startDate, endDate } = useEditPageContext();
  const startingDate = dayjs(startDate).format(dateFormat);
  const gridLength = endDate
    ? Math.abs(dayjs(endDate).diff(startingDate, 'month')) + 1
    : 12;

  return (
    <div className={styles.editFormCalendarPage}>
      <div className={formClasses}>
        {generateAbsArray(gridLength).map((m, index) => {
          return (
            <Calendar
              key={`month-plan-view-${index}`}
              className={styles.calendar}
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
