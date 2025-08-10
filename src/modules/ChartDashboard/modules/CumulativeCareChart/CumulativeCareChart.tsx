'use client';

import { CalendarEvent } from '@api/db/types';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import { Stack } from '@components/Stack/Stack';
import { Button, ButtonGroup, Chip } from '@nextui-org/react';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useCumulativeCare } from '../../hooks/useCumulativeCare';

const CHART_COLORS = {
  parent1: '#2196F3',
  parent2: '#E91E63',
};

const CHART_CONFIG = {
  height: 450,
  strokeWidth: 3,
  defaultGranularity: 'month' as const,
};

interface CumulativeCareChartProps {
  events: CalendarEvent[];
}

export const CumulativeCareChart = (props: CumulativeCareChartProps) => {
  const { events } = props;
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>(
    CHART_CONFIG.defaultGranularity
  );

  const cumulativeResult = useCumulativeCare({ events, granularity });
  const cumulativeData = cumulativeResult.data || [];

  const dateRange = useMemo(() => {
    if (cumulativeData.length === 0) return null;
    const firstDate = dayjs(cumulativeData[0].date);
    const lastDate = dayjs(cumulativeData[cumulativeData.length - 1].date);
    const totalDays = lastDate.diff(firstDate, 'days') + 1;

    return {
      start: firstDate.format(dateFormat),
      end: lastDate.format(dateFormat),
      totalDays,
    };
  }, [cumulativeData]);

  const formatXAxisLabel = (value: string) => {
    switch (granularity) {
      case 'day':
        return dayjs(value).format('DD.MM');
      case 'week':
        return dayjs(value).format('DD.MM');
      case 'month':
        return dayjs(value).format('MMM YY');
      default:
        return value;
    }
  };

  if (cumulativeData.length === 0) {
    return (
      <Stack contentAlignment='center' style={{ minHeight: '300px' }}>
        <p>Brak danych do analizy skumulowanej opieki</p>
      </Stack>
    );
  }

  return (
    <Stack gap={16}>
      <Stack
        direction='horizontal'
        contentAlignment='between'
        itemsAlignment='center'
      >
        <div>
          <h2>Skumulowana Opieka (dni)</h2>
          <small style={{ color: '#666' }}>
            Przyrostowe ilości dni opieki dla każdego rodzica
          </small>
        </div>

        <ButtonGroup size='sm' variant='bordered'>
          <Button
            color={granularity === 'day' ? 'primary' : 'default'}
            onClick={() => setGranularity('day')}
          >
            Dzień
          </Button>
          <Button
            color={granularity === 'week' ? 'primary' : 'default'}
            onClick={() => setGranularity('week')}
          >
            Tydzień
          </Button>
          <Button
            color={granularity === 'month' ? 'primary' : 'default'}
            onClick={() => setGranularity('month')}
          >
            Miesiąc
          </Button>
        </ButtonGroup>
      </Stack>

      <div style={{ width: '100%', height: `${CHART_CONFIG.height}px` }}>
        <ResponsiveContainer>
          <LineChart data={cumulativeData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='date'
              tickFormatter={formatXAxisLabel}
              interval='preserveStartEnd'
            />
            <YAxis tickFormatter={(value) => `${value}`} />

            <Line
              type='monotone'
              dataKey='parent1Cumulative'
              stroke={CHART_COLORS.parent1}
              strokeWidth={CHART_CONFIG.strokeWidth}
              dot={false}
              name='Rodzic 1'
            />
            <Line
              type='monotone'
              dataKey='parent2Cumulative'
              stroke={CHART_COLORS.parent2}
              strokeWidth={CHART_CONFIG.strokeWidth}
              dot={false}
              name='Rodzic 2'
            />

            <Legend />
            <Tooltip
              labelFormatter={(value) => dayjs(value).format('DD.MM.YYYY')}
              formatter={(value, name) => [`${value} dni`, name]}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {dateRange && (
        <Stack gap={8}>
          <Chip size='sm' variant='flat'>
            📅 {dateRange.start} - {dateRange.end}
          </Chip>
          <Chip size='sm' variant='flat'>
            📊 {dateRange.totalDays} dni analizowanych
          </Chip>
          <Chip
            size='sm'
            variant='flat'
            style={{ color: CHART_COLORS.parent1 }}
          >
            👨‍👦 Rodzic 1: {cumulativeResult.summary.parent1Days} dni
          </Chip>
          <Chip
            size='sm'
            variant='flat'
            style={{ color: CHART_COLORS.parent2 }}
          >
            👩‍👦 Rodzic 2: {cumulativeResult.summary.parent2Days} dni
          </Chip>
        </Stack>
      )}
    </Stack>
  );
};
