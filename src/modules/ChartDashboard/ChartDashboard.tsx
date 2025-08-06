'use client';

import { useGetAllEventsQuery } from '@api/db/events/useGetAllEventsQuery';
import DashboardContainer from '@components/DashboardContainer/DashboardContainer';
import { ErrorMessage } from '@components/ErrorMessage/ErrorMessage';
import { Stack } from '@components/Stack/Stack';
import { Spinner } from '@nextui-org/react';
import styles from './ChartDashboard.module.scss';
import { AlternatingGradient } from './components/AlternatingGradient';
import { CareBalanceChart } from './components/CareBalanceChart';
import { CareBalanceChartWeighted } from './components/CareBalanceChartWeighted';
import { CumulativeCareChart } from './components/CumulativeCareChart';
import { RadialTripChart } from './components/RadialTripChart';

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
      <div className={styles.chartGrid}>
        <div className={styles.chartItem}>
          <CareBalanceChartWeighted events={events} />
        </div>

        <div className={styles.chartItem}>
          <CumulativeCareChart events={events} />
        </div>

        <div className={styles.chartItem}>
          <RadialTripChart
            events={events}
            isPending={query.isPending}
            refetch={query.refetch}
          />
        </div>

        <div className={styles.chartItemWide}>
          <AlternatingGradient events={events} />
        </div>

        <div className={styles.chartItem}>
          <CareBalanceChart events={events} />
        </div>
      </div>
    </DashboardContainer>
  );
};
