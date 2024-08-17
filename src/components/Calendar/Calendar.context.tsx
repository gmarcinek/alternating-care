import { createContext, useContext } from 'react';

export interface CalenderContextData {
  isWeeksSpleted: boolean;
  rowSize: number;
}

export const CalenderContext = createContext<CalenderContextData>({
  isWeeksSpleted: false,
  rowSize: 7,
});

export const useCalenderContext = () => {
  const calenderContextData = useContext(CalenderContext);
  return calenderContextData;
};
