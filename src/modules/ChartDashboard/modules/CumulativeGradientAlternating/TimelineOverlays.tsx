interface TimelineOverlaysProps {
  leftPosition: number;
  rightPosition: number;
  todayIndex: number;
  totalDays: number;
  isMiddleHovered: boolean;
  onMiddleMouseDown: (e: React.MouseEvent) => void;
  onMiddleMouseEnter: () => void;
  onMiddleMouseLeave: () => void;
  isDragging: 'left' | 'right' | 'middle' | null;
}

export const TimelineOverlays = ({
  leftPosition,
  rightPosition,
  todayIndex,
  totalDays,
  isMiddleHovered,
  onMiddleMouseDown,
  onMiddleMouseEnter,
  onMiddleMouseLeave,
  isDragging,
}: TimelineOverlaysProps) => {
  const selectedWidth = rightPosition - leftPosition;

  return (
    <>
      {/* Linia DZIŚ */}
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
          background:
            'linear-gradient(to left, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.7) 100%)',
          zIndex: 2,
        }}
      />

      {/* Zaciemniony obszar po prawej */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: `${100 - rightPosition}%`,
          height: '100%',
          background:
            'linear-gradient(to right, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.7) 100%)',
          zIndex: 2,
        }}
      />

      {/* Środkowa część - zaznaczony obszar */}
      <div
        onMouseDown={onMiddleMouseDown}
        onMouseEnter={onMiddleMouseEnter}
        onMouseLeave={onMiddleMouseLeave}
        style={{
          position: 'absolute',
          left: `${leftPosition}%`,
          top: 0,
          width: `${selectedWidth}%`,
          height: '100%',
          zIndex: 3,
          cursor: isDragging === 'middle' ? 'grabbing' : 'grab',
          border: isMiddleHovered
            ? '2px solid rgba(34, 150, 243, 0.8)'
            : '1px solid rgba(34, 150, 243, 0.5)',
          backgroundColor: 'rgba(34, 150, 243, 0.1)',
        }}
      />
    </>
  );
};
