'use client';

import DashboardContainer from '@components/DashboardContainer/DashboardContainer';
import { ErrorMessage } from '@components/ErrorMessage/ErrorMessage';
import { useGetAllEventsMutation } from '@modules/db/events/useGetAllEventsMutation';
import { TodayButton } from '@modules/TodayButton/TodayButton';
import { useEffect } from 'react';
import { Dashboard } from './components/Dashboard/Dashboard';

export const DashboardPage = () => {
  const { isError, refetch: fetchEvents, mutation } = useGetAllEventsMutation();

  useEffect(() => {
    void mutation.mutate();
  }, [fetchEvents]);

  if (isError) {
    return <ErrorMessage message={'Unexpected error occurred'} />;
  }

  return (
    <DashboardContainer>
      <Dashboard fetchEventsMutation={mutation} />
      <TodayButton />
    </DashboardContainer>
  );
};
