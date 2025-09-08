import dayjs from 'dayjs';
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

interface ChartDataPoint {
  date: string;
  parent1Cumulative: number;
  parent2Cumulative: number;
  backgroundType: string;
  backgroundColor: string;
  isBeforeToday: boolean;
}

interface CumulativeChartProps {
  chartData: ChartDataPoint[];
  showGridLines?: boolean;
  todayDate: string;
}

export const CumulativeChart = ({
  chartData,
  showGridLines = true,
  todayDate,
}: CumulativeChartProps) => {
  // Wzbogacamy punkty o „past” i „future” na potrzeby osobnych linii
  const data = chartData.map((d) => ({
    ...d,
    parent1Past: d.isBeforeToday ? d.parent1Cumulative : null,
    parent2Past: d.isBeforeToday ? d.parent2Cumulative : null,
    parent1Future: !d.isBeforeToday ? d.parent1Cumulative : null,
    parent2Future: !d.isBeforeToday ? d.parent2Cumulative : null,
  }));

  // Do osi Y nadal liczymy zakres po oryginalnych cumulative
  const maxCum = Math.max(
    ...chartData.map((d) => Math.max(d.parent1Cumulative, d.parent2Cumulative))
  );
  const minCum = Math.min(
    ...chartData.map((d) => Math.min(d.parent1Cumulative, d.parent2Cumulative))
  );

  return (
    <div
      style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%' }}
    >
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <XAxis hide />
          <YAxis hide domain={[minCum - 10, maxCum + 40]} />

          {/* Poziome linie co 100 dni kumulacji */}
          {showGridLines &&
            Array.from({ length: Math.floor(maxCum / 100) + 1 }, (_, i) => {
              const value = (i + 1) * 100;
              return (
                <ReferenceLine
                  key={value}
                  y={value}
                  stroke='#5a5a5aff'
                  strokeWidth={1}
                  strokeDasharray='2 2'
                  strokeOpacity={1}
                />
              );
            })}

          <Tooltip
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.date
                ? dayjs(payload[0].payload.date).format('DD.MM.YYYY')
                : ''
            }
            formatter={(value, name) => {
              const map: Record<string, string> = {
                parent1Past: 'Rodzic 1',
                parent1Future: 'Rodzic 1 (po dziś)',
                parent2Past: 'Rodzic 2',
                parent2Future: 'Rodzic 2 (po dziś)',
              };
              return [`${value} dni`, map[name as string] ?? name];
            }}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          />

          {/* Rodzic 1: przeszłość = linia ciągła, przyszłość = przerywana */}
          <Line
            type='monotone'
            dataKey='parent1Past'
            stroke={CHART_COLORS.parent1}
            strokeWidth={3}
            dot={chartData.length < 50}
            name='parent1Past'
            isAnimationActive={false}
            connectNulls={false}
          />
          <Line
            type='monotone'
            dataKey='parent1Future'
            stroke={CHART_COLORS.parent1}
            strokeWidth={1}
            strokeDasharray='5 3'
            dot={false}
            name='parent1Future'
            isAnimationActive={false}
            connectNulls={false}
          />

          {/* Rodzic 2: przeszłość = linia ciągła, przyszłość = przerywana */}
          <Line
            type='monotone'
            dataKey='parent2Past'
            stroke={CHART_COLORS.parent2}
            strokeWidth={3}
            dot={chartData.length < 50}
            name='parent2Past'
            isAnimationActive={false}
            connectNulls={false}
          />
          <Line
            type='monotone'
            dataKey='parent2Future'
            stroke={CHART_COLORS.parent2}
            strokeWidth={1}
            strokeDasharray='5 3'
            dot={false}
            name='parent2Future'
            isAnimationActive={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
