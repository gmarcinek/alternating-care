import { OnDayPointerHandler } from '@components/Calendar/Calendar.context';
import { CalendarDayType } from '@modules/db/types';
import { dateFormat } from '@utils/dates';
import dayjs from 'dayjs';
import {
  Dispatch,
  PointerEvent,
  SetStateAction,
  useCallback,
  useState,
} from 'react';

interface UseSelectionProps {
  isMultiSelectionMode: boolean;
  setIsMultiSelectionMode: Dispatch<SetStateAction<boolean>>;
}

export const useSelection2 = (props: UseSelectionProps) => {
  const { isMultiSelectionMode, setIsMultiSelectionMode } = props;
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [lastClickedDay, setLastClickedDay] = useState<string | null>(null);
  const [startTouchDay, setStartTouchDay] = useState<string | null>(null);

  const addDateRange = (
    newSet: Set<string>,
    startDate: dayjs.Dayjs,
    endDate: dayjs.Dayjs
  ) => {
    let currentDate = startDate;
    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
      newSet.add(currentDate.format(dateFormat));
      currentDate = currentDate.add(1, 'day');
    }
  };

  const defaultBehavior = useCallback(
    (day: CalendarDayType, event?: PointerEvent<Element>) => {
      const isShiftPressed = event?.shiftKey;
      const dayDate = day.date;

      setSelection((prev) => {
        const newSet = new Set(prev);

        if (isMultiSelectionMode) {
          if (isShiftPressed && lastClickedDay) {
            let startDate = dayjs(lastClickedDay);
            let endDate = dayjs(dayDate);

            if (startDate.isAfter(endDate)) {
              [startDate, endDate] = [endDate, startDate];
            }

            addDateRange(newSet, startDate, endDate);
          } else {
            if (newSet.has(dayDate)) {
              newSet.delete(dayDate);
              if (newSet.size === 0) {
                setIsMultiSelectionMode(false);
                setLastClickedDay(null);
              }
            } else {
              newSet.add(dayDate);
            }
          }
        } else {
          if (isShiftPressed && lastClickedDay) {
            let startDate = dayjs(lastClickedDay);
            let endDate = dayjs(dayDate);

            if (startDate.isAfter(endDate)) {
              [startDate, endDate] = [endDate, startDate];
            }

            addDateRange(newSet, startDate, endDate);
          } else {
            if (newSet.has(dayDate)) {
              setLastClickedDay(null);
              return new Set([]);
            }
            return new Set([dayDate]);
          }
          setIsMultiSelectionMode(true);
        }
        setLastClickedDay(dayDate);

        return newSet;
      });
    },
    [selection, isMultiSelectionMode, setIsMultiSelectionMode, lastClickedDay]
  );

  // Obsługa przeciągania na urządzeniach mobilnych
  const handleTouchStart = useCallback<OnDayPointerHandler>(
    (day, event) => {
      setStartTouchDay(day.date);
      setLastClickedDay(day.date);
      defaultBehavior(day);
    },
    [defaultBehavior]
  );

  const handleTouchMove = useCallback<OnDayPointerHandler>(
    (day, event) => {
      if (startTouchDay) {
        let startDate = dayjs(startTouchDay);
        let endDate = dayjs(day.date);

        if (startDate.isAfter(endDate)) {
          [startDate, endDate] = [endDate, startDate];
        }

        setSelection((prev) => {
          const newSet = new Set(prev);
          addDateRange(newSet, startDate, endDate);
          return newSet;
        });
      }
    },
    [startTouchDay]
  );

  const handleTouchEnd = useCallback(() => {
    setStartTouchDay(null);
  }, []);

  const handleOnDayPointerDown = useCallback<OnDayPointerHandler>(
    (day, event) => {
      const isShiftPressed = event?.shiftKey;
      setLastClickedDay(day.date);

      if (isShiftPressed) {
        setIsMultiSelectionMode(true);
        defaultBehavior(day, event);
        return;
      }

      defaultBehavior(day, event);
    },
    [isMultiSelectionMode, setIsMultiSelectionMode, defaultBehavior]
  );

  const handleCancelMultiSelect = useCallback(() => {
    setIsMultiSelectionMode(false);
    setSelection(new Set());
  }, [setIsMultiSelectionMode]);

  return {
    selection,
    setSelection,
    handleCancelMultiSelect,
    handleOnDayPointerDown,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};
