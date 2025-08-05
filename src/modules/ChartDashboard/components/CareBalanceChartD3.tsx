'use client';

import { CalendarEvent } from '@api/db/types';
import { Stack } from '@components/Stack/Stack';
import { Button, ButtonGroup, Chip, Slider } from '@nextui-org/react';
import * as d3 from 'd3';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useCareBalance } from '../hooks/useCareBalance';

interface CareBalanceChartProps {
  events: CalendarEvent[];
}

export const CareBalanceChartD3 = (props: CareBalanceChartProps) => {
  const { events } = props;
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>(
    'month'
  );

  const balanceResult = useCareBalance({ events, granularity });
  const balanceData = balanceResult.data || [];

  const YEAR_HALF_DAYS = 182;
  const maxAbsBalance = useMemo(() => {
    if (balanceData.length === 0) return YEAR_HALF_DAYS;
    return Math.max(...balanceData.map((point) => Math.abs(point.balance)), 10);
  }, [balanceData]);

  const [scaleLimit, setScaleLimit] = useState<number>(YEAR_HALF_DAYS);

  const dateRange = useMemo(() => {
    if (balanceData.length === 0) return null;
    const firstDate = dayjs(balanceData[0].date);
    const lastDate = dayjs(balanceData[balanceData.length - 1].date);
    const totalDays = lastDate.diff(firstDate, 'days') + 1;

    return {
      start: firstDate.format('DD.MM.YYYY'),
      end: lastDate.format('DD.MM.YYYY'),
      totalDays,
      totalWeeks: Math.ceil(totalDays / 7),
      totalMonths: Math.ceil(totalDays / 30.4),
    };
  }, [balanceData]);

  const normalizedData = balanceData.map((point) => {
    const daysSinceStart =
      dayjs(point.date).diff(dayjs(balanceData[0]?.date), 'days') + 1;
    const totalDaysInDataset =
      dayjs(balanceData[balanceData.length - 1]?.date).diff(
        dayjs(balanceData[0]?.date),
        'days'
      ) + 1;

    const MIN_DAYS_FOR_PROJECTION = 14;
    let normalizedBalance: number;

    if (daysSinceStart < MIN_DAYS_FOR_PROJECTION) {
      normalizedBalance = point.balance;
    } else if (totalDaysInDataset < 365) {
      const yearProgress = Math.min(daysSinceStart / 365, 1);
      const projectedBalance = point.balance / yearProgress;
      const confidenceFactor = Math.min(daysSinceStart / 90, 1);
      normalizedBalance =
        point.balance + (projectedBalance - point.balance) * confidenceFactor;
    } else {
      const balancePerYear = point.balance / (totalDaysInDataset / 365);
      normalizedBalance = balancePerYear;
    }

    normalizedBalance = Math.max(
      -YEAR_HALF_DAYS,
      Math.min(YEAR_HALF_DAYS, normalizedBalance)
    );

    return {
      ...point,
      normalizedBalance,
      date: new Date(point.date),
    };
  });

  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (svgRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        if (entries[0]) {
          setDimensions({
            width: entries[0].contentRect.width,
            height: entries[0].contentRect.height,
          });
        }
      });

      resizeObserver.observe(svgRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [svgRef]);

  useEffect(() => {
    if (
      normalizedData.length === 0 ||
      dimensions.width === 0 ||
      dimensions.height === 0
    )
      return;

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    d3.select(svgRef.current).select('svg').remove();

    const svg = d3
      .select(svgRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleTime()
      .domain(d3.extent(normalizedData, (d) => d.date) as [Date, Date])
      .range([0, width]);

    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3.axisBottom(x).tickFormat((d) => {
          const date = dayjs(d as Date);
          switch (granularity) {
            case 'day':
              return date.format('DD.MM');
            case 'week':
              return date.format('DD.MM');
            case 'month':
              return date.format('MMM YY');
            default:
              return date.format('DD.MM.YY');
          }
        })
      );

    const y = d3
      .scaleLinear()
      .domain([-scaleLimit, scaleLimit])
      .range([height, 0]);

    svg
      .append('g')
      .call(
        d3.axisLeft(y).tickFormat((d) => `${Number(d) > 0 ? '+' : ''}${d}`)
      );

    // Linia referencyjna (0)
    svg
      .append('line')
      .attr('x1', 0)
      .attr('y1', y(0))
      .attr('x2', width)
      .attr('y2', y(0))
      .attr('stroke', '#666')
      .attr('stroke-width', 2);

    // Generator obszaru
    const area = d3
      .area<{ date: Date; normalizedBalance: number }>()
      .x((d) => x(d.date))
      .y0(y(0))
      .y1((d) => y(d.normalizedBalance));

    // Rysowanie obszaru
    svg
      .append('path')
      .datum(normalizedData)
      .attr('fill', 'rgba(255, 79, 79, 0.4)')
      .attr('d', area)
      .attr('clip-path', 'url(#clip-path-d3)');

    // Wycinek dla kolorowania obszaru
    svg
      .append('defs')
      .append('clipPath')
      .attr('id', 'clip-path-d3')
      .append('rect')
      .attr('width', width)
      .attr('height', height);

    // Generator linii
    const line = d3
      .line<{ date: Date; normalizedBalance: number }>()
      .x((d) => x(d.date))
      .y((d) => y(d.normalizedBalance));

    // Rysowanie linii
    svg
      .append('path')
      .datum(normalizedData)
      .attr('fill', 'none')
      .attr('stroke', '#ff4f4f')
      .attr('stroke-width', 3)
      .attr('d', line);
  }, [normalizedData, scaleLimit, granularity, dimensions]);

  if (balanceData.length === 0) {
    return (
      <Stack contentAlignment='center' style={{ minHeight: '300px' }}>
        <p>Brak danych ALTERNATING do analizy</p>
      </Stack>
    );
  }

  return (
    <Stack gap={16}>
      {/* Reszta UI z ButtonGroup, Slider, etc. pozostaje bez zmian */}
      {dateRange && (
        <Stack direction='horizontal' contentAlignment='center' gap={8}>
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

      <Stack
        direction='horizontal'
        contentAlignment='between'
        itemsAlignment='center'
      >
        <div>
          <h3>Bilans Opieki (znormalizowany)</h3>
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

      {/* Kontener wykresu z ref */}
      <div ref={svgRef} style={{ width: '100%', height: '400px' }} />

      <div style={{ fontSize: '12px', color: '#666' }}>
        <p>
          Wykres bilansowy: wartości dodatnie = przewaga Rodzica 2, ujemne =
          przewaga Rodzica 1. Suwak pozwala dostosować skalę od minimum (
          {maxAbsBalance}) do maksimum ({YEAR_HALF_DAYS}).
        </p>
      </div>
    </Stack>
  );
};
