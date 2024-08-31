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
    return sortBy(data, 'type');
  }, [mutation.data]);

  useEffect(() => {
    void mutation.mutate();
  }, []);

  return (
    <Stack className={styles.eventFormCalendar} gap={0}>
      <h3 className='mb-8'>Przegląd miesiąca</h3>

      <Calendar
        startDate={startDate}
        endDate={endDate}
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

      <Calendar
        startDate={dayjs(startDate)
          .add(1, 'month')
          .startOf('month')
          .format(dateFormat)}
        endDate={dayjs(startDate)
          .add(1, 'month')
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

      <Calendar
        startDate={dayjs(startDate)
          .add(2, 'month')
          .startOf('month')
          .format(dateFormat)}
        endDate={dayjs(startDate)
          .add(2, 'month')
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

      <Calendar
        startDate={dayjs(startDate)
          .add(3, 'month')
          .startOf('month')
          .format(dateFormat)}
        endDate={dayjs(startDate)
          .add(3, 'month')
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
    </Stack>
  );
}
