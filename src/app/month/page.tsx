'use client';

import { Calendar } from '@components/Calendar/Calendar';
import { Stack } from '@components/Stack/Stack';

import { dateFormat } from '@utils/dates';
import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';

import { useSelection } from '@modules/CalendarPage/components/EventFormCalendar/useSelection';
import { useGetAllEventsMutation } from '@modules/db/events/useGetAllEventsMutation';
import { CalendarEvent } from '@modules/db/types';
import { sortBy } from '@utils/array';
import styles from './page.module.scss';

export default function Page() {
  const startDate = dayjs().startOf('month').format(dateFormat);
  const endDate = dayjs().endOf('month').add(1, 'day').format(dateFormat);
  const { selection, handlers } = useSelection({});
  const { mutation } = useGetAllEventsMutation();

  const sortedEvents = useMemo(() => {
    const data = mutation.data || ([] as CalendarEvent[]);
    return sortBy(data, 'creationTime');
  }, [mutation.data]);

  useEffect(() => {
    void mutation.mutate();
  }, []);

  return (
    <Stack className={styles.eventFormCalendar} gap={0}>
      <h3 className='mb-8'>Przegląd miesiąca</h3>

      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((m, index) => {
        return (
          <Calendar
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
            rowSize={30}
            isTodayVisible
            isPlanVisible
            isWeekendsVisible
            isAlternatingVisible
            displayStrategy='continous'
            events={sortedEvents ?? []}
            {...handlers}
            selection={Array.from(selection)}
            isMultiSelectionMode={false}
          />
        );
      })}
    </Stack>
  );
}
