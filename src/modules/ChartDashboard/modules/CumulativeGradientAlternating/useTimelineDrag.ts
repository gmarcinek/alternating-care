import { useCallback, useEffect, useRef, useState } from 'react';

interface UseTimelineDragProps {
  totalDays: number;
  selectedRange: [number, number];
  onRangeChange: (range: [number, number]) => void;
}

export const useTimelineDrag = ({
  totalDays,
  selectedRange,
  onRangeChange,
}: UseTimelineDragProps) => {
  const [isDragging, setIsDragging] = useState<
    'left' | 'right' | 'middle' | null
  >(null);
  const [dragStartPosition, setDragStartPosition] = useState(0);
  const [dragStartRange, setDragStartRange] = useState<[number, number]>([
    0, 0,
  ]);
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
    (handle: 'left' | 'right' | 'middle') => (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(handle);

      if (handle === 'middle') {
        setDragStartPosition(getPositionFromEvent(e));
        setDragStartRange([...selectedRange]);
      }
    },
    [selectedRange, getPositionFromEvent]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const newPosition = getPositionFromEvent(e);
      const [left, right] = selectedRange;

      if (isDragging === 'left') {
        onRangeChange([Math.min(newPosition, right - 1), right]);
      } else if (isDragging === 'right') {
        onRangeChange([left, Math.max(newPosition, left + 1)]);
      } else if (isDragging === 'middle') {
        const deltaPosition = newPosition - dragStartPosition;
        const rangeSize = dragStartRange[1] - dragStartRange[0];

        let newLeft = dragStartRange[0] + deltaPosition;
        let newRight = dragStartRange[1] + deltaPosition;

        if (newLeft < 0) {
          newLeft = 0;
          newRight = rangeSize;
        }
        if (newRight > totalDays) {
          newRight = totalDays;
          newLeft = totalDays - rangeSize;
        }

        onRangeChange([newLeft, newRight]);
      }
    },
    [
      isDragging,
      selectedRange,
      onRangeChange,
      getPositionFromEvent,
      dragStartPosition,
      dragStartRange,
      totalDays,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

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

  return {
    isDragging,
    containerRef,
    handleMouseDown,
  };
};
