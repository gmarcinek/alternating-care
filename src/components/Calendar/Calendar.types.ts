import { CalendarDay } from '@/src/modules/db/types';

export type DisplayStrategy = 'continous' | 'separateMonths';

export interface CalendarMonthType {
  monthIndex: number;
  weeks: CalendarDay[][];
}
