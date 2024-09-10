'use client';

import { useGetAllEventsQuery } from '@api/db/events/useGetAllEventsQuery';
import DashboardContainer from '@components/DashboardContainer/DashboardContainer';
import { ErrorMessage } from '@components/ErrorMessage/ErrorMessage';
import { TodayButton } from '@modules/TodayButton/TodayButton';
import { useMemo } from 'react';
import { Dashboard } from './components/Dashboard/Dashboard';
import { DashboardPageContext } from './DashboardPage.context';

export const DashboardPage = () => {
  const { query, refetch } = useGetAllEventsQuery();

  if (query.isError) {
    return <ErrorMessage message={'Unexpected error occurred'} />;
  }

  const contextData = useMemo(() => {
    return {
      updateAllEvents: refetch,
    };
  }, [refetch]);

  return (
    <DashboardPageContext.Provider value={contextData}>
      <DashboardContainer>
        <Dashboard fetchEventsQuery={query} />
        <TodayButton />
      </DashboardContainer>
    </DashboardPageContext.Provider>
  );
};
