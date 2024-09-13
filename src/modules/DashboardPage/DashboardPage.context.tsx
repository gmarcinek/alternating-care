import { CalendarEvent } from '@api/db/types';
import { UseQueryResult } from '@tanstack/react-query';
import { createContext, useContext } from 'react';

export enum DashboardModeType {
  Plan = 'PLAN',
  Calendar = 'PLAN',
}
export enum DashboardRangeType {
  Day = 'DAY',
  Week = 'WEEK',
  TwoWeeks = 'TWO_WEEKS',
  ThreeWeeks = 'THREE_WEEKS',
  Month = 'MONTH',
  Quarter = 'QUARTER',
  Year = 'YEAR',
}

export interface DashboardPageContextData {
  updateAllEvents?: UseQueryResult<CalendarEvent[], Error>['refetch'];
  mode?: DashboardModeType;
  range?: DashboardRangeType;
  groupId?: string;
}

export const DashboardPageContext = createContext<DashboardPageContextData>({});

export const useDashboardPageContext = () => {
  const cashboardContextData = useContext(DashboardPageContext);
  return cashboardContextData;
};
