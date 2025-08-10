import { CalendarEvent, CalendarEventType } from '@api/db/types';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import { Stack } from '@components/Stack/Stack';
import { Slider } from '@nextui-org/react';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const CHART_COLORS = {
  parent1: '#2196F3',
  parent2: '#E91E63',
};

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

  // Range suwaka - domyślnie cały zakres
  const [selectedRange, setSelectedRange] = useState<[number, number]>([
    0,
    totalDays,
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
      <Stack contentAlignment='center' style={{ minHeight: '400px' }}>
        <p>Brak danych do analizy</p>
      </Stack>
    );
  }

  return (
    <div style={{ padding: 0, margin: 0 }}>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ margin: '0 0 4px 0' }}>Skumulowana Opieka</h2>
        <small style={{ color: '#666' }}>
          Przyrostowe dni opieki z okresami opieki jako tło
        </small>
      </div>

      {/* Podziałka dat na górze */}
      <div
        style={{
          width: '100%',
          height: '30px',
          border: '1px solid #ccc',
          borderBottom: 'none',
          position: 'relative',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          fontSize: '11px',
          color: '#666',
        }}
      >
        {Array.from({ length: Math.min(16, chartData.length) }, (_, i) => {
          const index = Math.floor(
            (i / (Math.min(16, chartData.length) - 1)) * (chartData.length - 1)
          );
          const day = chartData[index];
          if (!day) return null;

          const date = dayjs(day.date);
          const showYear =
            i === 0 ||
            i === Math.min(16, chartData.length) - 1 ||
            (i > 0 &&
              date.year() !==
                dayjs(
                  chartData[
                    Math.floor(
                      ((i - 1) / (Math.min(16, chartData.length) - 1)) *
                        (chartData.length - 1)
                    )
                  ].date
                ).year());

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${(index / (chartData.length - 1)) * 100}%`,
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
              }}
            >
              {showYear ? date.format('DD.MM.YY') : date.format('DD.MM')}
            </div>
          );
        })}
      </div>

      {/* Główny wykres */}
      <div
        style={{
          width: '100%',
          height: '300px',
          position: 'relative',
          border: '1px solid #ccc',
          borderBottom: 'none',
          borderTop: 'none',
        }}
      >
        {/* Tło z gradientem */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            opacity: 0.3,
            zIndex: 1,
          }}
        >
          {chartData.map((day, index) => {
            const width = `${100 / chartData.length}%`;
            return (
              <div
                key={index}
                style={{
                  width,
                  height: '100%',
                  backgroundColor: day.backgroundColor,
                  opacity: day.isBeforeToday ? 1 : 0.3,
                }}
                title={`${day.date} - ${day.backgroundType === 'camp' ? 'Kolonie' : day.backgroundType === 'parent1' ? 'Rodzic 1' : 'Rodzic 2'}`}
              />
            );
          })}
        </div>

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

        {/* Wykres */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            height: '100%',
          }}
        >
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <XAxis hide />
              <YAxis hide />

              {/* Poziome linie co 100 dni kumulacji */}
              {Array.from(
                {
                  length:
                    Math.floor(
                      Math.max(
                        ...chartData.map((d) =>
                          Math.max(d.parent1Cumulative, d.parent2Cumulative)
                        )
                      ) / 100
                    ) + 1,
                },
                (_, i) => {
                  const value = (i + 1) * 100;
                  return (
                    <ReferenceLine
                      key={i}
                      y={value}
                      stroke='#ddd'
                      strokeWidth={1}
                      strokeDasharray='2 2'
                      strokeOpacity={0.5}
                    />
                  );
                }
              )}

              <Tooltip
                labelFormatter={(value) => dayjs(value).format('DD.MM.YYYY')}
                formatter={(value, name) => {
                  const displayName =
                    name === 'parent1Cumulative' ? 'Rodzic 1' : 'Rodzic 2';
                  return [`${value} dni`, displayName];
                }}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              />

              <Line
                type='monotone'
                dataKey='parent1Cumulative'
                stroke={CHART_COLORS.parent1}
                strokeWidth={3}
                dot={false}
                name='parent1Cumulative'
              />
              <Line
                type='monotone'
                dataKey='parent2Cumulative'
                stroke={CHART_COLORS.parent2}
                strokeWidth={3}
                dot={false}
                name='parent2Cumulative'
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Podziałka dat pod suwakiem */}
      <div
        style={{
          width: '100%',
          height: '25px',
          border: '1px solid #ccc',
          borderTop: 'none',
          position: 'relative',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px',
          fontSize: '11px',
          color: '#666',
        }}
      >
        <span>{fullDateRange.start.format('DD.MM.YYYY')}</span>
        <span>{fullDateRange.end.format('DD.MM.YYYY')}</span>
      </div>

      {/* Suwak z pełnym gradientem */}
      <div
        style={{
          position: 'relative',
          border: '1px solid #ccc',
          height: '40px',
          borderTop: 'none',
          borderBottom: 'none',
        }}
      >
        {/* Gradient pełnego zakresu */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
          }}
        >
          {fullTimelineData.map((day, index) => {
            const width = `${100 / fullTimelineData.length}%`;
            return (
              <div
                key={index}
                style={{
                  width,
                  height: '100%',
                  backgroundColor: day.backgroundColor,
                  opacity: day.isBeforeToday ? 0.8 : 0.3,
                }}
              />
            );
          })}
        </div>

        {/* Linia DZIŚ na suwaku */}
        {todayIndex >= 0 && todayIndex <= totalDays && (
          <div
            style={{
              position: 'absolute',
              left: `${(todayIndex / totalDays) * 100}%`,
              top: 0,
              width: '2px',
              height: '100%',
              zIndex: 3,
              background:
                'repeating-linear-gradient(to bottom, red 0px, red 3px, transparent 3px, transparent 6px)',
            }}
          />
        )}

        {/* Zaciemnione obszary poza zakresem */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${(selectedRange[0] / totalDays) * 100}%`,
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: `${((totalDays - selectedRange[1]) / totalDays) * 100}%`,
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 2,
          }}
        />

        {/* Suwak */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            transform: 'translateY(-50%)',
            zIndex: 4,
            paddingLeft: '12px',
            paddingRight: '12px',
          }}
        >
          <Slider
            size='md'
            step={1}
            minValue={0}
            maxValue={totalDays}
            value={selectedRange}
            onChange={(value) => setSelectedRange(value as [number, number])}
            classNames={{
              track: 'bg-transparent',
              filler: 'bg-transparent',
            }}
          />
        </div>
      </div>

      {/* Legenda i podsumowanie */}
      <div style={{ marginTop: '16px' }}>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            fontSize: '12px',
            marginBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                backgroundColor: BACKGROUND_COLORS.parent1,
                border: '1px solid #ddd',
              }}
            />
            <span>Rodzic 1</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                backgroundColor: BACKGROUND_COLORS.parent2,
                border: '1px solid #ddd',
              }}
            />
            <span>Rodzic 2</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                backgroundColor: BACKGROUND_COLORS.camp,
                border: '1px solid #ddd',
              }}
            />
            <span>Kolonie</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div
              style={{
                width: '16px',
                height: '2px',
                backgroundColor: 'red',
              }}
            />
            <span>Dziś</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#f0f9ff',
              borderRadius: '6px',
            }}
          >
            📊 Rodzic 1:{' '}
            {chartData.length > 0
              ? chartData[chartData.length - 1].parent1Cumulative
              : 0}{' '}
            dni
          </div>
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#fdf2f8',
              borderRadius: '6px',
            }}
          >
            👩‍👦 Rodzic 2:{' '}
            {chartData.length > 0
              ? chartData[chartData.length - 1].parent2Cumulative
              : 0}{' '}
            dni
          </div>
        </div>
      </div>
    </div>
  );
};
