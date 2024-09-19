'use client';

import DashboardContainer from '@components/DashboardContainer/DashboardContainer';
import { ErrorMessage } from '@components/ErrorMessage/ErrorMessage';

import { useGetEventsByGroupQuery } from '@api/db/events/useGetEventsByGroupQuery';
import { TodayButton } from '@modules/TodayButton/TodayButton';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { EditFormCalendar } from './components/EditFormCalendar/EditFormCalendar';
import { EditPageContext } from './EditPage.context';

export const EditPage = () => {
  const params = useSearchParams();
  const searchParams = params;
  const groupId = searchParams.get('groupId') ?? '';
  const { query } = useGetEventsByGroupQuery(groupId);

  if (query.isError) {
    return <ErrorMessage message={'Unexpected error occurred'} />;
  }

  const contextData = useMemo(() => {
    return {
      groupId,
    };
  }, [query.refetch, groupId]);

  return (
    <EditPageContext.Provider value={contextData}>
      <DashboardContainer>
        <EditFormCalendar fetchEventsMutation={query} />
        <TodayButton />
      </DashboardContainer>
    </EditPageContext.Provider>
  );
};
