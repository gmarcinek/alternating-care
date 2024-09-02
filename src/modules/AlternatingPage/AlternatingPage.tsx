'use client';

import { ErrorMessage } from '@components/ErrorMessage/ErrorMessage';
import PageContainer from '@components/PageContainer/PageContainer';
import { useGetAlternatingEventsQuery } from '@modules/db/events/useGetAlternatingEventsQuery';
import { CalendarEventType } from '@modules/db/types';
import { TodayButton } from '@modules/TodayButton/TodayButton';
import { AlternatingFormCalendar } from './components/EventFormCalendar/AlternatingFormCalendar';

export const AlternatingPage = () => {
  const { isError, mutation } = useGetAlternatingEventsQuery(
    CalendarEventType.Alternating
  );

  if (isError) {
    return <ErrorMessage message={'Unexpected error occurred'} />;
  }

  return (
    <PageContainer>
      <AlternatingFormCalendar fetchEventsMutation={mutation} />
      <TodayButton />
    </PageContainer>
  );
};
