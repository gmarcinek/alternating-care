import { CalendarDay } from '@/src/modules/db/types';

export type DisplayStrategy = 'continous' | 'separateMonths';

export interface CalendarMonthType {
  monthIndex: number;
  yearIndex: number;
  weeks: CalendarDay[][];
}

export interface CalendarMonthRawType {
  month: number;
  year: number;
  days: CalendarDay[];
}
