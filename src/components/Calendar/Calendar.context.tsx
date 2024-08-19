import { createContext, useContext } from 'react';

export interface CalenderContextData {
  rowSize: number;
  isTodayVisible: boolean;
  isWeeksSplitted: boolean;
  isAlternatingVisible: boolean;
  isWeekendsVisible: boolean;
  alternatingDates: string[];
}

export const CalenderContext = createContext<CalenderContextData>({
  rowSize: 7,
  isTodayVisible: true,
  isWeeksSplitted: false,
  isAlternatingVisible: true,
  isWeekendsVisible: true,
  alternatingDates: [],
});

export const useCalenderContext = () => {
  const calenderContextData = useContext(CalenderContext);
  return calenderContextData;
};
