import { OnDayClickHandler } from '@components/Calendar/Calendar.context';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';

interface UseSelectionProps {
  isMultiSelectionMode: boolean;
  setIsMultiSelectionMode: Dispatch<SetStateAction<boolean>>;
}

export const useSelection = (props: UseSelectionProps) => {
  const { isMultiSelectionMode, setIsMultiSelectionMode } = props;
  const [selection, setSelection] = useState<Set<string>>(new Set());

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
    handleOnDayClick,
  };
};
