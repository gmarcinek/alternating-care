'use client';

import { Calendar } from '@components/Calendar/Calendar';
import { Stack } from '@components/Stack/Stack';
import { useUpsertEventsMutation } from '@modules/db/events/useUpsertEventsMutation';
import { CalendarEvent } from '@modules/db/types';
import { UseQueryResult } from '@tanstack/react-query';
import { dateFormat } from '@utils/dates';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import styles from './AlternatingFormCalendar.module.scss';
import { useSelection } from './useSelection';

interface EventFormCalendarProps {
  fetchEventsMutation: UseQueryResult<CalendarEvent[], Error>;
}

export const AlternatingFormCalendar = (props: EventFormCalendarProps) => {
  const { fetchEventsMutation } = props;
  const startDate = dayjs().format(dateFormat);
  const { selection, handlers, setSelection } = useSelection({
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

  const formClasses = classNames(
    styles.formContainer,
    'scrollSmall sticky t-20 z-10 h-1'
  );

  return (
    <Stack gap={0} className={styles.eventFormCalendar}>
      <Stack direction='horizontal' gap={24}>
        <Calendar
          startDate={startDate}
          rowSize={7}
          isTodayVisible
          isAlternatingVisible
          events={sortedEvents}
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
        />

        <div className={formClasses}>
          <Stack>
            <Stack className={styles.calendarDetails}></Stack>
          </Stack>
        </div>
      </Stack>
    </Stack>
  );
};
