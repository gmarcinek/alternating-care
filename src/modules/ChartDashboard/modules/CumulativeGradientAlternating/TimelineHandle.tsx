import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';

interface TimelineHandleProps {
  position: number;
  onMouseDown: (e: React.MouseEvent) => void;
  type: 'left' | 'right';
  currentDate: dayjs.Dayjs;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const TimelineHandle = ({
  position,
  onMouseDown,
  type,
  currentDate,
  containerRef,
}: TimelineHandleProps) => {
  const dateLabel = currentDate.format('DD.MM.YY');
  const labelRef = useRef<HTMLDivElement>(null);
  const [labelLeft, setLabelLeft] = useState(position);

  // Lewa na dole, prawa na górze (wyżej niż podziałka)
  const isTop = type === 'right';
  const labelTop = isTop ? '-35px' : '45px';

  useEffect(() => {
    if (!labelRef.current || !containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const label = labelRef.current.getBoundingClientRect();

    // Oblicz pozycję w pikselach
    const positionPx = (position / 100) * container.width;
    const labelWidthHalf = label.width / 2;

    // Sprawdź czy label wychodzi poza lewy brzeg
    if (positionPx - labelWidthHalf < 0) {
      setLabelLeft((labelWidthHalf / container.width) * 100);
      return;
    }

    // Sprawdź czy label wychodzi poza prawy brzeg
    if (positionPx + labelWidthHalf > container.width) {
      setLabelLeft(
        ((container.width - labelWidthHalf) / container.width) * 100
      );
      return;
    }

    // Jeśli mieści się - ustaw normalną pozycję
    setLabelLeft(position);
  }, [position, containerRef]);

  return (
    <>
      {/* Uchwyt */}
      <div
        onMouseDown={onMouseDown}
        style={{
          position: 'absolute',
          left: `${position}%`,
          top: 0,
          width: '10px',
          height: '100%',
          backgroundColor: '#2196F3',
          cursor: 'ew-resize',
          zIndex: 4,
          transform: 'translateX(-5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '2px',
            height: '60%',
            backgroundColor: 'white',
            borderRadius: '1px',
          }}
        />
      </div>

      {/* Label z datą */}
      <div
        ref={labelRef}
        style={{
          position: 'absolute',
          left: `${labelLeft}%`,
          top: labelTop,
          transform: 'translateX(-50%)',
          backgroundColor: '#2196F3',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: 'bold',
          zIndex: 5,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        {dateLabel}
      </div>
    </>
  );
};
