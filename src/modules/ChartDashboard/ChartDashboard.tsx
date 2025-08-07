'use client';

import { useGetAllEventsQuery } from '@api/db/events/useGetAllEventsQuery';
import { CalendarEventType } from '@api/db/types';
import DashboardContainer from '@components/DashboardContainer/DashboardContainer';
import { ErrorMessage } from '@components/ErrorMessage/ErrorMessage';
import { Stack } from '@components/Stack/Stack';
import { Spinner } from '@nextui-org/react';
import { useMediaQuery } from 'react-responsive';
import styles from './ChartDashboard.module.scss';
import { AlternatingGradient } from './components/AlternatingGradient';
import { AnalyticsWidget } from './components/AnalyticsWidget';
import { CareBalanceChartWeighted } from './components/CareBalanceChartWeighted';
import { CarePatternWidget } from './components/CarePatternWidget';
import { CumulativeCareChart } from './components/CumulativeCareChart';
import { RadialTripChart } from './components/RadialTripChart';

export const ChartDashboard = () => {
  const { query } = useGetAllEventsQuery();
  const isMax768 = useMediaQuery({ query: '(max-width: 767px)' });

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
    <DashboardContainer thin={isMax768}>
      <div className={styles.chartGrid}>
        <div className={styles.chartItem23}>
          <CarePatternWidget events={events} />
        </div>

        <div className={styles.chartItem}>
          <CareBalanceChartWeighted events={events} />
        </div>

        <div className={styles.chartItemDual}>
          <CumulativeCareChart events={events} />
        </div>

        <div className={styles.chartItemDual}>
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
          <AnalyticsWidget
            events={events}
            eventType={[CalendarEventType.Trip]}
            label='Wyjazdy'
          />
        </div>

        <div className={styles.chartItem}>
          <AnalyticsWidget
            events={events}
            eventType={[CalendarEventType.Event, CalendarEventType.Medical]}
            label='Inne'
          />
        </div>

        <div className={styles.chartItem}>
          <AnalyticsWidget
            events={events}
            eventType={[CalendarEventType.Camp]}
            label='Obozy/Wycieczki'
          />
        </div>
      </div>
    </DashboardContainer>
  );
};
