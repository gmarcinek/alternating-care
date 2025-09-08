'use client';

import { CalendarEvent, CalendarEventType } from '@api/db/types';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import { Stack } from '@components/Stack/Stack';
import { ChartLegend } from '@modules/ChartDashboard/modules/CumulativeGradientAlternating/ChartLegend';
import { CumulativeChart } from '@modules/ChartDashboard/modules/CumulativeGradientAlternating/CumulativeChart';
import { DateScale } from '@modules/ChartDashboard/modules/CumulativeGradientAlternating/DateScale';
import { GradientBackground } from '@modules/ChartDashboard/modules/CumulativeGradientAlternating/GradientBackground';
import { TimelineSlider } from '@modules/ChartDashboard/modules/CumulativeGradientAlternating/TimelineSlider';
import { Select, SelectItem } from '@nextui-org/react';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

const BACKGROUND_COLORS = {
  parent1: '#4f8bb0ff',
  parent2: '#ffffffff',
  camp: '#ffe600ff',
};

type CumulationStrategy = 'fromStart' | 'selectedPeriod';
type FutureStrategy = 'flatAfterToday' | 'includePlanned';

interface CumulativeGradientAlternatingProps {
  events: CalendarEvent[];
}

export const CumulativeGradientAlternating = (
  props: CumulativeGradientAlternatingProps
) => {
  const { events } = props;

  // Strategie
  const [cumulationStrategy, setCumulationStrategy] =
    useState<CumulationStrategy>('fromStart');
  const [futureStrategy, setFutureStrategy] =
    useState<FutureStrategy>('flatAfterToday');

  // Spójne "dziś"
  const todayStr = useMemo(() => dayjs().format(dateFormat), []);
  const today = useMemo(() => dayjs(todayStr, dateFormat), [todayStr]);

  // Zakres danych (po ALTERNATING)
  const fullDateRange = useMemo(() => {
    const alternatingEvents = events.filter(
      (e) => e.type === CalendarEventType.Alternating
    );
    if (alternatingEvents.length === 0) return null;

    const sorted = [...alternatingEvents].sort(
      (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix()
    );
    return {
      start: dayjs(sorted[0].date, dateFormat),
      end: dayjs(sorted[sorted.length - 1].date, dateFormat),
    };
  }, [events]);

  const totalDays = fullDateRange
    ? fullDateRange.end.diff(fullDateRange.start, 'days')
    : 0;
  const todayIndex = fullDateRange
    ? today.diff(fullDateRange.start, 'days')
    : 0;

  // Domyślny widok: aktualny rok
  const currentYear = today.year();
  const yearStart = dayjs(`${currentYear}-01-01`);
  const yearEnd = dayjs(`${currentYear}-12-31`);

  const defaultStartIndex = fullDateRange
    ? Math.max(0, yearStart.diff(fullDateRange.start, 'days'))
    : 0;
  const defaultEndIndex = fullDateRange
    ? Math.min(totalDays, yearEnd.diff(fullDateRange.start, 'days'))
    : totalDays;

  const [selectedRange, setSelectedRange] = useState<[number, number]>([
    defaultStartIndex,
    defaultEndIndex,
  ]);

  // Synchronizacja zakresu po zmianie danych
  useEffect(() => {
    if (!fullDateRange) return;
    const start = Math.max(0, yearStart.diff(fullDateRange.start, 'days'));
    const end = Math.min(
      fullDateRange.end.diff(fullDateRange.start, 'days'),
      yearEnd.diff(fullDateRange.start, 'days')
    );
    setSelectedRange([start, end]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullDateRange?.start?.valueOf(), fullDateRange?.end?.valueOf()]);

  // Sety dat (szybkie lookupy)
  const dateSets = useMemo(() => {
    const alternating = new Set<string>();
    const camp = new Set<string>();
    for (const e of events) {
      if (e.type === CalendarEventType.Alternating) alternating.add(e.date);
      else if (e.type === CalendarEventType.Camp) camp.add(e.date);
    }
    return { alternating, camp };
  }, [events]);

  // Taśma do suwaka
  const fullTimelineData = useMemo(() => {
    if (!fullDateRange) return [];

    const data = [];
    let cur = fullDateRange.start.clone();

    while (
      cur.isBefore(fullDateRange.end, 'day') ||
      cur.isSame(fullDateRange.end, 'day')
    ) {
      const ds = cur.format(dateFormat);
      const isCamp = dateSets.camp.has(ds);
      const isAlt = dateSets.alternating.has(ds);
      const isBeforeOrToday = !cur.isAfter(today, 'day');

      data.push({
        date: ds,
        dayIndex: cur.diff(fullDateRange.start, 'days'),
        backgroundType: isCamp ? 'camp' : isAlt ? 'parent1' : 'parent2',
        backgroundColor: isCamp
          ? BACKGROUND_COLORS.camp
          : isAlt
            ? BACKGROUND_COLORS.parent1
            : BACKGROUND_COLORS.parent2,
        isBeforeToday: isBeforeOrToday,
      });

      cur = cur.add(1, 'day');
    }

    return data;
  }, [fullDateRange, dateSets, today]);

  // Czy dzień doliczać do kumulacji (obsługa przyszłości)
  const shouldCountDay = (d: dayjs.Dayjs) =>
    futureStrategy === 'includePlanned' ? true : !d.isAfter(today, 'day');

  // Dane wykresu z obiema strategiami
  const chartData = useMemo(() => {
    if (!fullDateRange) return [];

    const startDate = fullDateRange.start.add(selectedRange[0], 'days');
    const endDate = fullDateRange.start.add(selectedRange[1], 'days');

    let p1 = 0;
    let p2 = 0;

    // fromStart -> pre-roll
    if (cumulationStrategy === 'fromStart') {
      let pre = fullDateRange.start.clone();
      while (pre.isBefore(startDate, 'day')) {
        const ds = pre.format(dateFormat);
        const isP1 = dateSets.alternating.has(ds);
        if (shouldCountDay(pre)) {
          if (isP1) p1++;
          else p2++;
        }
        pre = pre.add(1, 'day');
      }
    }

    const out: Array<{
      date: string;
      parent1Cumulative: number;
      parent2Cumulative: number;
      backgroundType: 'camp' | 'parent1' | 'parent2';
      backgroundColor: string;
      isBeforeToday: boolean;
    }> = [];

    let cur = startDate.clone();
    while (cur.isBefore(endDate, 'day') || cur.isSame(endDate, 'day')) {
      const ds = cur.format(dateFormat);
      const isCamp = dateSets.camp.has(ds);
      const isP1 = dateSets.alternating.has(ds);
      const isBeforeOrToday = !cur.isAfter(today, 'day');

      if (shouldCountDay(cur)) {
        if (isP1) p1++;
        else p2++;
      }

      out.push({
        date: ds,
        parent1Cumulative: p1,
        parent2Cumulative: p2,
        backgroundType: isCamp ? 'camp' : isP1 ? 'parent1' : 'parent2',
        backgroundColor: isCamp
          ? BACKGROUND_COLORS.camp
          : isP1
            ? BACKGROUND_COLORS.parent1
            : BACKGROUND_COLORS.parent2,
        isBeforeToday: isBeforeOrToday,
      });

      cur = cur.add(1, 'day');
    }

    return out;
  }, [
    fullDateRange,
    selectedRange,
    today,
    cumulationStrategy,
    futureStrategy,
    dateSets,
  ]);

  if (!fullDateRange || events.length === 0) {
    return (
      <Stack contentAlignment='center'>
        <p>Brak danych do analizy</p>
      </Stack>
    );
  }

  // Indeks "dziś" na wykresie (jeśli w zakresie)
  const todayIdx = useMemo(() => {
    const idx = chartData.findIndex((d) => d.date === todayStr);
    return idx >= 0 ? idx : null;
  }, [chartData, todayStr]);

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
        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 4px 0' }}>Skumulowana Opieka</h2>
            <small style={{ color: '#666' }}>
              Przyrostowe dni opieki z okresami opieki jako tło
            </small>
          </div>

          {/* Strategia kumulacji */}
          <Select
            size='sm'
            selectedKeys={[cumulationStrategy]}
            onSelectionChange={(keys) => {
              const v = Array.from(keys)[0] as CumulationStrategy;
              setCumulationStrategy(v);
            }}
            className='w-48'
            aria-label='Strategia liczenia kumulacji'
          >
            <SelectItem key='fromStart' value='fromStart'>
              Od początku
            </SelectItem>
            <SelectItem key='selectedPeriod' value='selectedPeriod'>
              Wybrany okres
            </SelectItem>
          </Select>

          {/* Strategia przyszłości */}
          <Select
            size='sm'
            selectedKeys={[futureStrategy]}
            onSelectionChange={(keys) => {
              const v = Array.from(keys)[0] as FutureStrategy;
              setFutureStrategy(v);
            }}
            className='w-56'
            aria-label='Strategia traktowania przyszłości'
          >
            <SelectItem key='flatAfterToday' value='flatAfterToday'>
              Bez Prognozy
            </SelectItem>
            <SelectItem key='includePlanned' value='includePlanned'>
              Z Prognozą
            </SelectItem>
          </Select>
        </div>
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

          {/* Linia DZIŚ */}
          {todayIdx !== null && (
            <div
              style={{
                position: 'absolute',
                left: `${(todayIdx / Math.max(chartData.length - 1, 1)) * 100}%`,
                top: 0,
                width: '2px',
                height: '100%',
                zIndex: 3,
                background:
                  'repeating-linear-gradient(to bottom, red 0px, red 5px, transparent 5px, transparent 10px)',
              }}
            />
          )}

          <CumulativeChart
            chartData={chartData}
            showGridLines={true}
            todayDate={todayStr}
          />
        </div>

        <div style={{ marginTop: '12px' }}>
          <TimelineSlider
            fullTimelineData={fullTimelineData}
            selectedRange={selectedRange}
            onRangeChange={setSelectedRange}
            totalDays={totalDays}
            todayIndex={todayIndex}
            fullDateRange={fullDateRange}
          />
        </div>

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
