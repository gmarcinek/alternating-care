'use client';

import { Calendar } from '@components/Calendar/Calendar';
import { Stack } from '@components/Stack/Stack';

import { dateFormat } from '@utils/dates';
import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';

import { useSelection } from '@modules/CalendarPage/components/EventFormCalendar/useSelection';
import { useGetAllEventsMutation } from '@modules/db/events/useGetAllEventsMutation';
import { CalendarEvent } from '@modules/db/types';
import { Divider } from '@nextui-org/react';
import { sortBy } from '@utils/array';
import { capitalizeFirstLetter } from '@utils/string';
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

      <section className={styles.heading}>
        <Divider className='mb-2' />
        <h3>
          <span>{capitalizeFirstLetter(dayjs(startDate).format('MMMM'))}</span>
          <span className={styles.year}>
            {dayjs(startDate).format(' YYYY')}
          </span>
        </h3>
        <Divider className='mt-2' />
      </section>

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

      <section className={styles.heading}>
        <Divider className='mb-2' />
        <h3>
          <span>
            {capitalizeFirstLetter(
              dayjs(startDate).add(1, 'month').format('MMMM')
            )}
          </span>
          <span className={styles.year}>
            {dayjs(startDate).format(' YYYY')}
          </span>
        </h3>
        <Divider className='mt-2' />
      </section>

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
    </Stack>
  );
}
