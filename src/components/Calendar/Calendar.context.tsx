import { createContext, useContext } from 'react';

export interface CalenderContextData {
  rowSize: number;
  containerWidth: number;
  isTodayVisible: boolean;
  isPlanVisible: boolean;
  isAlternatingVisible: boolean;
  isWeekendsVisible: boolean;
  alternatingDates: string[];
  displayStrategy: 'continous' | 'separateMonths';
}

export const CalenderContext = createContext<CalenderContextData>({
  containerWidth: 0,
  rowSize: 7,
  isTodayVisible: true,
  isPlanVisible: false,
  isAlternatingVisible: true,
  isWeekendsVisible: true,
  alternatingDates: [],
  displayStrategy: 'continous',
});

export const useCalenderContext = () => {
  const calenderContextData = useContext(CalenderContext);
  return calenderContextData;
};
