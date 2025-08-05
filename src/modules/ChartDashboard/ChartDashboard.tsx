'use client';

import { useGetAllEventsQuery } from '@api/db/events/useGetAllEventsQuery';
import DashboardContainer from '@components/DashboardContainer/DashboardContainer';
import { ErrorMessage } from '@components/ErrorMessage/ErrorMessage';
import { Stack } from '@components/Stack/Stack';
import { Spinner } from '@nextui-org/react';
import { CareBalanceChart } from './components/CareBalanceChart';

export const ChartDashboard = () => {
  const { query } = useGetAllEventsQuery();

  if (query.isError) {
    return <ErrorMessage message={'Unexpected error occurred'} />;
  }

  if (query.isPending) {
    return (
      <DashboardContainer>
        <Stack contentAlignment='center'>
          <Spinner color='danger' size='lg' />
        </Stack>
      </DashboardContainer>
    );
  }

  const events = query.data || [];

  return (
    <DashboardContainer>
      <Stack>
        <div></div>
        <CareBalanceChart events={query.data} />
        <div></div>
      </Stack>
    </DashboardContainer>
  );
};
