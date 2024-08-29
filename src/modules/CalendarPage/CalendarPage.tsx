'use client';

import { ErrorMessage } from '@components/ErrorMessage/ErrorMessage';
import PageContainer from '@components/PageContainer/PageContainer';
import { useFetchAllEventsQuery } from '@modules/db/events/useFetchAllEventsQuery';
import { TodayButton } from '@modules/TodayButton/TodayButton';
import { Spinner } from '@nextui-org/react';
import { EventFormCalendar } from './components/EventFormCalendar/EventFormCalendar';

export const CalendarPage = () => {
  const { isPending, isError, data } = useFetchAllEventsQuery();

  if (isError) {
    return <ErrorMessage message={'Unexpected error occurred'} />;
  }

  if (isPending) {
    return (
      <div className='container mx-auto mb-10 mt-60 flex flex-1 flex-col px-4'>
        <Spinner color='danger' />
      </div>
    );
  }

  return (
    <PageContainer>
      <EventFormCalendar data={data} />
      <TodayButton />
    </PageContainer>
  );
};
