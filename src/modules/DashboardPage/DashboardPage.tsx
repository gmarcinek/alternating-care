'use client';

import { useGetAllEventsQuery } from '@api/db/events/useGetAllEventsQuery';
import DashboardContainer from '@components/DashboardContainer/DashboardContainer';
import { ErrorMessage } from '@components/ErrorMessage/ErrorMessage';
import { TodayButton } from '@modules/TodayButton/TodayButton';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { Dashboard } from './components/Dashboard/Dashboard';
import {
  DashboardModeType,
  DashboardPageContext,
  DashboardRangeType,
} from './DashboardPage.context';

export const DashboardPage = () => {
  const params = useSearchParams();
  const searchParams = params;

  const { query, refetch } = useGetAllEventsQuery();

  if (query.isError) {
    return <ErrorMessage message={'Unexpected error occurred'} />;
  }

  const contextData = useMemo(() => {
    return {
      updateAllEvents: refetch,
      mode: searchParams.get('mode') as DashboardModeType,
      range: searchParams.get('type') as DashboardRangeType,
      groupId: searchParams.get('groupId') ?? undefined,
    };
  }, [refetch, searchParams]);

  return (
    <DashboardPageContext.Provider value={contextData}>
      <DashboardContainer>
        <Dashboard fetchEventsQuery={query} />
        <TodayButton />
      </DashboardContainer>
    </DashboardPageContext.Provider>
  );
};
