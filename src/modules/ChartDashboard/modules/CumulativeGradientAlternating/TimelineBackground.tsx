interface TimelineDataPoint {
  date: string;
  dayIndex: number;
  backgroundType: string;
  backgroundColor: string;
  isBeforeToday: boolean;
}

interface TimelineBackgroundProps {
  fullTimelineData: TimelineDataPoint[];
}

export const TimelineBackground = ({
  fullTimelineData,
}: TimelineBackgroundProps) => {
  return (
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
            title={`${day.date} - ${day.backgroundType === 'camp' ? 'Kolonie' : day.backgroundType === 'parent1' ? 'Rodzic 1' : 'Rodzic 2'}`}
          />
        );
      })}
    </div>
  );
};
