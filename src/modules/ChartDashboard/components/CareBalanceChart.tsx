'use client';

import { CalendarEvent } from '@api/db/types';
import { Stack } from '@components/Stack/Stack';
import { Button, ButtonGroup } from '@nextui-org/react';
import dayjs from 'dayjs';
import { useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useCareBalance } from '../hooks/useCareBalance';

interface CareBalanceChartProps {
  events: CalendarEvent[];
}

export const CareBalanceChart = (props: CareBalanceChartProps) => {
  const { events } = props;
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>(
    'month'
  );

  const balanceResult = useCareBalance({ events, granularity });
  const balanceData = balanceResult.data || [];
  const maxBalance = balanceResult.maxBalance || 182;

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

  const formatTooltip = (value: number, name: string) => {
    if (name === 'balance') {
      return [`${value > 0 ? '+' : ''}${value} dni`, 'Rodzic 1'];
    }
    if (name === 'parent2Balance') {
      return [`${Math.abs(value)} dni`, 'Rodzic 2'];
    }
    return [value, name];
  };

  if (balanceData.length === 0) {
    return (
      <Stack contentAlignment='center' style={{ minHeight: '300px' }}>
        <p>Brak danych ALTERNATING do analizy</p>
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
        <h3>Bilans Opieki (kroczący)</h3>

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

      <div style={{ width: '100%', height: '400px' }}>
        <ResponsiveContainer>
          <LineChart data={balanceData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='date'
              tickFormatter={formatXAxisLabel}
              interval='preserveStartEnd'
            />
            <YAxis
              domain={[-maxBalance, maxBalance]}
              tickFormatter={(value) => `${value > 0 ? '+' : ''}${value}`}
            />
            <Tooltip
              formatter={formatTooltip}
              labelFormatter={(label) => `Data: ${formatXAxisLabel(label)}`}
            />
            <ReferenceLine
              y={0}
              stroke='#666'
              strokeDasharray='4 4'
              strokeWidth={2}
            />
            <Line
              type='monotone'
              dataKey='balance'
              stroke='#ff4f4f'
              strokeWidth={3}
              dot={false}
              name='Bilans'
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ fontSize: '12px', color: '#666' }}>
        <p>Powyżej 0 = przewaga Rodzica 1 | Poniżej 0 = przewaga Rodzica 2</p>
      </div>
    </Stack>
  );
};
