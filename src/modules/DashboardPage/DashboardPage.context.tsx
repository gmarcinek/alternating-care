import { CalendarEvent } from '@api/db/types';
import { UseQueryResult } from '@tanstack/react-query';
import { createContext, useContext } from 'react';

export interface DashboardPageContextData {
  updateAllEvents?: UseQueryResult<CalendarEvent[], Error>['refetch'];
}

export const DashboardPageContext = createContext<DashboardPageContextData>({});

export const useDashboardPageContext = () => {
  const cashboardContextData = useContext(DashboardPageContext);
  return cashboardContextData;
};
