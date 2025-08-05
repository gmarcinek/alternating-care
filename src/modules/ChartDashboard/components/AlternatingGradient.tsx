'use client';

import { CalendarEvent, CalendarEventType } from '@api/db/types';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import { Stack } from '@components/Stack/Stack';
import { Chip } from '@nextui-org/react';
import * as d3 from 'd3';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef } from 'react';
import { ResponsiveContainer } from 'recharts';

interface AlternatingGradientProps {
  events: CalendarEvent[];
}

export const AlternatingGradient = (props: AlternatingGradientProps) => {
  const { events } = props;
  const svgRef = useRef<SVGSVGElement>(null);

  const gradientData = useMemo(() => {
    const alternatingEvents = events.filter(
      (e) => e.type === CalendarEventType.Alternating
    );

    const campEvents = events.filter((e) => e.type === CalendarEventType.Camp);

    if (alternatingEvents.length === 0) {
      return {
        segments: [],
        dateRange: null,
        totalDays: 0,
        parent1Days: 0,
        parent2Days: 0,
        campDays: 0,
      };
    }

    const sortedEvents = alternatingEvents.sort(
      (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix()
    );

    const firstDate = dayjs(sortedEvents[0].date);
    const lastDate = dayjs(sortedEvents[sortedEvents.length - 1].date);
    const alternatingDates = new Set(alternatingEvents.map((e) => e.date));
    const campDates = new Set(campEvents.map((e) => e.date));

    const today = dayjs();
    const analysisEndDate = lastDate.isAfter(today) ? today : lastDate;
    const totalDays = analysisEndDate.diff(firstDate, 'days') + 1;

    const segments: Array<{
      date: string;
      dayjs: dayjs.Dayjs;
      isParent1: boolean;
      isCamp: boolean;
      index: number;
    }> = [];

    let currentDate = firstDate.clone();
    let dayIndex = 0;
    let parent1Count = 0;
    let parent2Count = 0;
    let campCount = 0;

    while (
      currentDate.isBefore(analysisEndDate) ||
      currentDate.isSame(analysisEndDate)
    ) {
      const dateStr = currentDate.format(dateFormat);
      const isParent1Day = alternatingDates.has(dateStr);
      const isCampDay = campDates.has(dateStr);

      if (isCampDay) {
        campCount++;
      } else if (isParent1Day) {
        parent1Count++;
      } else {
        parent2Count++;
      }

      segments.push({
        date: dateStr,
        dayjs: currentDate.clone(),
        isParent1: isParent1Day,
        isCamp: isCampDay,
        index: dayIndex,
      });

      currentDate = currentDate.add(1, 'day');
      dayIndex++;
    }

    return {
      segments,
      dateRange: {
        start: firstDate.format('DD.MM.YYYY'),
        end: analysisEndDate.format('DD.MM.YYYY'),
        startDate: firstDate,
        endDate: analysisEndDate,
      },
      totalDays,
      parent1Days: parent1Count,
      parent2Days: parent2Count,
      campDays: campCount,
    };
  }, [events]);

  useEffect(() => {
    // Delay dla ResponsiveContainer
    const renderChart = () => {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      // Pobierz wymiary z ResponsiveContainer
      const containerWidth = svgRef.current!.clientWidth;
      const containerHeight = svgRef.current!.clientHeight;

      if (containerWidth === 0 || containerHeight === 0) {
        // ResponsiveContainer jeszcze nie gotowy
        setTimeout(renderChart, 100);
        return;
      }

      const margin = { top: 20, right: 20, bottom: 40, left: 20 };
      const width = containerWidth - margin.left - margin.right;
      const height = containerHeight - margin.top - margin.bottom;
      const barHeight = Math.min(200, height - 60); // Dostosuj do dostępnej wysokości

      const xScale = d3
        .scaleTime()
        .domain([
          gradientData.dateRange!.startDate.toDate(),
          gradientData.dateRange!.endDate.toDate(),
        ])
        .range([0, width]);

      const g = svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Paski dla każdego dnia
      gradientData.segments.forEach((segment) => {
        const x = xScale(segment.dayjs.toDate());
        const barWidth = width / gradientData.segments.length;

        // Kolor na podstawie typu dnia
        let fillColor = '#ffffff'; // Parent 2 (default)
        if (segment.isCamp) {
          fillColor = '#ffeb3b'; // Żółty dla kolonii
        } else if (segment.isParent1) {
          fillColor = '#2d5465'; // Niebieski dla Parent 1
        }

        g.append('rect')
          .attr('x', x)
          .attr('y', (height - barHeight) / 2)
          .attr('width', Math.max(barWidth, 1))
          .attr('height', barHeight)
          .attr('fill', fillColor)
          .attr('stroke', '#666')
          .attr('stroke-width', 0.1);
      });

      // Oś X
      const xAxis = d3
        .axisBottom(xScale)
        .tickFormat((d) => d3.timeFormat('%m/%y')(d as Date))
        .ticks(d3.timeMonth.every(1));

      g.append('g')
        .attr('transform', `translate(0, ${height - 10})`)
        .call(xAxis)
        .selectAll('text')
        .style('font-size', '12px');

      // Linia "dziś"
      const today = dayjs();
      if (
        today.isAfter(gradientData.dateRange!.startDate) &&
        today.isBefore(gradientData.dateRange!.endDate)
      ) {
        const todayX = xScale(today.toDate());
        g.append('line')
          .attr('x1', todayX)
          .attr('x2', todayX)
          .attr('y1', (height - barHeight) / 2 - 10)
          .attr('y2', (height - barHeight) / 2 + barHeight + 10)
          .attr('stroke', '#834b4bff')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '3,3');

        g.append('text')
          .attr('x', todayX)
          .attr('y', (height - barHeight) / 2 - 15)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ff4f4f')
          .style('font-size', '12px')
          .style('font-weight', 'bold')
          .text('DZIŚ');
      }
    };

    // Delay dla ResponsiveContainer
    setTimeout(renderChart, 50);
  }, [gradientData]);

  if (gradientData.segments.length === 0) {
    return (
      <Stack contentAlignment='center' style={{ minHeight: '150px' }}>
        <p>Brak danych ALTERNATING do wizualizacji</p>
      </Stack>
    );
  }

  return (
    <Stack gap={16}>
      {/* Przedział dat */}
      {gradientData.dateRange && (
        <Stack direction='horizontal' contentAlignment='center' gap={8}>
          <Chip size='sm' variant='flat'>
            📅 {gradientData.dateRange.start} - {gradientData.dateRange.end}
          </Chip>
          <Chip size='sm' variant='flat'>
            📊 {gradientData.totalDays} dni
          </Chip>
          <Chip size='sm' variant='flat'>
            ⚖️ Bilans:{' '}
            {gradientData.parent2Days - gradientData.parent1Days > 0 ? '+' : ''}
            {gradientData.parent2Days - gradientData.parent1Days}
          </Chip>
          <Chip size='sm' variant='flat'>
            🏕️ Kolonie: {gradientData.campDays} dni
          </Chip>
        </Stack>
      )}

      {/* Header */}
      <Stack
        direction='horizontal'
        contentAlignment='between'
        itemsAlignment='center'
      >
        <div>
          <h3>Rozkład Opieki</h3>
          <small style={{ color: '#666' }}>Wykres D3 z podziałką czasową</small>
        </div>
      </Stack>

      {/* D3 Chart */}
      <div style={{ width: '100%', height: '280px' }}>
        <ResponsiveContainer>
          <svg
            ref={svgRef}
            width='100%'
            height='100%'
            style={{ border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </ResponsiveContainer>
      </div>

      {/* Legenda */}
      <Stack direction='horizontal' contentAlignment='start' gap={16}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#2d5465',
              borderRadius: '4px',
            }}
          ></div>
          <span>
            Rodzic 1: {gradientData.parent1Days} dni (
            {Math.round(
              (gradientData.parent1Days / gradientData.totalDays) * 100
            )}
            %)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#ffffff',
              border: '1px solid #666',
              borderRadius: '4px',
            }}
          ></div>
          <span>
            Rodzic 2: {gradientData.parent2Days} dni (
            {Math.round(
              (gradientData.parent2Days / gradientData.totalDays) * 100
            )}
            %)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#ffeb3b',
              borderRadius: '4px',
            }}
          ></div>
          <span>
            Kolonie: {gradientData.campDays} dni (
            {Math.round((gradientData.campDays / gradientData.totalDays) * 100)}
            %)
          </span>
        </div>
      </Stack>
    </Stack>
  );
};
