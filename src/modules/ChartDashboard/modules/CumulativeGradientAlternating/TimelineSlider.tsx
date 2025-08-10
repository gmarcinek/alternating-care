import { Slider } from '@nextui-org/react';

interface TimelineDataPoint {
  date: string;
  dayIndex: number;
  backgroundType: string;
  backgroundColor: string;
  isBeforeToday: boolean;
}

interface TimelineSliderProps {
  fullTimelineData: TimelineDataPoint[];
  selectedRange: [number, number];
  onRangeChange: (range: [number, number]) => void;
  totalDays: number;
  todayIndex: number;
}

export const TimelineSlider = ({
  fullTimelineData,
  selectedRange,
  onRangeChange,
  totalDays,
  todayIndex,
}: TimelineSliderProps) => {
  return (
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
              title={`${day.date} - ${day.backgroundType === 'camp' ? 'Kolonie' : day.backgroundType === 'parent1' ? 'Rodzic 1' : 'Rodzic 2'}`}
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
          onChange={(value) => onRangeChange(value as [number, number])}
          classNames={{
            track: 'bg-transparent',
            filler: 'bg-transparent',
          }}
        />
      </div>
    </div>
  );
};
