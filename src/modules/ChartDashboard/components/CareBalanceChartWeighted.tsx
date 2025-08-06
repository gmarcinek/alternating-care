'use client';

import { CalendarEvent } from '@api/db/types';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import { Stack } from '@components/Stack/Stack';
import { Button, ButtonGroup, Chip } from '@nextui-org/react';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { useCareBalanceWeighted } from '../hooks/useCareBalanceWeighted';

interface CareBalanceChartProps {
  events: CalendarEvent[];
}

export const CareBalanceChartWeighted = (props: CareBalanceChartProps) => {
  const { events } = props;
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>(
    'month'
  );
  const [balancePeriod, setBalancePeriod] = useState<
    'week' | 'month' | 'quarter' | 'year'
  >('year');

  const balanceResult = useCareBalanceWeighted({
    events,
    granularity,
    balancePeriod,
  });
  const balanceData = balanceResult.data || [];

  // Maksymalna skala dla danego horyzontu
  const getMaxScale = (
    period: 'week' | 'month' | 'quarter' | 'year'
  ): number => {
    switch (period) {
      case 'week':
        return 7;
      case 'month':
        return 30;
      case 'quarter':
        return 90;
      case 'year':
        return 365;
    }
  };

  const maxScale = getMaxScale(balancePeriod);

  // Skala wykresu - nieliniowy margines
  const getChartScale = (
    period: 'week' | 'month' | 'quarter' | 'year'
  ): number => {
    switch (period) {
      case 'week':
        return 60;
      case 'month':
        return 90;
      case 'quarter':
        return 90;
      case 'year':
        return 182;
    }
  };

  const chartScale = getChartScale(balancePeriod);

  // Maksymalne wychylenie w danych
  const maxAbsBalance = useMemo(() => {
    if (balanceData.length === 0) return maxScale / 2;
    return Math.max(
      ...balanceData.map((point) => Math.abs(point.balance)),
      maxScale / 10
    );
  }, [balanceData, maxScale]);

  // Dla krótkich horyzontów nie normalizujemy, dla roku można lekko znormalizować
  const normalizedData = balanceData.map((point, index) => {
    let normalizedBalance = point.balance;

    // Tylko dla horyzontu roku robimy lekką ekstrapolację
    if (balancePeriod === 'year') {
      const daysSinceStart =
        dayjs(point.date).diff(dayjs(balanceData[0]?.date), 'days') + 1;
      const totalDaysInDataset =
        dayjs(balanceData[balanceData.length - 1]?.date).diff(
          dayjs(balanceData[0]?.date),
          'days'
        ) + 1;

      // Minimum dni dla stabilnej projekcji
      const MIN_DAYS_FOR_PROJECTION = 30;

      if (
        daysSinceStart >= MIN_DAYS_FOR_PROJECTION &&
        totalDaysInDataset < 365
      ) {
        const yearProgress = Math.min(daysSinceStart / 365, 1);
        const projectedBalance = point.balance / yearProgress;
        const confidenceFactor = Math.min(daysSinceStart / 90, 1);
        normalizedBalance =
          point.balance + (projectedBalance - point.balance) * confidenceFactor;
      }
    }

    // Ogranicz do skali horyzontu
    const halfScale = Math.floor(maxScale / 2);
    normalizedBalance = Math.max(
      -halfScale,
      Math.min(halfScale, normalizedBalance)
    );

    return {
      ...point,
      normalizedBalance,
    };
  });

  // Przedział dat
  const dateRange = useMemo(() => {
    if (balanceData.length === 0) return null;
    const firstDate = dayjs(balanceData[0].date);
    const lastDate = dayjs(balanceData[balanceData.length - 1].date);
    const totalDays = lastDate.diff(firstDate, 'days') + 1;

    return {
      start: firstDate.format(dateFormat),
      end: lastDate.format(dateFormat),
      totalDays,
      totalWeeks: Math.ceil(totalDays / 7),
      totalMonths: Math.ceil(totalDays / 30.4),
    };
  }, [balanceData]);

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

  if (balanceData.length === 0) {
    return (
      <Stack contentAlignment='center' style={{ minHeight: '300px' }}>
        <p>Brak danych ALTERNATING do analizy</p>
      </Stack>
    );
  }

  return (
    <Stack gap={16}>
      <Stack gap={16}>
        <div>
          <h2>Bilans Opieki ({balancePeriod})</h2>
          <small style={{ color: '#666' }}>
            Skala wykresu: -{chartScale} do +{chartScale} dni
          </small>
        </div>

        <Stack direction='horizontal' gap={8}>
          <div>
            <div style={{ fontSize: '12px', marginBottom: '4px' }}>
              Granularność
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
          </div>

          <div>
            <div style={{ fontSize: '12px', marginBottom: '4px' }}>
              Horyzont bilansu
            </div>
            <ButtonGroup size='sm' variant='bordered'>
              <Button
                color={balancePeriod === 'month' ? 'primary' : 'default'}
                onClick={() => setBalancePeriod('month')}
              >
                30d
              </Button>
              <Button
                color={balancePeriod === 'quarter' ? 'primary' : 'default'}
                onClick={() => setBalancePeriod('quarter')}
              >
                90d
              </Button>
              <Button
                color={balancePeriod === 'year' ? 'primary' : 'default'}
                onClick={() => setBalancePeriod('year')}
              >
                365d
              </Button>
            </ButtonGroup>
          </div>
        </Stack>
      </Stack>

      {/* Wykres */}
      <div style={{ width: '100%', height: '400px' }}>
        <ResponsiveContainer>
          <ComposedChart
            data={normalizedData}
            margin={{ top: 20, right: 30, bottom: 20, left: 0 }}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='date'
              tickFormatter={formatXAxisLabel}
              interval='preserveStartEnd'
            />
            <YAxis
              domain={[-chartScale, chartScale]}
              tickFormatter={(value) => {
                // Definiuj symetryczne wartości
                const step = chartScale / 4;
                const validTicks = [
                  -3 * step,
                  -2 * step,
                  -step,
                  0,
                  step,
                  2 * step,
                  3 * step,
                ];

                // Pokaż tylko wartości z naszej listy
                const closest = validTicks.find(
                  (tick) => Math.abs(tick - value) < 1
                );
                if (!closest) return '';

                if (closest === 0) return '0';
                return `${closest > 0 ? '+' : ''}${Math.round(closest)}`;
              }}
              axisLine={false}
              tickLine={false}
              width={1}
              tick={{
                fontSize: 12,
                fill: '#000',
                dx: 8,
                dy: 3,
                textAnchor: 'start',
              }}
              tickCount={7}
            />

            {/* Czerwony obszar dla wartości dodatnich (pod linią, powyżej zera) */}
            <Area
              type='monotone'
              dataKey='positiveArea'
              stroke='none'
              fill='rgba(255, 79, 79, 0.4)'
            />

            {/* Czerwony obszar dla wartości ujemnych (nad linią, poniżej zera) */}
            <Area
              type='monotone'
              dataKey='negativeArea'
              stroke='none'
              fill='rgba(255, 79, 79, 0.4)'
            />

            <ReferenceLine y={0} stroke='#666' strokeWidth={2} />

            {/* Przerywane linie dla min/max */}
            <ReferenceLine
              y={chartScale}
              stroke='#ccc'
              strokeWidth={1}
              strokeDasharray='5,5'
            />
            <ReferenceLine
              y={-chartScale}
              stroke='#ccc'
              strokeWidth={1}
              strokeDasharray='5,5'
            />

            <Line
              type='monotone'
              dataKey='normalizedBalance'
              stroke='#ff4f4f'
              strokeWidth={3}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {dateRange && (
        <Stack gap={8}>
          <Chip size='sm' variant='flat'>
            📅 {dateRange.start} - {dateRange.end}
          </Chip>
          <Chip size='sm' variant='flat'>
            📊 {dateRange.totalDays} dni
          </Chip>
          <Chip size='sm' variant='flat'>
            ⚖️ Bilans: {balanceResult.summary.currentBalance > 0 ? '+' : ''}
            {balanceResult.summary.currentBalance}
          </Chip>
        </Stack>
      )}
    </Stack>
  );
};
