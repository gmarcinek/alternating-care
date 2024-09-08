'use client';

import { useGetAlternatingEventsQuery } from '@api/db/events/useGetAlternatingEventsQuery';
import DashboardContainer from '@components/DashboardContainer/DashboardContainer';
import { ErrorMessage } from '@components/ErrorMessage/ErrorMessage';

import { CalendarEventType } from '@components/Calendar/Calendar.types';
import { TodayButton } from '@modules/TodayButton/TodayButton';
import { AlternatingFormCalendar } from './components/AlternatingFormCalendar/AlternatingFormCalendar';

export const AlternatingPage = () => {
  const { isError, mutation } = useGetAlternatingEventsQuery(
    CalendarEventType.Alternating
  );

  if (isError) {
    return <ErrorMessage message={'Unexpected error occurred'} />;
  }

  return (
    <DashboardContainer>
      <AlternatingFormCalendar fetchEventsMutation={mutation} />
      <TodayButton />
    </DashboardContainer>
  );
};
