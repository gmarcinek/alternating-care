'use client';

import { CalendarDayType } from '@modules/db/types';
import dayjs from 'dayjs';
import { useCalenderContext } from '../../Calendar.context';

interface CalendarWeekInfoSectionProps {
  week: CalendarDayType[];
}

export default function CalendarWeekInfoSection(
  props: CalendarWeekInfoSectionProps
) {
  const { week } = props;
  const { rowSize } = useCalenderContext();

  const dayAlpha = week[0];
  const dayOmega = week[week.length - 1];

  return (
    <p className='mt-3'>
      {rowSize === 7 && (
        <>
          Tydzień: <strong>{dayjs(dayAlpha.date).week()}</strong>
          {'/'}
          <small>
            {dayjs(dayAlpha.date).format('YYYY')}{' '}
            {dayjs(dayAlpha.date).format('DD.MM')}
            {'-'}
            {dayjs(dayOmega.date).format('DD.MM')}
          </small>
        </>
      )}
      {rowSize === 14 && (
        <>
          Tygodnie:{' '}
          <strong>
            {dayjs(dayAlpha.date).week() / dayjs(dayOmega.date).week()}
          </strong>
          {'/'}
          <small>
            {dayjs(dayAlpha.date).format('YYYY')}{' '}
            {dayjs(dayAlpha.date).format('DD.MM')}
            {'-'}
            {dayjs(dayOmega.date).format('DD.MM')}
          </small>
        </>
      )}
      {rowSize === 30 && (
        <>
          Miesiąc: <strong>{dayjs(dayAlpha.date).format('MMMM')}</strong>{' '}
        </>
      )}
    </p>
  );
}
