import { OnDayPointerHandler } from '@components/Calendar/Calendar.context';
import { CalendarDayType } from '@modules/db/types';
import { dateFormat } from '@utils/dates';
import dayjs from 'dayjs';
import { PointerEvent, useCallback, useState } from 'react';

// interface UseSelectionProps {
//   isMultiSelectionMode?: boolean;
//   setIsMultiSelectionMode?: Dispatch<SetStateAction<boolean>>;
// }

export const useSelection = () => {
  const [isMultiSelectionMode, setIsMultiSelectionMode] =
    useState<boolean>(false);
  const [state, setState] = useState<any>(null);
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [lastClickedDay, setLastClickedDay] = useState<string | null>(null);

  // Dodaje zakres dat do zestawu
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

  // Usuwa zakres dat z zestawu
  const removeDateRange = (
    newSet: Set<string>,
    startDate: dayjs.Dayjs,
    endDate: dayjs.Dayjs
  ) => {
    let currentDate = startDate;
    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
      newSet.delete(currentDate.format(dateFormat));
      currentDate = currentDate.add(1, 'day');
    }
  };

  // Obsługuje zaznaczanie zakresu dni (dodawanie lub usuwanie)
  const handleRangeSelection = (
    newSet: Set<string>,
    dayDate: string,
    isAltPressed: boolean
  ) => {
    let startDate = dayjs(lastClickedDay);
    let endDate = dayjs(dayDate);

    if (startDate.isAfter(endDate)) {
      [startDate, endDate] = [endDate, startDate];
    }

    if (isAltPressed) {
      removeDateRange(newSet, startDate, endDate);
    } else {
      addDateRange(newSet, startDate, endDate);
    }
  };

  // Obsługuje zachowanie trybu multi-selekcji
  const handleMultiSelect = (newSet: Set<string>, dayDate: string) => {
    if (newSet.has(dayDate)) {
      newSet.delete(dayDate);
      if (newSet.size === 0) {
        setIsMultiSelectionMode?.(false);
        setLastClickedDay(null);
      }
    } else {
      newSet.add(dayDate);
    }
  };

  // Obsługuje standardowe zaznaczanie jednego dnia
  const handleSingleSelect = (newSet: Set<string>, dayDate: string) => {
    if (newSet.has(dayDate)) {
      setLastClickedDay(null);
      return new Set([]);
    }
    return new Set([dayDate]);
  };

  // Główna funkcja obsługująca zaznaczanie
  const defaultBehavior = useCallback(
    (day: CalendarDayType, event: PointerEvent<Element>) => {
      const isShiftPressed = event?.shiftKey;
      const isAltPressed = event?.altKey;
      const dayDate = day.date;

      setSelection((prev) => {
        const newSet = new Set(prev);

        if (isMultiSelectionMode) {
          if (isShiftPressed && lastClickedDay) {
            handleRangeSelection(newSet, dayDate, isAltPressed);
          } else {
            handleMultiSelect(newSet, dayDate);
          }
        } else {
          if (isShiftPressed && lastClickedDay) {
            handleRangeSelection(newSet, dayDate, isAltPressed);
          } else {
            return handleSingleSelect(newSet, dayDate);
          }
          setIsMultiSelectionMode?.(true);
        }

        setLastClickedDay(dayDate);
        return newSet;
      });
    },
    [isMultiSelectionMode, lastClickedDay]
  );

  const handleOnDayPointerUp = useCallback<OnDayPointerHandler>(
    (day, event) => {
      setLastClickedDay(day.date);
      const isShiftPressed = event?.shiftKey;

      if (isShiftPressed) {
        setIsMultiSelectionMode?.(true);
      }

      defaultBehavior(day, event);
    },
    [defaultBehavior]
  );

  const handleOnDayPointerDown = useCallback<OnDayPointerHandler>(
    (day, event) => {},
    []
  );

  const handleCancelMultiSelect = useCallback(() => {
    setIsMultiSelectionMode?.(false);
    setSelection(new Set());
  }, []);

  const onPointerHandlers = {
    onPointerUp: handleOnDayPointerUp,
    onPointerDown: handleOnDayPointerDown,
  };

  return {
    selection,
    setSelection,
    handleCancelMultiSelect,
    isMultiSelectionMode,
    setIsMultiSelectionMode,
    handlers: {
      ...onPointerHandlers,
    },
  };
};
