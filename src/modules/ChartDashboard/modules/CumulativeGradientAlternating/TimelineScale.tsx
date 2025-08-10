import dayjs from 'dayjs';

interface TimelineScaleProps {
  fullDateRange: { start: dayjs.Dayjs; end: dayjs.Dayjs } | null;
  totalDays: number;
}

export const TimelineScale = ({
  fullDateRange,
  totalDays,
}: TimelineScaleProps) => {
  if (!fullDateRange) return null;

  const ticks = [];
  const startYear = fullDateRange.start.year();
  const endYear = fullDateRange.end.year();

  for (let year = startYear; year <= endYear; year++) {
    const yearStart = dayjs(`${year}-01-01`);
    const yearPosition = Math.max(
      0,
      yearStart.diff(fullDateRange.start, 'days')
    );
    const yearPercentage = (yearPosition / totalDays) * 100;

    if (yearPercentage >= 0 && yearPercentage <= 100) {
      ticks.push({
        type: 'year',
        position: yearPercentage,
        label: year.toString(),
      });
    }

    for (let month = 0; month < 12; month++) {
      const monthDate = dayjs(
        `${year}-${(month + 1).toString().padStart(2, '0')}-01`
      );

      if (
        monthDate.isBefore(fullDateRange.start) ||
        monthDate.isAfter(fullDateRange.end)
      ) {
        continue;
      }

      const monthPosition = monthDate.diff(fullDateRange.start, 'days');
      const monthPercentage = (monthPosition / totalDays) * 100;

      if (monthPercentage >= 0 && monthPercentage <= 100) {
        ticks.push({
          type: 'month',
          position: monthPercentage,
          label: monthDate.format('MMM'),
        });
      }
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '-25px',
        left: 0,
        width: '100%',
        height: '25px',
        fontSize: '11px',
        color: '#666',
      }}
    >
      {ticks.map((tick, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: `${tick.position}%`,
            transform: 'translateX(-50%)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <div
            style={{
              width: '1px',
              height: tick.type === 'year' ? '15px' : '8px',
              backgroundColor: tick.type === 'year' ? '#333' : '#999',
              marginBottom: '2px',
            }}
          />
          <span
            style={{
              fontWeight: tick.type === 'year' ? 'bold' : 'normal',
              fontSize: tick.type === 'year' ? '11px' : '9px',
            }}
          >
            {tick.label}
          </span>
        </div>
      ))}
    </div>
  );
};
