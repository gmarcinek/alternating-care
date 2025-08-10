interface ChartDataPoint {
  date: string;
  parent1Cumulative: number;
  parent2Cumulative: number;
  backgroundType: string;
  backgroundColor: string;
  isBeforeToday: boolean;
}

interface GradientBackgroundProps {
  chartData: ChartDataPoint[];
  className?: string;
}

export const GradientBackground = ({
  chartData,
  className,
}: GradientBackgroundProps) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        opacity: 0.6,
        zIndex: 1,
      }}
      className={className}
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
              opacity: day.isBeforeToday ? 1 : 0.2,
            }}
            title={`${day.date} - ${day.backgroundType === 'camp' ? 'Kolonie' : day.backgroundType === 'parent1' ? 'Rodzic 1' : 'Rodzic 2'}`}
          />
        );
      })}
    </div>
  );
};
