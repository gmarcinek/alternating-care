// AlternatingGradientBarPerYear.tsx
'use client';

import { CalendarEvent, CalendarEventType } from '@api/db/types';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import { Stack } from '@components/Stack/Stack';
import { Chip } from '@nextui-org/react';
import * as d3 from 'd3';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef } from 'react';
import { ResponsiveContainer } from 'recharts';

// ---- KONFIGURACJA WIDGETU ----
export const BAR_COLORS = {
  parent1: '#2d5465',
  parent2: '#fff',
  camp: '#ffeb3b',
};
export const BAR_HEIGHT_FACTOR = 48; // wysokość słupka względem wiersza
export const MIN_ROW_HEIGHT = 120; // minimalna wysokość jednego wiersza (roku)
export const BAR_LABEL_FONT = 24;
export const MARGIN = { top: 36, right: 20, bottom: 40, left: 20 };
export const BAR_PADDING = 0;
export const MONTH_LABEL_FONT = 12;
export const MONTH_LABEL_COLOR = '#888';
export const AXIS_LINE_COLOR = '#acacacff';
export const TODAY_LINE_COLOR = '#ff0000ff';
export const TODAY_TEXT_COLOR = '#ff0000ff';

interface AlternatingGradientProps {
  events: CalendarEvent[];
}

const dayOfYear = (d: dayjs.Dayjs) => d.diff(d.clone().startOf('year'), 'day');

export const AlternatingGradient = (props: AlternatingGradientProps) => {
  const { events } = props;
  const svgRef = useRef<SVGSVGElement>(null);

  // Grupowanie po roku + podsumowania per rok
  const yearsData = useMemo(() => {
    const segmentsByYear = new Map<
      number,
      Array<{
        date: string;
        dayjs: dayjs.Dayjs;
        isParent1: boolean;
        isCamp: boolean;
        index: number;
      }>
    >();
    const campEvents = events.filter((e) => e.type === CalendarEventType.Camp);
    const alternatingEvents = events.filter(
      (e) => e.type === CalendarEventType.Alternating
    );
    if (events.length === 0) return [];
    const minYear = Math.min(...events.map((e) => dayjs(e.date).year()));
    const maxYear = Math.max(...events.map((e) => dayjs(e.date).year()));
    for (let year = minYear; year <= maxYear; year++) {
      const yearStart = dayjs(`${year}-01-01`);
      const yearEnd = dayjs(`${year}-12-31`);
      const daysInYear = yearEnd.diff(yearStart, 'day') + 1;
      const alternatingDates = new Set(
        alternatingEvents
          .filter((e) => dayjs(e.date).year() === year)
          .map((e) => e.date)
      );
      const campDates = new Set(
        campEvents
          .filter((e) => dayjs(e.date).year() === year)
          .map((e) => e.date)
      );
      const segments = [];
      let currentDate = yearStart.clone();
      let dayIndex = 0;
      while (currentDate.isBefore(yearEnd) || currentDate.isSame(yearEnd)) {
        const dateStr = currentDate.format(dateFormat);
        const isParent1Day = alternatingDates.has(dateStr);
        const isCampDay = campDates.has(dateStr);
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
      segmentsByYear.set(year, segments);
    }
    return Array.from(segmentsByYear.entries()).map(([year, segments]) => {
      const parent1Days = segments.filter((s) => s.isParent1).length;
      const campDays = segments.filter((s) => s.isCamp).length;
      const parent2Days = segments.length - parent1Days - campDays;
      return {
        year,
        segments,
        parent1Days,
        parent2Days,
        campDays,
        totalDays: segments.length,
      };
    });
  }, [events]);

  useEffect(() => {
    const renderChart = () => {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();
      const containerWidth = svgRef.current!.clientWidth;
      const containerHeight = svgRef.current!.clientHeight;
      if (containerWidth === 0 || containerHeight === 0) {
        setTimeout(renderChart, 100);
        return;
      }
      const width = containerWidth - MARGIN.left - MARGIN.right;
      const height = containerHeight - MARGIN.top - MARGIN.bottom;
      // Skala X - zawsze 366
      const xScale = d3.scaleLinear().domain([0, 365]).range([0, width]);
      // Wysokość na jeden bar (z odstępem pod label)
      const rowHeight = Math.max(
        Math.floor(height / yearsData.length),
        MIN_ROW_HEIGHT
      );
      const barHeight = rowHeight - BAR_HEIGHT_FACTOR;
      const barYOffset = 18; // Zostaw na label roku
      const g = svg
        .append('g')
        .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

      const today = dayjs();

      yearsData.forEach((yearObj, i) => {
        // Label roku NAD barem
        g.append('text')
          .attr('x', 44)
          .attr('y', i * rowHeight + 4)
          .attr('text-anchor', 'middle')
          .attr('font-size', BAR_LABEL_FONT)
          .attr('fill', '#444')
          .style('font-weight', 'bold')
          .text(yearObj.year);
        // Bar z segmentami
        for (let d = 0; d < yearObj.segments.length; d++) {
          const seg = yearObj.segments[d];
          let fillColor = BAR_COLORS.parent2;
          if (seg.isCamp) fillColor = BAR_COLORS.camp;
          else if (seg.isParent1) fillColor = BAR_COLORS.parent1;
          const barW = width / 366;

          // Sprawdź czy dzień jest w przyszłości
          const isInFuture = seg.dayjs.isAfter(today, 'day');

          g.append('rect')
            .attr('x', xScale(d))
            .attr('y', i * rowHeight + barYOffset)
            .attr('width', Math.max(barW - BAR_PADDING, 1))
            .attr('height', barHeight)
            .attr('fill', fillColor)
            .attr('stroke', '#666')
            .attr('stroke-width', 0.1)
            .attr('opacity', isInFuture ? 0.7 : 1)
            .style('cursor', 'pointer')
            .append('title')
            .text(() => {
              const careType = seg.isCamp
                ? 'Kolonie'
                : seg.isParent1
                  ? 'Rodzic 1'
                  : 'Rodzic 2';
              const futureText = isInFuture ? ' (zaplanowane)' : '';
              return `${seg.date} - ${careType}${futureText}`;
            });
        }
      });
      // Oś X — miesiące (na dole)
      const months = d3.range(0, 12);
      months.forEach((monthIdx) => {
        const d = dayjs().startOf('year').add(monthIdx, 'month');
        const x = xScale(dayOfYear(d));
        g.append('text')
          .attr('x', x + 5)
          .attr('y', yearsData.length * rowHeight + 14)
          .attr('text-anchor', 'start')
          .attr('font-size', MONTH_LABEL_FONT)
          .attr('fill', MONTH_LABEL_COLOR)
          .text(d.format('MMM'));
        g.append('line')
          .attr('x1', x)
          .attr('x2', x)
          .attr('y1', 0)
          .attr('y2', yearsData.length * rowHeight)
          .attr('stroke', AXIS_LINE_COLOR)
          .attr('stroke-width', 1);
      });
      // Linia "dziś" na swoim roku
      const todayYearIdx = yearsData.findIndex((y) => y.year === today.year());
      if (todayYearIdx !== -1) {
        const todayX = xScale(dayOfYear(today));
        g.append('line')
          .attr('x1', todayX)
          .attr('x2', todayX)
          .attr('y1', todayYearIdx * rowHeight + barYOffset - 8)
          .attr('y2', todayYearIdx * rowHeight + barYOffset + barHeight + 8)
          .attr('stroke', TODAY_LINE_COLOR)
          .attr('stroke-width', 3)
          .attr('stroke-dasharray', '3,3');
        g.append('text')
          .attr('x', todayX)
          .attr('y', todayYearIdx * rowHeight + barYOffset - 12)
          .attr('text-anchor', 'middle')
          .attr('fill', TODAY_TEXT_COLOR)
          .style('font-size', '12px')
          .style('font-weight', 'bold')
          .text('DZIŚ');
      }
    };
    setTimeout(renderChart, 50);
  }, [yearsData]);

  if (yearsData.length === 0) {
    return (
      <Stack contentAlignment='center' style={{ minHeight: '150px' }}>
        <p>Brak danych ALTERNATING do wizualizacji</p>
      </Stack>
    );
  }

  return (
    <Stack gap={16}>
      {/* Podsumowanie ogólne */}

      {/* Header */}
      <Stack
        direction='horizontal'
        contentAlignment='between'
        itemsAlignment='center'
      >
        <div>
          <h2>Rozkład odbytej i zaplanowanej opieki</h2>
          <small style={{ color: '#666' }}>Wykres D3 z podziałem na lata</small>
        </div>
      </Stack>
      {/* D3 Chart */}
      <div
        style={{
          width: '100%',
          height:
            MARGIN.top + MARGIN.bottom + yearsData.length * MIN_ROW_HEIGHT,
        }}
      >
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
              backgroundColor: BAR_COLORS.parent1,
              borderRadius: '4px',
            }}
          ></div>
          <span>Rodzic 1</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: BAR_COLORS.parent2,
              border: '1px solid #666',
              borderRadius: '4px',
            }}
          ></div>
          <span>Rodzic 2</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: BAR_COLORS.camp,
              borderRadius: '4px',
            }}
          ></div>
          <span>Kolonie</span>
        </div>
      </Stack>

      <Stack gap={8}>
        <Chip size='sm' variant='flat'>
          📅 Lata: {yearsData.map((y) => y.year).join(', ')}
        </Chip>
        <Chip size='sm' variant='flat'>
          📊 Suma dni: {yearsData.reduce((a, y) => a + y.totalDays, 0)}
        </Chip>
        <Chip size='sm' variant='flat'>
          ⚖️ Suma Bilans:{' '}
          {yearsData.reduce(
            (acc, y) => acc + (y.parent2Days - y.parent1Days),
            0
          ) > 0
            ? '+'
            : ''}
          {yearsData.reduce(
            (acc, y) => acc + (y.parent2Days - y.parent1Days),
            0
          )}
        </Chip>
        <Chip size='sm' variant='flat'>
          🏕️ Kolonie (suma): {yearsData.reduce((a, y) => a + y.campDays, 0)}
        </Chip>
      </Stack>
      {/* Podsumowanie per rok */}
      <Stack gap={12}>
        {yearsData.map((y) => (
          <Chip key={y.year} size='sm' variant='bordered'>
            {y.year}: Bilans {y.parent2Days - y.parent1Days > 0 ? '+' : ''}
            {y.parent2Days - y.parent1Days}, Rodzic1 {y.parent1Days}, Rodzic2{' '}
            {y.parent2Days}, Kolonie {y.campDays}
          </Chip>
        ))}
      </Stack>
    </Stack>
  );
};
