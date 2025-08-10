'use client';

import { CalendarEvent, CalendarEventType } from '@api/db/types';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import { Stack } from '@components/Stack/Stack';
import { ChartLegend } from '@modules/ChartDashboard/modules/CumulativeGradientAlternating/ChartLegend';
import { CumulativeChart } from '@modules/ChartDashboard/modules/CumulativeGradientAlternating/CumulativeChart';
import { DateScale } from '@modules/ChartDashboard/modules/CumulativeGradientAlternating/DateScale';
import { GradientBackground } from '@modules/ChartDashboard/modules/CumulativeGradientAlternating/GradientBackground';
import { TimelineSlider } from '@modules/ChartDashboard/modules/CumulativeGradientAlternating/TimelineSlider';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

const BACKGROUND_COLORS = {
  parent1: '#2d5465',
  parent2: '#ffffff',
  camp: '#ffeb3b',
};

interface CumulativeGradientAlternatingProps {
  events: CalendarEvent[];
}

export const CumulativeGradientAlternating = (
  props: CumulativeGradientAlternatingProps
) => {
  const { events } = props;
  const today = dayjs();

  // Pełny zakres dat od pierwszego do ostatniego ALTERNATING
  const fullDateRange = useMemo(() => {
    const alternatingEvents = events.filter(
      (e) => e.type === CalendarEventType.Alternating
    );
    if (alternatingEvents.length === 0) return null;

    const sortedEvents = alternatingEvents.sort(
      (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix()
    );
    return {
      start: dayjs(sortedEvents[0].date),
      end: dayjs(sortedEvents[sortedEvents.length - 1].date),
    };
  }, [events]);

  const totalDays = fullDateRange
    ? fullDateRange.end.diff(fullDateRange.start, 'days')
    : 0;
  const todayIndex = fullDateRange
    ? today.diff(fullDateRange.start, 'days')
    : 0;

  // Defaultowy widok: start roku aktualnego do końca roku aktualnego
  const currentYear = today.year();
  const yearStart = dayjs(`${currentYear}-01-01`);
  const yearEnd = dayjs(`${currentYear}-12-31`);

  const defaultStartIndex = fullDateRange
    ? Math.max(0, yearStart.diff(fullDateRange.start, 'days'))
    : 0;
  const defaultEndIndex = fullDateRange
    ? Math.min(totalDays, yearEnd.diff(fullDateRange.start, 'days'))
    : totalDays;

  // Range suwaka - defaultowo aktualny rok
  const [selectedRange, setSelectedRange] = useState<[number, number]>([
    defaultStartIndex,
    defaultEndIndex,
  ]);

  // Pełne dane dla suwaka (cały zakres dat)
  const fullTimelineData = useMemo(() => {
    if (!fullDateRange) return [];

    const alternatingEvents = events.filter(
      (e) => e.type === CalendarEventType.Alternating
    );
    const campEvents = events.filter((e) => e.type === CalendarEventType.Camp);

    const alternatingDates = new Set(alternatingEvents.map((e) => e.date));
    const campDates = new Set(campEvents.map((e) => e.date));

    const data = [];
    let currentDate = fullDateRange.start.clone();

    while (
      currentDate.isBefore(fullDateRange.end, 'day') ||
      currentDate.isSame(fullDateRange.end, 'day')
    ) {
      const dateStr = currentDate.format(dateFormat);
      const isCamp = campDates.has(dateStr);
      const isParent1 = alternatingDates.has(dateStr);
      const isBeforeToday =
        currentDate.isBefore(today, 'day') || currentDate.isSame(today, 'day');

      data.push({
        date: dateStr,
        dayIndex: currentDate.diff(fullDateRange.start, 'days'),
        backgroundType: isCamp ? 'camp' : isParent1 ? 'parent1' : 'parent2',
        backgroundColor: isCamp
          ? BACKGROUND_COLORS.camp
          : isParent1
            ? BACKGROUND_COLORS.parent1
            : BACKGROUND_COLORS.parent2,
        isBeforeToday,
      });

      currentDate = currentDate.add(1, 'day');
    }

    return data;
  }, [events, fullDateRange, today]);

  // Dane kumulatywne tylko dla wybranego zakresu
  const chartData = useMemo(() => {
    if (!fullDateRange) return [];

    const startDate = fullDateRange.start.add(selectedRange[0], 'days');
    const endDate = fullDateRange.start.add(selectedRange[1], 'days');

    const alternatingEvents = events.filter(
      (e) => e.type === CalendarEventType.Alternating
    );
    const campEvents = events.filter((e) => e.type === CalendarEventType.Camp);

    const alternatingDates = new Set(alternatingEvents.map((e) => e.date));
    const campDates = new Set(campEvents.map((e) => e.date));

    const data = [];
    let parent1Cumulative = 0;
    let parent2Cumulative = 0;
    let currentDate = startDate.clone();

    // Oblicz kumulację do początku wybranego zakresu
    let calcDate = fullDateRange.start.clone();
    while (calcDate.isBefore(startDate, 'day')) {
      const dateStr = calcDate.format(dateFormat);
      const isCamp = campDates.has(dateStr);
      const isParent1 = alternatingDates.has(dateStr);
      const isBeforeToday =
        calcDate.isBefore(today, 'day') || calcDate.isSame(today, 'day');

      if (isBeforeToday && !isCamp) {
        if (isParent1) {
          parent1Cumulative++;
        } else {
          parent2Cumulative++;
        }
      }
      calcDate = calcDate.add(1, 'day');
    }

    // Generuj dane dla wybranego zakresu
    while (
      currentDate.isBefore(endDate, 'day') ||
      currentDate.isSame(endDate, 'day')
    ) {
      const dateStr = currentDate.format(dateFormat);
      const isCamp = campDates.has(dateStr);
      const isParent1 = alternatingDates.has(dateStr);
      const isBeforeToday =
        currentDate.isBefore(today, 'day') || currentDate.isSame(today, 'day');

      if (isBeforeToday && !isCamp) {
        if (isParent1) {
          parent1Cumulative++;
        } else {
          parent2Cumulative++;
        }
      }

      data.push({
        date: dateStr,
        parent1Cumulative,
        parent2Cumulative,
        backgroundType: isCamp ? 'camp' : isParent1 ? 'parent1' : 'parent2',
        backgroundColor: isCamp
          ? BACKGROUND_COLORS.camp
          : isParent1
            ? BACKGROUND_COLORS.parent1
            : BACKGROUND_COLORS.parent2,
        isBeforeToday,
      });

      currentDate = currentDate.add(1, 'day');
    }

    return data;
  }, [events, fullDateRange, selectedRange, today]);

  if (!fullDateRange || events.length === 0) {
    return (
      <Stack contentAlignment='center'>
        <p>Brak danych do analizy</p>
      </Stack>
    );
  }

  return (
    <div
      style={{
        padding: 0,
        margin: 0,
        height: '60vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ marginBottom: '16px', flexShrink: 0 }}>
        <h2 style={{ margin: '0 0 4px 0' }}>Skumulowana Opieka</h2>
        <small style={{ color: '#666' }}>
          Przyrostowe dni opieki z okresami opieki jako tło
        </small>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <DateScale chartData={chartData} position='top' />

        {/* Główny wykres */}
        <div
          style={{
            width: '100%',
            flex: 1,
            position: 'relative',
            border: '1px solid #ccc',
            borderBottom: 'none',
            borderTop: 'none',
            minHeight: 0,
          }}
        >
          <GradientBackground chartData={chartData} />

          {/* Linia DZIŚ na głównym wykresie */}
          {chartData.some((d) => d.date === today.format(dateFormat)) && (
            <div
              style={{
                position: 'absolute',
                left: `${(chartData.findIndex((d) => d.date === today.format(dateFormat)) / chartData.length) * 100}%`,
                top: 0,
                width: '2px',
                height: '100%',
                backgroundColor: 'red',
                zIndex: 3,
                background:
                  'repeating-linear-gradient(to bottom, red 0px, red 5px, transparent 5px, transparent 10px)',
              }}
            />
          )}

          <CumulativeChart
            chartData={chartData}
            showGridLines={true}
            todayDate={today.format(dateFormat)}
          />
        </div>

        <TimelineSlider
          fullTimelineData={fullTimelineData}
          selectedRange={selectedRange}
          onRangeChange={setSelectedRange}
          totalDays={totalDays}
          todayIndex={todayIndex}
        />

        <DateScale
          chartData={chartData}
          position='bottom'
          fullDateRange={fullDateRange}
        />

        <ChartLegend
          chartData={chartData}
          backgroundColors={BACKGROUND_COLORS}
        />
      </div>
    </div>
  );
};
