'use client';

import { CalendarEvent, CalendarEventType } from '@api/db/types';
import { Stack } from '@components/Stack/Stack';
import { Button, Spinner } from '@nextui-org/react';
import * as d3 from 'd3';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

dayjs.extend(dayOfYear);

// ============================================
// PARAMETRY DO EKSPERYMENTOWANIA
// ============================================
const CHART_CONFIG = {
  // Średnia krocząca
  movingAverageWindow: 6, // ±14 dni = 29-dniowe okno (był 7)

  // Skale i wymiary
  marginSize: 40, // margines wokół wykresu
  scaleMultiplier: 1, // mnożnik dla max skali (1.1 = 110% max odchylenia)
  baselineMultiplier: -1, // dolna granica skali (środek koła)

  // Wizualizacja
  strokeWidth: 4, // grubość linii
  strokeOpacity: 0.85, // przezroczystość linii
  pointRadius: 5, // promień invisible punktów do tooltip
  centerDotRadius: 3, // promień środkowego punktu

  // Grid i etykiety
  monthLabelRadius: 20, // odległość etykiet miesięcy od obręczy
  monthLineStartRadius: 35, // początek linii miesięcy
  gridLineWidth: 4, // grubość linii bazowej (zero)
  gridDashPattern: '6 4', // pattern dla linii -1

  // Curve smoothing (D3)
  curveType: 'curveCardinal' as const, // typ krzywej D3: curveCardinal, curveNatural, curveLinear
};
// ============================================

interface RadialTripChartProps {
  events: CalendarEvent[];
  isPending?: boolean;
  refetch?: () => void;
}

interface ProcessedData {
  yearlyProfiles: Record<number, number[]>;
  years: number[];
  scaleMax: number;
  baseFractions: Record<number, number>;
}

// Wygładzanie średnią kroczącą - pure function
const movingAverage = (arr: number[], window: number): number[] => {
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
};

export const RadialTripChart = ({
  events,
  isPending,
  refetch,
}: RadialTripChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    day: number;
    year: number;
    value: number;
    isTravel: boolean;
    baseline: number;
  } | null>(null);

  // Filtrowane eventy trip - primitive value dla dependency
  const tripEvents = useMemo(
    () => events.filter((e) => e.type === CalendarEventType.Trip),
    [events]
  );

  // Główne przetwarzanie danych - tylko gdy się zmienią trip events
  const processedData = useMemo<ProcessedData>(() => {
    if (tripEvents.length === 0) {
      return {
        yearlyProfiles: {},
        years: [],
        scaleMax: 0.1,
        baseFractions: {},
      };
    }

    // Mapa: dzień roku -> rok -> liczba podróży
    const dayYearCounts = new Map<number, Map<number, number>>();
    const yearsSet = new Set<number>();

    tripEvents.forEach((event) => {
      const date = dayjs(event.date);
      const day = date.dayOfYear();
      const year = date.year();

      yearsSet.add(year);

      if (!dayYearCounts.has(day)) {
        dayYearCounts.set(day, new Map());
      }

      const yearMap = dayYearCounts.get(day)!;
      yearMap.set(year, (yearMap.get(year) || 0) + 1);
    });

    const years = Array.from(yearsSet).sort();
    const baseFractions: Record<number, number> = {};
    const yearlyProfiles: Record<number, number[]> = {};

    years.forEach((year) => {
      // Binarne dane: 1 = podróż tego dnia, 0 = brak
      const dailyBinary = new Array(365);
      for (let day = 1; day <= 365; day++) {
        const yearMap = dayYearCounts.get(day);
        dailyBinary[day - 1] = (yearMap?.get(year) || 0) > 0 ? 1 : 0;
      }

      // Średnia roczna - baseline
      baseFractions[year] =
        dailyBinary.reduce((sum, val) => sum + val, 0) / 365;

      // Wygładzenie + odchylenie od baseline
      const smoothed = movingAverage(
        dailyBinary,
        CHART_CONFIG.movingAverageWindow
      );
      yearlyProfiles[year] = smoothed.map((val) => val - baseFractions[year]);
    });

    // Globalna skala
    const maxDeviation = Math.max(
      ...Object.values(yearlyProfiles).flat().map(Math.abs),
      0.1
    );

    return {
      yearlyProfiles,
      years,
      scaleMax: CHART_CONFIG.scaleMultiplier * maxDeviation,
      baseFractions,
    };
  }, [tripEvents]);

  // Callback do obsługi resize
  const updateDimensions = useCallback(() => {
    if (!svgRef.current) return;

    const { clientWidth, clientHeight } = svgRef.current;
    if (clientWidth > 0 && clientHeight > 0) {
      setDimensions({ width: clientWidth, height: clientHeight });
    }
  }, []);

  // ResizeObserver dla responsywności
  useEffect(() => {
    if (!svgRef.current) return;

    const observer = new ResizeObserver(updateDimensions);
    observer.observe(svgRef.current);

    // Initial measurement z delaym na wypadek CSS
    setTimeout(updateDimensions, 100);

    return () => observer.disconnect();
  }, [updateDimensions]);

  // Force re-render gdy się zmienią events (ale nie pending)
  useEffect(() => {
    if (!isPending && tripEvents.length > 0) {
      // Opóźnij odrobinę żeby ResizeObserver zdążył
      setTimeout(updateDimensions, 50);
    }
  }, [tripEvents.length, isPending, updateDimensions]);

  // Renderowanie D3 - tylko gdy zmienią się wymiary lub dane
  useEffect(() => {
    if (
      !svgRef.current ||
      dimensions.width === 0 ||
      processedData.years.length === 0
    ) {
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const { yearlyProfiles, years, scaleMax, baseFractions } = processedData;

    const size = Math.min(width, height);
    const margin = CHART_CONFIG.marginSize;
    const radius = (size - margin * 2) / 2;
    const centerX = width / 2;
    const centerY = height / 2;

    // Skale D3
    const angleScale = d3
      .scaleLinear()
      .domain([1, 365])
      .range([0, 2 * Math.PI]);

    const radiusScale = d3
      .scaleLinear()
      .domain([CHART_CONFIG.baselineMultiplier, scaleMax])
      .range([0, radius]);

    const g = svg
      .append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    // Grid lines
    const gridValues = [
      CHART_CONFIG.baselineMultiplier,
      0,
      scaleMax / 2,
      scaleMax,
    ];
    gridValues.forEach((val) => {
      g.append('circle')
        .attr('r', radiusScale(val))
        .attr('fill', 'none')
        .attr('stroke', val === 0 ? '#b33' : '#e0e0e0')
        .attr('stroke-width', val === 0 ? CHART_CONFIG.gridLineWidth : 1)
        .attr(
          'stroke-dasharray',
          val === CHART_CONFIG.baselineMultiplier
            ? CHART_CONFIG.gridDashPattern
            : 'none'
        );

      if (val !== CHART_CONFIG.baselineMultiplier) {
        g.append('text')
          .attr('x', 6)
          .attr('y', -radiusScale(val))
          .attr('font-size', 10)
          .attr('fill', val === 0 ? '#b33' : '#666')
          .attr('font-weight', val === 0 ? 'bold' : 'normal')
          .text(val === 0 ? 'średnia' : `+${(val * 100).toFixed(0)}%`);
      }
    });

    // Etykiety miesięcy
    for (let month = 1; month <= 12; month++) {
      const dayStart = dayjs(
        `2023-${String(month).padStart(2, '0')}-01`
      ).dayOfYear();
      const angle = angleScale(dayStart) - Math.PI / 2;
      const labelRadius = radius + CHART_CONFIG.monthLabelRadius;
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

      // Linia miesiąca
      g.append('line')
        .attr('x1', Math.cos(angle) * CHART_CONFIG.monthLineStartRadius)
        .attr('y1', Math.sin(angle) * CHART_CONFIG.monthLineStartRadius)
        .attr('x2', Math.cos(angle) * radius)
        .attr('y2', Math.sin(angle) * radius)
        .attr('stroke', '#ddd')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '2 6');
    }

    // Linie dla każdego roku
    years.forEach((year, idx) => {
      const profile = yearlyProfiles[year];
      const color = d3.schemeCategory10[idx % 10];

      // Linia radialna
      const lineGen = d3
        .lineRadial<number>()
        .angle((_, i) => angleScale(i + 1))
        .radius((d) => radiusScale(d))
        .curve(d3[CHART_CONFIG.curveType]);

      g.append('path')
        .datum(profile)
        .attr('d', lineGen)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', CHART_CONFIG.strokeWidth)
        .attr('opacity', CHART_CONFIG.strokeOpacity);

      // Invisible punkty do tooltipów
      g.selectAll(`.point-${year}`)
        .data(
          profile.map((val, i) => ({
            value: val,
            day: i + 1,
            base: baseFractions[year],
            isTravel: val + baseFractions[year] > baseFractions[year],
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
        .attr('r', CHART_CONFIG.pointRadius)
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

    // Środek
    g.append('circle')
      .attr('r', CHART_CONFIG.centerDotRadius)
      .attr('fill', '#666');
  }, [dimensions.width, dimensions.height, processedData, tripEvents.length]);

  // Jeśli loading
  if (isPending) {
    return (
      <Stack contentAlignment='center' style={{ minHeight: '500px' }}>
        <Spinner size='lg' />
        <p>Ładowanie danych podróży...</p>
      </Stack>
    );
  }

  // Jeśli brak danych
  if (tripEvents.length === 0) {
    return (
      <Stack contentAlignment='center' gap={16} style={{ minHeight: '500px' }}>
        <p>Brak eventów TRIP do wizualizacji</p>
        {refetch && (
          <Button onClick={refetch} color='primary' variant='ghost'>
            🔄 Odśwież dane
          </Button>
        )}
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

        {refetch && (
          <Button onClick={refetch} size='sm' variant='light'>
            🔄 Refresh
          </Button>
        )}
      </Stack>

      <div
        style={{
          width: '100%',
          height: '600px',
          position: 'relative',
        }}
      >
        <svg
          ref={svgRef}
          width='100%'
          height='100%'
          style={{ border: '1px solid #ddd', borderRadius: '8px' }}
        />

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
            Odchylenie: {(tooltip.value * 100).toFixed(1)}%
            <br />
            Baseline: {(tooltip.baseline * 100).toFixed(1)}%
            <br />
            {tooltip.isTravel ? '🧳 Dzień podróży' : '🏠 Dzień w domu'}
          </div>
        )}
      </div>
    </Stack>
  );
};
