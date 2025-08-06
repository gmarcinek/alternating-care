'use client';

import { CalendarEvent, CalendarEventType } from '@api/db/types';
import { Stack } from '@components/Stack/Stack';
import { Chip } from '@nextui-org/react';
import * as d3 from 'd3';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ResponsiveContainer } from 'recharts';

dayjs.extend(dayOfYear);

interface RadialTripChartProps {
  events: CalendarEvent[];
}

interface DayOfYearData {
  dayOfYear: number;
  years: Record<number, number>; // year -> count of trips
}

export const RadialTripChart = (props: RadialTripChartProps) => {
  const { events } = props;
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    day: number;
    year?: number;
    value?: number;
    isTravel?: boolean;
    baseline?: number;
  } | null>(null);

  // Przetwarzanie danych na poziomie dnia i roku
  const chartData = useMemo(() => {
    const tripEvents = events.filter((e) => e.type === CalendarEventType.Trip);
    if (tripEvents.length === 0) return { data: [], years: [] };

    const dayData = new Map<number, Record<number, number>>();
    const yearsSet = new Set<number>();

    tripEvents.forEach((event) => {
      const date = dayjs(event.date);
      const dayOfYear = date.dayOfYear();
      const year = date.year();

      yearsSet.add(year);

      if (!dayData.has(dayOfYear)) {
        dayData.set(dayOfYear, {});
      }

      const dayRecord = dayData.get(dayOfYear)!;
      dayRecord[year] = (dayRecord[year] || 0) + 1;
    });

    const years = Array.from(yearsSet).sort();

    const data: DayOfYearData[] = [];
    for (let day = 1; day <= 365; day++) {
      const yearCounts = dayData.get(day) || {};
      data.push({
        dayOfYear: day,
        years: yearCounts,
      });
    }
    return { data, years };
  }, [events]);

  // Oblicz średni udział dni podróży (bazowy) dla każdego roku
  const baseFractionPerYear: Record<number, number> = useMemo(() => {
    const result: Record<number, number> = {};
    chartData.years.forEach((year) => {
      result[year] =
        chartData.data.filter((d) => (d.years[year] || 0) > 0).length / 365;
    });
    return result;
  }, [chartData]);

  const overallBaseFraction = useMemo(() => {
    if (chartData.years.length === 0) return 0;
    return (
      chartData.years.reduce((acc, y) => acc + baseFractionPerYear[y], 0) /
      chartData.years.length
    );
  }, [baseFractionPerYear, chartData]);

  // Wygładzanie średnią kroczącą (okno 14 dni)
  function movingAverage(arr: number[], window: number) {
    const res = [];
    for (let i = 0; i < arr.length; i++) {
      let sum = 0,
        count = 0;
      for (let j = -window; j <= window; j++) {
        const idx = i + j;
        if (idx >= 0 && idx < arr.length) {
          sum += arr[idx];
          count++;
        }
      }
      res.push(sum / count);
    }
    return res;
  }

  // Profile wygładzone i wychylenia dla każdego roku
  const smoothedPerYear: Record<number, number[]> = useMemo(() => {
    const smoothed: Record<number, number[]> = {};
    chartData.years.forEach((year) => {
      const values = chartData.data.map((d) =>
        (d.years[year] || 0) > 0 ? 1 : 0
      );
      smoothed[year] = movingAverage(values, 7);
    });
    return smoothed;
  }, [chartData]);

  const profilePerYear: Record<number, number[]> = useMemo(() => {
    const profiles: Record<number, number[]> = {};
    chartData.years.forEach((year) => {
      profiles[year] = smoothedPerYear[year].map(
        (v) => v - baseFractionPerYear[year]
      );
    });
    return profiles;
  }, [smoothedPerYear, baseFractionPerYear, chartData]);

  // Skala końcowa: 2x maksymalny wychył
  const scaleMax = useMemo(() => {
    let maxDeviation = 0;
    chartData.years.forEach((year) => {
      maxDeviation = Math.max(
        maxDeviation,
        ...profilePerYear[year].map((x) => Math.abs(x))
      );
    });
    return 1.1 * Math.max(maxDeviation, 0.1);
  }, [profilePerYear, chartData]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerWidth = svgRef.current?.clientWidth ?? 1;
    const containerHeight = svgRef.current?.clientHeight ?? 1;

    const size = Math.min(containerWidth, containerHeight);
    const margin = 60;
    const radius = (size - margin * 2) / 2;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    // Skale
    const angleScale = d3
      .scaleLinear()
      .domain([1, 365])
      .range([0, 2 * Math.PI]);
    const radiusScale = d3
      .scaleLinear()
      .domain([-1, scaleMax])
      .range([0, radius]);

    const g = svg
      .append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    // Grid: -1 (środek), 0 (bazowy), max
    const gridVals = [-1, 0, scaleMax / 2, scaleMax];
    gridVals.forEach((v) => {
      g.append('circle')
        .attr('r', radiusScale(v))
        .attr('fill', 'none')
        .attr('stroke', v === 0 ? '#b33' : '#e0e0e0')
        .attr('stroke-width', v === 0 ? 4 : 1)
        .attr('stroke-dasharray', v === -1 ? '6 4' : 'none');
      g.append('text')
        .attr('x', 6)
        .attr('y', -radiusScale(v))
        .attr('font-size', 10)
        .attr('fill', v === 0 ? '#b33' : '#666')
        .attr('font-weight', v === 0 ? 'bold' : 'normal')
        .text(
          v === 0 ? 'średnia' : v === -1 ? '' : `+${(v * 100).toFixed(0)}%`
        );
    });

    // Miesiące (subtelnie) - poprawka z użyciem stałego roku
    const yearForLabels = 2023; // nieprzestępny rok referencyjny
    for (let month = 1; month <= 12; month++) {
      const dayStart = dayjs(
        `${yearForLabels}-${String(month).padStart(2, '0')}-01`
      ).dayOfYear();
      const angle = angleScale(dayStart) - Math.PI / 2;
      const labelRadius = radius + 20;
      const x = Math.cos(angle) * labelRadius;
      const y = Math.sin(angle) * labelRadius;

      g.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('font-size', 11)
        .attr('fill', '#aaa')
        .text(
          dayjs()
            .month(month - 1)
            .format('MMM')
        );

      g.append('line')
        .attr('x1', Math.cos(angle) * 35)
        .attr('y1', Math.sin(angle) * 35)
        .attr('x2', Math.cos(angle) * radius)
        .attr('y2', Math.sin(angle) * radius)
        .attr('stroke', '#ddd')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '2 6');
    }

    // Linie dla każdego roku
    chartData.years.forEach((year, idx) => {
      const lineGen = d3
        .lineRadial<number>()
        .angle((_, i) => angleScale(i + 1))
        .radius((d) => radiusScale(d))
        .curve(d3.curveCardinal);

      g.append('path')
        .datum(profilePerYear[year])
        .attr('d', lineGen)
        .attr('fill', 'none')
        .attr('stroke', d3.schemeCategory10[idx % 10])
        .attr('stroke-width', 4)
        .attr('opacity', 0.85);
    });

    // Punkty do tooltipów
    chartData.years.forEach((year, idx) => {
      g.selectAll(`.point-${year}`)
        .data(
          profilePerYear[year].map((val, i) => ({
            value: val,
            day: i + 1,
            base: baseFractionPerYear[year],
            isTravel: (chartData.data[i].years[year] || 0) > 0,
          }))
        )
        .enter()
        .append('circle')
        .attr('class', `point-${year}`)
        .attr(
          'cx',
          (d) =>
            Math.cos(angleScale(d.day) - Math.PI / 2) * radiusScale(d.value)
        )
        .attr(
          'cy',
          (d) =>
            Math.sin(angleScale(d.day) - Math.PI / 2) * radiusScale(d.value)
        )
        .attr('r', 5)
        .attr('fill', 'transparent')
        .attr('pointer-events', 'all')
        .on('mouseenter', (event, d) => {
          setTooltip({
            x: event.clientX,
            y: event.clientY,
            day: d.day,
            year,
            value: d.value,
            isTravel: d.isTravel,
            baseline: d.base,
          });
        })
        .on('mouseleave', () => setTooltip(null));
    });

    g.append('circle').attr('r', 3).attr('fill', '#666');
  }, [chartData, profilePerYear, baseFractionPerYear, scaleMax]);

  if (chartData.data.length === 0) {
    return (
      <Stack contentAlignment='center' style={{ minHeight: '400px' }}>
        <p>Brak eventów TRIP do wizualizacji</p>
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
          <h2>Sezonowość Podróży (odchylenie dzienne)</h2>
          <small style={{ color: '#666' }}>
            Radialny wykres dziennych odchyleń liczby podróży od średniej
            (poziom ZERO = średni udział dni podróży, środek = -1)
          </small>
        </div>
      </Stack>
      <div style={{ width: '100%', height: '500px', position: 'relative' }}>
        <ResponsiveContainer>
          <svg
            ref={svgRef}
            width='100%'
            height='100%'
            style={{ border: '1px solid #ddd', borderRadius: '8px' }}
          />
        </ResponsiveContainer>
        {tooltip && (
          <div
            style={{
              position: 'fixed',
              left: tooltip.x + 16,
              top: tooltip.y - 8,
              background: '#fff',
              border: '1px solid #aaa',
              borderRadius: 8,
              padding: 8,
              boxShadow: '0 2px 12px #0001',
              pointerEvents: 'none',
              zIndex: 9999,
              fontSize: 14,
            }}
          >
            <b>
              {tooltip.day}. dzień roku, {tooltip.year} r.
            </b>
            <br />
            Poziom: {(tooltip.value ?? 0 * 100).toFixed(1)}%
            <br />
            {tooltip.isTravel ? 'Podróż: TAK' : 'Podróż: NIE'}
            <br />
            Średnia bazowa tego roku: {(tooltip.baseline ?? 0 * 100).toFixed(1)}
            %
          </div>
        )}
      </div>
      <Stack direction='horizontal' contentAlignment='start' gap={16}>
        {chartData.years.map((year, index) => (
          <div
            key={year}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <div
              style={{
                width: '20px',
                height: '2px',
                backgroundColor: d3.schemeCategory10[index % 10],
                borderRadius: '2px',
              }}
            />
            <span>{year}</span>
          </div>
        ))}
      </Stack>
      <Stack gap={8}>
        <Chip size='sm' variant='flat'>
          🧳 Lata: {chartData.years.join(', ')}
        </Chip>
        <Chip size='sm' variant='flat'>
          📊 Maks. wychylenie: {((scaleMax / 2) * 100).toFixed(1)}%
        </Chip>
        <Chip size='sm' variant='flat'>
          📅 Łączna liczba podróży:{' '}
          {events.filter((e) => e.type === CalendarEventType.Trip).length}
        </Chip>
      </Stack>
    </Stack>
  );
};
