import { OnDayPointerHandler } from '@components/Calendar/Calendar.context';
import { CalendarDayType } from '@modules/db/types';
import { dateFormat } from '@utils/dates';
import dayjs from 'dayjs';
import { PointerEvent, useCallback, useState } from 'react';

interface UseSelectionProps {
  /**
   * Określa, czy tryb wielokrotnego zaznaczania jest dostępny.
   * Domyślnie ustawione na `false`.
   */
  isMultiSelectionAvailable?: boolean;
}

/**
 * Hak `useSelection` do zarządzania zaznaczaniem dni w kalendarzu.
 * Obsługuje zarówno standardowe zaznaczanie pojedynczych dni, jak i zaznaczanie wielu dni z wykorzystaniem klawiszy modyfikujących.
 *
 * @param {UseSelectionProps} props - Opcjonalne właściwości konfiguracyjne haka.
 * @param {boolean} [props.isMultiSelectionAvailable=false] - Flaga wskazująca, czy tryb wielokrotnego zaznaczania jest dostępny.
 *
 * @returns {Object} Obiekt zawierający:
 * - `selection` (Set<string>): Zestaw zaznaczonych dni w formacie tekstowym.
 * - `setSelection` (Function): Funkcja do aktualizacji zestawu zaznaczonych dni.
 * - `handleCancelMultiSelect` (Function): Funkcja do anulowania trybu wielokrotnego zaznaczania.
 * - `isMultiSelectionMode` (boolean): Stan wskazujący, czy tryb wielokrotnego zaznaczania jest aktywny.
 * - `setIsMultiSelectionMode` (Function): Funkcja do ustawienia stanu trybu wielokrotnego zaznaczania.
 * - `lastClickedDay` (string | null): Data ostatnio klikniętego dnia w formacie tekstowym, lub `null` jeśli brak.
 * - `handlers` (Object): Obiekt zawierający funkcje obsługi zdarzeń wskaźnika:
 *   - `onPointerUp` (OnDayPointerHandler): Funkcja obsługująca zdarzenie zwolnienia wskaźnika.
 *   - `onPointerDown` (OnDayPointerHandler): Funkcja obsługująca zdarzenie naciśnięcia wskaźnika.
 */
export const useSelection = (props: UseSelectionProps) => {
  const { isMultiSelectionAvailable = false } = props;
  const [isMultiSelectionMode, setIsMultiSelectionMode] =
    useState<boolean>(false);

  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [lastClickedDay, setLastClickedDay] = useState<string | null>(null);

  /**
   * Dodaje zakres dat do zestawu zaznaczeń.
   *
   * @param {Set<string>} newSet - Zestaw zaznaczonych dni do zaktualizowania.
   * @param {dayjs.Dayjs} startDate - Data początkowa zakresu.
   * @param {dayjs.Dayjs} endDate - Data końcowa zakresu.
   */
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

  /**
   * Usuwa zakres dat z zestawu zaznaczeń.
   *
   * @param {Set<string>} newSet - Zestaw zaznaczonych dni do zaktualizowania.
   * @param {dayjs.Dayjs} startDate - Data początkowa zakresu.
   * @param {dayjs.Dayjs} endDate - Data końcowa zakresu.
   */
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

  /**
   * Obsługuje zaznaczanie zakresu dni w trybie wielokrotnego zaznaczania.
   *
   * @param {Set<string>} newSet - Zestaw zaznaczonych dni do zaktualizowania.
   * @param {string} dayDate - Data aktualnie klikniętego dnia w formacie tekstowym.
   * @param {boolean} isAltPressed - Flaga wskazująca, czy klawisz Alt jest wciśnięty.
   */
  const handleRangeSelection = (
    newSet: Set<string>,
    dayDate: string,
    isAltPressed: boolean
  ) => {
    if (!isMultiSelectionAvailable) {
      return;
    }

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

  /**
   * Obsługuje zaznaczanie dni w trybie wielokrotnego zaznaczania.
   *
   * @param {Set<string>} newSet - Zestaw zaznaczonych dni do zaktualizowania.
   * @param {string} dayDate - Data aktualnie klikniętego dnia w formacie tekstowym.
   */
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

  /**
   * Obsługuje zaznaczanie pojedynczego dnia.
   *
   * @param {Set<string>} newSet - Zestaw zaznaczonych dni do zaktualizowania.
   * @param {string} dayDate - Data aktualnie klikniętego dnia w formacie tekstowym.
   * @returns {Set<string>} - Zaktualizowany zestaw zaznaczonych dni.
   */
  const handleSingleSelect = (newSet: Set<string>, dayDate: string) => {
    if (newSet.has(dayDate)) {
      setLastClickedDay(null);
      return new Set([]);
    }
    return new Set([dayDate]);
  };

  /**
   * Obsługuje domyślne zachowanie zaznaczania dat w kalendarzu.
   *
   * Ta funkcja zarządza sposobem zaznaczania lub odznaczania dat na podstawie interakcji użytkownika.
   * Uwzględnia różne modyfikatory klawiaturowe (Shift, Alt, Ctrl) i aktualizuje zaznaczenie
   * odpowiednio. Obsługuje zarówno zaznaczanie pojedynczej daty, jak i zakresu dat w trybie
   * wielokrotnego zaznaczania.
   *
   * @param day - Obiekt `CalendarDayType` reprezentujący dzień, z którym dokonano interakcji.
   *               Powinien zawierać właściwość `date`, która przechowuje datę w formacie
   *               string (np. '2024-09-01').
   * @param event - Obiekt `PointerEvent` reprezentujący zdarzenie interakcji.
   *                Zawiera informacje takie jak, czy przyciski Shift, Alt, czy Ctrl są wciśnięte.
   *
   * @returns Zaktualizowany `Set<string>` zaznaczonych dat.
   *          Ten zestaw jest używany do aktualizacji stanu zaznaczonych dat.
   *
   * - Gdy tryb wielokrotnego zaznaczania (`isMultiSelectionMode`) jest włączony (`true`):
   *   - Jeśli wciśnięty jest klawisz Shift i ustawiona jest poprzednia data (`lastClickedDay`),
   *     funkcja wywołuje `handleRangeSelection`, aby dodać lub usunąć zakres dat między
   *     poprzednią datą a bieżącym dniem.
   *   - Jeśli klawisz Shift nie jest wciśnięty, funkcja wywołuje `handleMultiSelect`,
   *     aby przełączyć zaznaczenie bieżącego dnia.
   *
   * - Gdy tryb wielokrotnego zaznaczania (`isMultiSelectionMode`) jest wyłączony (`false`):
   *   - Jeśli wciśnięty jest klawisz Shift i ustawiona jest poprzednia data (`lastClickedDay`),
   *     funkcja wywołuje `handleRangeSelection`, aby zarządzać zakresem dat.
   *   - Jeśli wciśnięty jest klawisz Ctrl, funkcja wywołuje `handleMultiSelect`, aby przełączyć
   *     zaznaczenie bieżącego dnia.
   *   - Jeśli żadne klawisze modyfikujące nie są wciśnięte, funkcja wywołuje `handleSingleSelect`,
   *     aby zaznaczyć lub odznaczyć pojedynczy dzień.
   *
   * Funkcja aktualizuje również `isMultiSelectionMode` na podstawie właściwości `isMultiSelectionAvailable`
   * i bieżącego stanu zaznaczenia. Zapewnia, że jeśli zaznaczenie stanie się puste, tryb
   * wielokrotnego zaznaczania zostaje wyłączony.
   */
  const defaultBehavior = useCallback(
    (day: CalendarDayType, event: PointerEvent<Element>) => {
      const isShiftPressed = event?.shiftKey;
      const isAltPressed = event?.altKey;
      const isCtrlPressed = event?.ctrlKey;
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
          } else if (isCtrlPressed) {
            handleMultiSelect(newSet, dayDate);
          } else {
            return handleSingleSelect(newSet, dayDate);
          }
          setIsMultiSelectionMode?.(props.isMultiSelectionAvailable ?? false);
        }

        // Check if all days are deselected
        if (newSet.size === 0) {
          setIsMultiSelectionMode?.(false);
          setLastClickedDay(null);
        } else {
          setLastClickedDay(dayDate);
        }

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
        setIsMultiSelectionMode?.(props.isMultiSelectionAvailable ?? false);
      }

      defaultBehavior(day, event);
    },
    [defaultBehavior]
  );

  const handleOnDayPointerDown = useCallback<OnDayPointerHandler>(
    (day, event) => {
      console.log('handleOnDayPointerDown');
    },
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
    lastClickedDay,
    handlers: {
      ...onPointerHandlers,
    },
  };
};
