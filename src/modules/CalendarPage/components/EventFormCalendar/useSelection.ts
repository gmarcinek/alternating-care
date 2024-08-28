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
  isMultiSelectionMode?: boolean;
  setIsMultiSelectionMode?: Dispatch<SetStateAction<boolean>>;
}

export const useSelection = (props: UseSelectionProps) => {
  const { isMultiSelectionMode = false, setIsMultiSelectionMode } = props;
  const [selection, setSelection] = useState<Set<string>>(new Set());

  const [lastClickedDay, setLastClickedDay] = useState<string | null>(null);

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
    (day: CalendarDayType, event: PointerEvent<Element>) => {
      const isShiftPressed = event?.shiftKey;
      const dayDate = day.date;

      setSelection((prev) => {
        const newSet = new Set(prev);

        if (isMultiSelectionMode) {
          if (isShiftPressed && lastClickedDay) {
            // Tryb Shift w trybie multi: Zaznacz zakres dni od ostatnio klikniętego dnia do bieżącego dnia
            let startDate = dayjs(lastClickedDay);
            let endDate = dayjs(dayDate);

            if (startDate.isAfter(endDate)) {
              [startDate, endDate] = [endDate, startDate];
            }

            addDateRange(newSet, startDate, endDate);
          } else {
            // Zaznaczanie/dodawanie/usuwanie dni w trybie multi bez Shift
            if (newSet.has(dayDate)) {
              newSet.delete(dayDate);

              // Jeśli wszystkie dni są odznaczone, wyłącz tryb multi i zresetuj lastClickedDay
              if (newSet.size === 0) {
                setIsMultiSelectionMode?.(false);
                setLastClickedDay(null); // Reset lastClickedDay
              }
            } else {
              newSet.add(dayDate);
            }
          }
        } else {
          if (isShiftPressed && lastClickedDay) {
            // Zaznaczanie zakresu dni w trybie pojedynczym
            let startDate = dayjs(lastClickedDay);
            let endDate = dayjs(dayDate);

            if (startDate.isAfter(endDate)) {
              [startDate, endDate] = [endDate, startDate];
            }

            addDateRange(newSet, startDate, endDate);
          } else {
            // Standardowe zaznaczanie w trybie pojedynczym
            if (newSet.has(dayDate)) {
              // Jeśli kliknięto ten sam dzień, wyczyść zaznaczenie i zresetuj lastClickedDay
              setLastClickedDay(null); // Reset lastClickedDay
              return new Set([]);
            }
            // Zaznacz jeden dzień i wyczyść pozostałe
            return new Set([dayDate]);
          }

          // Włącz tryb wielokrotnego zaznaczania, jeśli nie jest już aktywny
          setIsMultiSelectionMode?.(true);
        }

        // Zaktualizuj zapamiętany dzień kliknięcia na obecny, jeśli coś zostało zaznaczone
        setLastClickedDay(dayDate);

        return newSet;
      });
    },
    [selection, isMultiSelectionMode, setIsMultiSelectionMode, lastClickedDay]
  );

  const handleOnDayPointerUp = useCallback<OnDayPointerHandler>(
    (day, event) => {
      setLastClickedDay(day.date);
      const isCtrlPressed = event?.ctrlKey;
      const isAltPressed = event?.altKey;
      const isShiftPressed = event?.shiftKey;

      if (isShiftPressed) {
        setIsMultiSelectionMode?.(true);
        defaultBehavior(day, event);
        return;
      }

      defaultBehavior(day, event);
    },
    [isMultiSelectionMode, setIsMultiSelectionMode, defaultBehavior]
  );

  const handleOnDayPointerDown = useCallback<OnDayPointerHandler>(
    (day, event) => {},
    [isMultiSelectionMode, setIsMultiSelectionMode, defaultBehavior]
  );

  const handleCancelMultiSelect = useCallback(() => {
    setIsMultiSelectionMode?.(false);
    setSelection(new Set());
  }, [isMultiSelectionMode, setIsMultiSelectionMode, selection]);

  return {
    selection,
    setSelection,
    handleCancelMultiSelect,
    handleOnDayPointerUp,
    handleOnDayPointerDown,
  };
};
