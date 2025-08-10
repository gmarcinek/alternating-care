import dayjs from 'dayjs';
import { useState } from 'react';
import { TimelineBackground } from './TimelineBackground';
import { TimelineHandle } from './TimelineHandle';
import { TimelineOverlays } from './TimelineOverlays';
import { TimelineScale } from './TimelineScale';
import { useTimelineDrag } from './useTimelineDrag';

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
  fullDateRange: { start: dayjs.Dayjs; end: dayjs.Dayjs } | null;
}

export const TimelineSlider = ({
  fullTimelineData,
  selectedRange,
  onRangeChange,
  totalDays,
  todayIndex,
  fullDateRange,
}: TimelineSliderProps) => {
  const [isMiddleHovered, setIsMiddleHovered] = useState(false);

  const { isDragging, containerRef, handleMouseDown } = useTimelineDrag({
    totalDays,
    selectedRange,
    onRangeChange,
  });

  const leftPosition = (selectedRange[0] / totalDays) * 100;
  const rightPosition = (selectedRange[1] / totalDays) * 100;

  // Oblicz aktualne daty dla uchwytów
  const leftDate =
    fullDateRange?.start.add(selectedRange[0], 'days') || dayjs();
  const rightDate =
    fullDateRange?.start.add(selectedRange[1], 'days') || dayjs();

  return (
    <div
      style={{
        position: 'relative',
        marginTop: fullDateRange ? '50px' : '20px', // więcej miejsca na górną etykietę
        marginBottom: '25px', // miejsce na dolną etykietę
      }}
    >
      {fullDateRange && (
        <TimelineScale fullDateRange={fullDateRange} totalDays={totalDays} />
      )}

      <div
        ref={containerRef}
        style={{
          position: 'relative',
          border: '1px solid #ccc',
          height: '40px',
          borderTop: 'none',
          borderBottom: 'none',
          cursor: 'crosshair',
        }}
      >
        <TimelineBackground fullTimelineData={fullTimelineData} />

        <TimelineOverlays
          leftPosition={leftPosition}
          rightPosition={rightPosition}
          todayIndex={todayIndex}
          totalDays={totalDays}
          isMiddleHovered={isMiddleHovered}
          onMiddleMouseDown={handleMouseDown('middle')}
          onMiddleMouseEnter={() => setIsMiddleHovered(true)}
          onMiddleMouseLeave={() => setIsMiddleHovered(false)}
          isDragging={isDragging}
        />

        <TimelineHandle
          position={leftPosition}
          onMouseDown={handleMouseDown('left')}
          type='left'
          currentDate={leftDate}
          containerRef={containerRef}
        />

        <TimelineHandle
          position={rightPosition}
          onMouseDown={handleMouseDown('right')}
          type='right'
          currentDate={rightDate}
          containerRef={containerRef}
        />
      </div>
    </div>
  );
};
