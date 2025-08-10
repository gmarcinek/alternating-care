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
  return (
    <div
      style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%' }}
    >
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <XAxis hide />
          <YAxis hide />

          {/* Poziome linie co 100 dni kumulacji */}
          {showGridLines &&
            Array.from(
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
                    stroke='#5a5a5aff'
                    strokeWidth={1}
                    strokeDasharray='2 2'
                    strokeOpacity={1}
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
  );
};
