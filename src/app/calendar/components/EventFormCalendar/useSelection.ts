import { OnDayClickHandler } from '@components/Calendar/Calendar.context';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';

interface UseSelectionProps {
  isMultiSelectionMode: boolean;
  setIsMultiSelectionMode: Dispatch<SetStateAction<boolean>>;
}

export const useSelection = (props: UseSelectionProps) => {
  const { isMultiSelectionMode, setIsMultiSelectionMode } = props;
  const [selection, setSelection] = useState<Set<string>>(new Set());

  const addSelection = (date: string) => {
    setSelection((prev) => {
      const newSet = new Set(prev);
      newSet.add(date);

      // Sortowanie przed ustawieniem stanu
      const sortedArray = Array.from(newSet).sort();
      console.log(sortedArray);
      return new Set(sortedArray); // Ustawiamy posortowany Set jako nowy stan
    });
  };

  const removeSelection = (date: string) => {
    setSelection((prev) => {
      const newSet = new Set(prev); // Tworzenie nowego zbioru na podstawie poprzedniego stanu
      newSet.delete(date); // Usunięcie daty z nowego zbioru
      // Sortowanie przed ustawieniem stanu
      const sortedArray = Array.from(newSet).sort();
      return new Set(sortedArray); // Ustawiamy posortowany Set jako nowy stan
    });
  };

  const overrideSelection = (date: string) => {
    setSelection(new Set([date])); // Tworzenie nowego zbioru tylko z jedną datą
  };

  const handleOnDayClick = useCallback<OnDayClickHandler>(
    (day) => {
      setSelection((prev) => {
        const newSet = new Set(prev);

        if (prev.size === 1 && prev.has(day.date)) {
          setIsMultiSelectionMode(false);
          return new Set([]); // Wyczyść
        }

        if (!isMultiSelectionMode) {
          return new Set([day.date]); // Bezpośrednie nadpisanie wyboru
        }

        if (newSet.has(day.date)) {
          newSet.delete(day.date);

          if (newSet.size === 0) {
            setIsMultiSelectionMode(false);
          }
        } else {
          newSet.add(day.date);
        }

        const sortedArray = Array.from(newSet).sort();
        return new Set(sortedArray); // Ustawiamy posortowany Set jako nowy stan
      });
    },
    [isMultiSelectionMode, setIsMultiSelectionMode]
  );

  return {
    selection,
    setSelection,
    removeSelection,
    addSelection,
    overrideSelection,
    handleOnDayClick,
  };
};
