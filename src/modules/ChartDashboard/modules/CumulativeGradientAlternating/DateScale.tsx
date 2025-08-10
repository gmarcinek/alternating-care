import dayjs from 'dayjs';

interface ChartDataPoint {
  date: string;
  parent1Cumulative: number;
  parent2Cumulative: number;
  backgroundType: string;
  backgroundColor: string;
  isBeforeToday: boolean;
}

interface DateScaleProps {
  chartData: ChartDataPoint[];
  position: 'top' | 'bottom';
  fullDateRange?: { start: dayjs.Dayjs; end: dayjs.Dayjs };
}

export const DateScale = ({
  chartData,
  position,
  fullDateRange,
}: DateScaleProps) => {
  if (position === 'bottom' && fullDateRange) {
    return (
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
    );
  }

  // Top scale
  return (
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
  );
};
