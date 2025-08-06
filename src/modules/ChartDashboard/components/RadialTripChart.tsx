'use client';

import { CalendarEvent, CalendarEventType } from '@api/db/types';
import { Stack } from '@components/Stack/Stack';
import { Chip } from '@nextui-org/react';
import * as d3 from 'd3';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import { useEffect, useMemo, useRef } from 'react';
import { ResponsiveContainer } from 'recharts';

// Add dayOfYear plugin
dayjs.extend(dayOfYear);

interface RadialTripChartProps {
  events: CalendarEvent[];
}

interface DayOfYearData {
  dayOfYear: number;
  years: Record<number, number>; // year -> count of trips
  averageCount: number;
  maxCount: number;
}

export const RadialTripChart = (props: RadialTripChartProps) => {
  const { events } = props;
  const svgRef = useRef<SVGSVGElement>(null);

  const chartData = useMemo(() => {
    const tripEvents = events.filter((e) => e.type === CalendarEventType.Trip);

    if (tripEvents.length === 0) return { data: [], years: [] };

    // Group by day of year (1-365)
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

    // Create complete 365-day dataset
    const data: DayOfYearData[] = [];
    for (let day = 1; day <= 365; day++) {
      const yearCounts = dayData.get(day) || {};
      const counts = years.map((year) => yearCounts[year] || 0);
      const averageCount =
        counts.length > 0
          ? counts.reduce((a, b) => a + b, 0) / years.length
          : 0;
      const maxCount = Math.max(...counts, 0);

      data.push({
        dayOfYear: day,
        years: yearCounts,
        averageCount,
        maxCount,
      });
    }

    return { data, years };
  }, [events]);

  const maxValue = useMemo(() => {
    if (chartData.data.length === 0) return 1;
    return Math.max(
      ...chartData.data.map((d) => Math.max(d.averageCount, d.maxCount))
    );
  }, [chartData]);

  useEffect(() => {
    if (!svgRef.current || chartData.data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerWidth = svgRef.current.clientWidth;
    const containerHeight = svgRef.current.clientHeight;

    if (containerWidth === 0 || containerHeight === 0) return;

    const size = Math.min(containerWidth, containerHeight);
    const margin = 60;
    const radius = (size - margin * 2) / 2;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    // Scales
    const angleScale = d3
      .scaleLinear()
      .domain([1, 365])
      .range([0, 2 * Math.PI]);

    const radiusScale = d3
      .scaleLinear()
      .domain([0, maxValue])
      .range([0, radius]);

    const g = svg
      .append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    // Radial grid lines
    const gridLines = [0.25, 0.5, 0.75, 1].map((f) => f * maxValue);
    gridLines.forEach((value) => {
      g.append('circle')
        .attr('r', radiusScale(value))
        .attr('fill', 'none')
        .attr('stroke', '#e0e0e0')
        .attr('stroke-width', 1);

      // Grid labels
      g.append('text')
        .attr('x', 5)
        .attr('y', -radiusScale(value))
        .attr('font-size', 10)
        .attr('fill', '#666')
        .text(value.toFixed(1));
    });

    // Month labels
    for (let month = 1; month <= 12; month++) {
      const monthStart = dayjs()
        .month(month - 1)
        .startOf('month')
        .dayOfYear();
      const angle = angleScale(monthStart) - Math.PI / 2; // Start from top
      const labelRadius = radius + 20;
      const x = Math.cos(angle) * labelRadius;
      const y = Math.sin(angle) * labelRadius;

      g.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('fill', '#666')
        .text(
          dayjs()
            .month(month - 1)
            .format('MMM')
        );

      // Month divider lines
      g.append('line')
        .attr('x1', Math.cos(angle) * 30)
        .attr('y1', Math.sin(angle) * 30)
        .attr('x2', Math.cos(angle) * radius)
        .attr('y2', Math.sin(angle) * radius)
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1);
    }

    // Area generator for average data
    const areaGenerator = d3
      .areaRadial<DayOfYearData>()
      .angle((d) => angleScale(d.dayOfYear) - Math.PI / 2)
      .innerRadius(0)
      .outerRadius((d) => radiusScale(d.averageCount))
      .curve(d3.curveCardinal);

    // Draw average area
    g.append('path')
      .datum(chartData.data)
      .attr('d', areaGenerator)
      .attr('fill', 'rgba(255, 79, 79, 0.3)')
      .attr('stroke', 'none');

    // Line generator for individual years
    const lineGenerator = d3
      .lineRadial<DayOfYearData>()
      .angle((d) => angleScale(d.dayOfYear) - Math.PI / 2)
      .radius((d) => radiusScale(d.maxCount))
      .curve(d3.curveCardinal);

    // Draw lines for each year
    chartData.years.forEach((year, index) => {
      const yearData = chartData.data.map((d) => ({
        ...d,
        maxCount: d.years[year] || 0,
      }));

      const color = d3.schemeCategory10[index % 10];

      g.append('path')
        .datum(yearData)
        .attr('d', lineGenerator)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('opacity', 0.7);
    });

    // Center dot
    g.append('circle').attr('r', 3).attr('fill', '#666');
  }, [chartData, maxValue]);

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
          <h2>Sezonowość Podróży</h2>
          <small style={{ color: '#666' }}>
            Radialny wykres rozkładu podróży w ciągu roku
          </small>
        </div>
      </Stack>

      <div style={{ width: '100%', height: '500px' }}>
        <ResponsiveContainer>
          <svg
            ref={svgRef}
            width='100%'
            height='100%'
            style={{ border: '1px solid #ddd', borderRadius: '8px' }}
          />
        </ResponsiveContainer>
      </div>

      <Stack direction='horizontal' contentAlignment='start' gap={16}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: 'rgba(255, 79, 79, 0.3)',
              borderRadius: '4px',
            }}
          />
          <span>Średnia z lat</span>
        </div>
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
          📊 Maks. podróży/dzień: {maxValue.toFixed(1)}
        </Chip>
        <Chip size='sm' variant='flat'>
          📅 Łączna liczba podróży:{' '}
          {events.filter((e) => e.type === CalendarEventType.Trip).length}
        </Chip>
      </Stack>
    </Stack>
  );
};
