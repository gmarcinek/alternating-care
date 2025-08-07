'use client';

import { useGetAllEventsQuery } from '@api/db/events/useGetAllEventsQuery';
import { CalendarEventType } from '@api/db/types';
import DashboardContainer from '@components/DashboardContainer/DashboardContainer';
import { ErrorMessage } from '@components/ErrorMessage/ErrorMessage';
import { Stack } from '@components/Stack/Stack';
import { Spinner } from '@nextui-org/react';
import { useMediaQuery } from 'react-responsive';
import { AlternatingGradient } from './modules/AlternatingGradient/AlternatingGradient';
import { AnalyticsWidget } from './modules/AnalyticsWidget/AnalyticsWidget';
import { CareBalanceChartWeighted } from './modules/CareBalanceChartWeighted/CareBalanceChartWeighted';

import { Widget } from '@components/Widget/Widget';
import { WidgetContainer } from '@components/WidgetContainer/WidgetContainer';
import { CarePatternWidget } from './modules/CarePatternWidget/CarePatternWidget';
import { CumulativeCareChart } from './modules/CumulativeCareChart/CumulativeCareChart';
import { RadialTripChart } from './modules/RadialTripChart/RadialTripChart';

export const ChartDashboard = () => {
  const { query } = useGetAllEventsQuery();
  const isMax768 = useMediaQuery({ query: '(max-width: 767px)' });
  const isMin1280 = useMediaQuery({ query: '(min-width: 1280px)' });
  const isMin1920 = useMediaQuery({ query: '(min-width: 1920px)' });

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
      <WidgetContainer>
        <Widget size={isMin1280 ? 2 : 6}>
          <CareBalanceChartWeighted events={events} />
        </Widget>
        <Widget size={isMin1280 ? 4 : 6}>
          <CarePatternWidget events={events} />
        </Widget>

        <Widget size={isMin1920 ? 4 : 6}>
          <AlternatingGradient events={events} />
        </Widget>
        <Widget size={isMin1920 ? 2 : 3}>
          <CumulativeCareChart events={events} />
        </Widget>

        <Widget size={isMin1920 ? 6 : 3}>
          <RadialTripChart
            events={events}
            isPending={query.isPending}
            refetch={query.refetch}
          />
        </Widget>

        <Widget size={2}>
          <AnalyticsWidget
            events={events}
            eventType={[CalendarEventType.Trip]}
            label='Wyjazdy'
          />
        </Widget>

        <Widget size={2}>
          <AnalyticsWidget
            events={events}
            eventType={[CalendarEventType.Event, CalendarEventType.Medical]}
            label='Inne'
          />
        </Widget>

        <Widget size={2}>
          <AnalyticsWidget
            events={events}
            eventType={[CalendarEventType.Camp]}
            label='Obozy/Wycieczki'
          />
        </Widget>
      </WidgetContainer>
    </DashboardContainer>
  );
};
