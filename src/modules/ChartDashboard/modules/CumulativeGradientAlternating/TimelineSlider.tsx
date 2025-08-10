import { Stack } from '@components/Stack/Stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './CumulativeGradientAlternating.module.scss';

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
  const [isDragging, setIsDragging] = useState<'left' | 'right' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getPositionFromEvent = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (!containerRef.current) return 0;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      return Math.round(percentage * totalDays);
    },
    [totalDays]
  );

  const handleMouseDown = useCallback(
    (handle: 'left' | 'right') => (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(handle);
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const newPosition = getPositionFromEvent(e);
      const [left, right] = selectedRange;

      if (isDragging === 'left') {
        onRangeChange([Math.min(newPosition, right - 1), right]);
      } else {
        onRangeChange([left, Math.max(newPosition, left + 1)]);
      }
    },
    [isDragging, selectedRange, onRangeChange, getPositionFromEvent]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  // Global mouse events
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const leftPosition = (selectedRange[0] / totalDays) * 100;
  const rightPosition = (selectedRange[1] / totalDays) * 100;
  const selectedWidth = rightPosition - leftPosition;

  return (
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

      {/* Zaciemniony obszar po lewej */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${leftPosition}%`,
          height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          zIndex: 2,
        }}
        className={styles.selected}
      />

      {/* Zaciemniony obszar po prawej */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: `${100 - rightPosition}%`,
          height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          zIndex: 2,
        }}
        className={styles.selected}
      />

      {/* Lewy kontroler 3D */}
      <div
        onMouseDown={handleMouseDown('left')}
        style={{
          position: 'absolute',
          left: `${leftPosition}%`,
          top: 0,
          transform: 'translateX(-50%)',
          width: '16px',
          height: '100%',
          zIndex: 4,
          cursor: 'ew-resize',
          background:
            'linear-gradient(135deg, #f0f0f0 0%, #d0d0d0 50%, #b0b0b0 100%)',
          border: '1px solid #999',
          borderRadius: '2px',
          boxShadow: `
            inset 1px 1px 2px rgba(255,255,255,0.8),
            inset -1px -1px 2px rgba(0,0,0,0.3),
            2px 2px 4px rgba(0,0,0,0.2)
          `,
        }}
      >
        <Stack
          direction='horizontal'
          contentAlignment='center'
          itemsAlignment='center'
          style={{
            height: '100%',
            margin: 0,
            padding: 0,
            color: '#7a7979ff',
            fontSize: 'smaller',
          }}
        >
          <div>||</div>
        </Stack>
      </div>

      {/* Prawy kontroler 3D */}
      <div
        onMouseDown={handleMouseDown('right')}
        style={{
          position: 'absolute',
          left: `${rightPosition}%`,
          top: 0,
          transform: 'translateX(-50%)',
          width: '16px',
          height: '100%',
          zIndex: 4,
          cursor: 'ew-resize',
          background:
            'linear-gradient(135deg, #f0f0f0 0%, #d0d0d0 50%, #b0b0b0 100%)',
          border: '1px solid #999',
          borderRadius: '2px',
          boxShadow: `
            inset 1px 1px 2px rgba(255,255,255,0.8),
            inset -1px -1px 2px rgba(0,0,0,0.3),
            2px 2px 4px rgba(0,0,0,0.2)
          `,
        }}
      >
        <Stack
          direction='horizontal'
          contentAlignment='center'
          itemsAlignment='center'
          style={{
            height: '100%',
            margin: 0,
            padding: 0,
            color: '#7a7979ff',
            fontSize: 'smaller',
          }}
        >
          <div>||</div>
        </Stack>
      </div>
    </div>
  );
};
