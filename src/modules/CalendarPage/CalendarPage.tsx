'use client';

import { ErrorMessage } from '@components/ErrorMessage/ErrorMessage';
import PageContainer from '@components/PageContainer/PageContainer';
import { useGetAllEventsMutation } from '@modules/db/events/useGetAllEventsMutation';
import { TodayButton } from '@modules/TodayButton/TodayButton';
import { useEffect } from 'react';
import { EventFormCalendar } from './components/EventFormCalendar/EventFormCalendar';

export const CalendarPage = () => {
  const { isError, refetch: fetchEvents, mutation } = useGetAllEventsMutation();

  useEffect(() => {
    void mutation.mutate();
  }, [fetchEvents]);

  if (isError) {
    return <ErrorMessage message={'Unexpected error occurred'} />;
  }

  return (
    <PageContainer>
      <EventFormCalendar fetchEventsMutation={mutation} />
      <TodayButton />
    </PageContainer>
  );
};
