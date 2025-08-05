'use client';

import { CalendarEvent } from '@api/db/types';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import { Stack } from '@components/Stack/Stack';
import { Button, ButtonGroup, Chip, Slider } from '@nextui-org/react';
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

  // Stała normalizacja na rok (365/2 = 182.5 ≈ 182)
  const YEAR_HALF_DAYS = 182;

  // Maksymalne wychylenie w danych do skalowania suwaka
  const maxAbsBalance = useMemo(() => {
    if (balanceData.length === 0) return YEAR_HALF_DAYS;
    return Math.max(...balanceData.map((point) => Math.abs(point.balance)), 10); // min 10 dla UX
  }, [balanceData]);

  // Suwak normalizacji (od max wychylenia do pełnej skali roku)
  const [scaleLimit, setScaleLimit] = useState<number>(YEAR_HALF_DAYS);

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

  // Normalizacja danych do skali rocznej z inteligentnym wygładzaniem
  const normalizedData = balanceData.map((point, index) => {
    const daysSinceStart =
      dayjs(point.date).diff(dayjs(balanceData[0]?.date), 'days') + 1;
    const totalDaysInDataset =
      dayjs(balanceData[balanceData.length - 1]?.date).diff(
        dayjs(balanceData[0]?.date),
        'days'
      ) + 1;

    // Minimum dni dla stabilnej projekcji (2 tygodnie)
    const MIN_DAYS_FOR_PROJECTION = 14;

    let normalizedBalance: number;

    if (daysSinceStart < MIN_DAYS_FOR_PROJECTION) {
      // Na początku: pokaż rzeczywisty bilans bez ekstrapolacji
      normalizedBalance = point.balance;
    } else if (totalDaysInDataset < 365) {
      // W trakcie roku: projekcja z wygładzaniem na podstawie rzeczywistego postępu
      const yearProgress = Math.min(daysSinceStart / 365, 1);
      const projectedBalance = point.balance / yearProgress;

      // Wygładź ekstremalną projekcję - im więcej dni, tym bardziej ufamy projekcji
      const confidenceFactor = Math.min(daysSinceStart / 90, 1); // Pełna pewność po 3 miesiącach
      normalizedBalance =
        point.balance + (projectedBalance - point.balance) * confidenceFactor;
    } else {
      // Pełny rok lub więcej: pokaż rzeczywisty roczny bilans
      const fullYears = Math.floor(totalDaysInDataset / 365);
      const balancePerYear = point.balance / (totalDaysInDataset / 365);
      normalizedBalance = balancePerYear;
    }

    // Ogranicz do skali
    normalizedBalance = Math.max(
      -YEAR_HALF_DAYS,
      Math.min(YEAR_HALF_DAYS, normalizedBalance)
    );

    const yearProgress = Math.min((daysSinceStart / 365) * 100, 100);
    const isProjection =
      daysSinceStart < 365 && daysSinceStart >= MIN_DAYS_FOR_PROJECTION;

    return {
      ...point,
      normalizedBalance,
      yearProgress: Math.round(yearProgress),
      isProjection,
      daysSinceStart,
    };
  });

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
      <Stack
        direction='horizontal'
        contentAlignment='between'
        itemsAlignment='center'
      >
        <div>
          <h2>Bilans Opieki (znormalizowany)</h2>
          <small style={{ color: '#666' }}>
            Skala: -{scaleLimit} do +{scaleLimit} dni rocznie
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

      {/* Suwak normalizacji */}
      <Stack gap={8}>
        <div style={{ fontSize: '14px', fontWeight: '500' }}>
          Skala wykresu: ±{scaleLimit} dni
        </div>
        <Slider
          size='sm'
          step={10}
          minValue={Math.max(maxAbsBalance, 10)}
          maxValue={YEAR_HALF_DAYS}
          value={scaleLimit}
          onChange={(value) =>
            setScaleLimit(Array.isArray(value) ? value[0] : value)
          }
          className='max-w-md'
          marks={[
            { value: maxAbsBalance, label: `${maxAbsBalance}` },
            { value: YEAR_HALF_DAYS, label: `${YEAR_HALF_DAYS}` },
          ]}
        />
      </Stack>

      {/* Wykres */}
      <div style={{ width: '100%', height: '400px' }}>
        <ResponsiveContainer>
          <ComposedChart data={normalizedData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='date'
              tickFormatter={formatXAxisLabel}
              interval='preserveStartEnd'
            />
            <YAxis
              domain={[-scaleLimit, scaleLimit]}
              tickFormatter={(value) => `${value > 0 ? '+' : ''}${value}`}
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
