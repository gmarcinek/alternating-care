'use client';

import DashboardContainer from '@components/DashboardContainer/DashboardContainer';
import { ErrorMessage } from '@components/ErrorMessage/ErrorMessage';
import { useGetAllEventsQuery } from '@modules/db/events/useGetAllEventsQuery';
import { TodayButton } from '@modules/TodayButton/TodayButton';
import { Dashboard } from './components/Dashboard/Dashboard';

export const DashboardPage = () => {
  const { query } = useGetAllEventsQuery();

  if (query.isError) {
    return <ErrorMessage message={'Unexpected error occurred'} />;
  }

  return (
    <DashboardContainer>
      <Dashboard fetchEventsQuery={query} />
      <TodayButton />
    </DashboardContainer>
  );
};
