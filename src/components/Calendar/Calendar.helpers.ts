import { CalendarDay } from '@/src/modules/db/types';
import dayjs from 'dayjs';
import { CalendarMonthType } from './Calendar.types';

export function segregateDatesMonthly(
  dates: CalendarDay[][]
): CalendarMonthType[] {
  const monthlyData: CalendarMonthType[] = [];

  dates.forEach((week) => {
    const pointedMonths = Array.from(
      new Set(
        week.map((day) => {
          return dayjs(day.date).month();
        })
      )
    );

    const date = dayjs(week[0].date);
    const monthIndex = date.month();

    pointedMonths.forEach((monthIndex, index) => {
      const weeklyData = monthlyData.find(
        (data) => data.monthIndex === monthIndex
      );
      if (!weeklyData) {
        monthlyData.push({
          monthIndex: monthIndex,
          weeks: [week],
        });
      } else {
        weeklyData.weeks.push(week);
      }
    });
  });

  return monthlyData;
}
