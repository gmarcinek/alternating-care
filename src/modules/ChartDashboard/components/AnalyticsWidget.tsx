'use client';

// ---- KONFIGURACJA WIDGETU ----
const WIDGET_CONFIG = {
  heatmapColors: {
    alternating: '#2196F3', // niebieska
    trip: '#FF9800', // pomarańczowa
    combined: '#9C27B0', // fioletowa (gdy oba)
    empty: '#ffffffff', // szara (brak eventów)
  },
  pieColors: [
    '#2196F3', // ALTERNATING - niebieska
    '#FFEB3B', // CAMP - żółta
    '#4CAF50', // EVENT - zielona
    '#FF9800', // TRIP - pomarańczowa
    '#E91E63', // BIRTHDAY - różowa
    '#F44336', // MEDICAL - czerwona
    '#9C27B0', // SCHOOL - fioletowa
    '#795548', // SHOPPING - brązowa
  ],
  seasonalColors: {
    spring: '#4CAF50',
    summer: '#FFEB3B',
    autumn: '#FF9800',
    winter: '#2196F3',
  },
};

import { CalendarEvent, CalendarEventType } from '@api/db/types';
import { Stack } from '@components/Stack/Stack';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface AnalyticsWidgetProps {
  events: CalendarEvent[];
}

export const AnalyticsWidget = (props: AnalyticsWidgetProps) => {
  const { events } = props;

  // Przygotowanie danych dla wszystkich wykresów
  const analyticsData = useMemo(() => {
    if (events.length === 0) return null;

    // 1. Heatmap data - opieka + wyjazdy po dniach roku
    const currentYear = dayjs().year();
    const yearStart = dayjs(`${currentYear}-01-01`);
    const yearEnd = dayjs(`${currentYear}-12-31`);

    const alternatingDates = new Set(
      events
        .filter(
          (e) =>
            e.type === CalendarEventType.Alternating &&
            dayjs(e.date).year() === currentYear
        )
        .map((e) => e.date)
    );

    const tripDates = new Set(
      events
        .filter(
          (e) =>
            e.type === CalendarEventType.Trip &&
            dayjs(e.date).year() === currentYear
        )
        .map((e) => e.date)
    );

    const heatmapData = [];
    let currentDate = yearStart.clone();

    while (currentDate.isBefore(yearEnd) || currentDate.isSame(yearEnd)) {
      const dateStr = currentDate.format('YYYY-MM-DD');
      const hasAlternating = alternatingDates.has(dateStr);
      const hasTrip = tripDates.has(dateStr);

      let intensity = 0;
      let color = WIDGET_CONFIG.heatmapColors.empty;

      if (hasAlternating && hasTrip) {
        intensity = 3;
        color = WIDGET_CONFIG.heatmapColors.combined;
      } else if (hasAlternating) {
        intensity = 2;
        color = WIDGET_CONFIG.heatmapColors.alternating;
      } else if (hasTrip) {
        intensity = 1;
        color = WIDGET_CONFIG.heatmapColors.trip;
      }

      const dayOfYear = currentDate.diff(yearStart, 'day') + 1;

      heatmapData.push({
        date: dateStr,
        dayOfYear,
        month: currentDate.month(),
        week: Math.floor(dayOfYear / 7),
        weekDay: currentDate.day(),
        intensity,
        color,
        hasAlternating,
        hasTrip,
      });

      currentDate = currentDate.add(1, 'day');
    }

    // 2. Pie chart data - wszystkie typy eventów
    const eventTypeCounts = events.reduce(
      (acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      },
      {} as Record<CalendarEventType, number>
    );

    const pieData = Object.entries(eventTypeCounts).map(
      ([type, count], index) => ({
        name: type,
        value: count,
        color: WIDGET_CONFIG.pieColors[index % WIDGET_CONFIG.pieColors.length],
      })
    );

    // 3. Seasonal data - rozkład miesięczny
    const monthlyData = Array.from({ length: 12 }, (_, month) => {
      const monthEvents = events.filter((e) => dayjs(e.date).month() === month);
      const typeCounts = monthEvents.reduce(
        (acc, event) => {
          acc[event.type] = (acc[event.type] || 0) + 1;
          return acc;
        },
        {} as Record<CalendarEventType, number>
      );

      return {
        month: dayjs().month(month).format('MMM'),
        monthIndex: month,
        total: monthEvents.length,
        ...typeCounts,
      };
    });

    return {
      heatmapData,
      pieData,
      monthlyData,
    };
  }, [events]);

  if (!analyticsData) {
    return (
      <Stack contentAlignment='center' style={{ minHeight: '400px' }}>
        <p>Brak danych do analizy</p>
      </Stack>
    );
  }

  const { heatmapData, pieData, monthlyData } = analyticsData;

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
      {/* 1. Calendar Heatmap */}
      <div className='col-span-1 md:col-span-1 xl:col-span-1'>
        <Stack gap={8}>
          <div>
            <h3>Mapa Opieki i Wyjazdów</h3>
            <small style={{ color: '#666' }}>
              Kalendarz {dayjs().year()} - intensywność eventów
            </small>
          </div>

          <div style={{ height: '300px', overflowX: 'auto' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(53, 1fr)', // 53 tygodnie
                gridTemplateRows: 'repeat(7, 1fr)', // 7 dni tygodnia
                gap: '2px',
                minWidth: '600px',
                height: '280px',
              }}
            >
              {heatmapData.map((day, index) => (
                <div
                  key={day.date}
                  style={{
                    backgroundColor: day.color,
                    gridColumn: Math.floor(day.dayOfYear / 7) + 1,
                    gridRow: day.weekDay + 1,
                    borderRadius: '1px',
                    border: '1px solid #ccc',
                  }}
                  title={`${day.date}: ${day.hasAlternating ? 'Opieka ' : ''}${day.hasTrip ? 'Wyjazd' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Legenda heatmapy */}
          <Stack direction='horizontal' gap={8}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: WIDGET_CONFIG.heatmapColors.alternating,
                  borderRadius: '2px',
                }}
              />
              <small>Opieka</small>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: WIDGET_CONFIG.heatmapColors.trip,
                  borderRadius: '2px',
                }}
              />
              <small>Wyjazd</small>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: WIDGET_CONFIG.heatmapColors.combined,
                  borderRadius: '2px',
                }}
              />
              <small>Oba</small>
            </div>
          </Stack>
        </Stack>
      </div>

      {/* 2. Pie Chart */}
      <div className='col-span-1 md:col-span-1 xl:col-span-1'>
        <Stack gap={8}>
          <div>
            <h3>Rozkład Typów Wydarzeń</h3>
            <small style={{ color: '#666' }}>
              Proporcje wszystkich eventów
            </small>
          </div>

          <div style={{ height: '300px' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx='50%'
                  cy='50%'
                  outerRadius={80}
                  dataKey='value'
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Stack>
      </div>

      {/* 3. Seasonal Analysis */}
      <div className='col-span-1 md:col-span-2 xl:col-span-1'>
        <Stack gap={8}>
          <div>
            <h3>Analiza Sezonowa</h3>
            <small style={{ color: '#666' }}>
              Rozkład eventów przez miesiące
            </small>
          </div>

          <div style={{ height: '300px' }}>
            <ResponsiveContainer>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='month' />
                <YAxis />
                <Tooltip />
                <Bar dataKey='total' fill='#8884d8' name='Wszystkie eventy' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Stack>
      </div>
    </div>
  );
};
