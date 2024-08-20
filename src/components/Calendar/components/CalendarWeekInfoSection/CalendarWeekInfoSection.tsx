'use client';

import { CalendarDay } from '@/src/modules/db/types';
import dayjs from 'dayjs';
import { useCalenderContext } from '../../Calendar.context';

interface CalendarWeekInfoSectionProps {
  week: CalendarDay[];
}

export default function CalendarWeekInfoSection(
  props: CalendarWeekInfoSectionProps
) {
  const { week } = props;
  const { isPlanVisible, rowSize } = useCalenderContext();

  const dayAlpha = week[0];
  const dayOmega = week[week.length - 1];

  return (
    <p className='mt-3'>
      Tydzień: <strong>{dayjs(dayAlpha.date).week()}</strong>
      {'/'}
      <small>
        {dayjs(dayAlpha.date).format('YYYY')}{' '}
        {dayjs(dayAlpha.date).format('DD.MM')}
        {'-'}
        {dayjs(dayOmega.date).format('DD.MM')}
      </small>
    </p>
  );
}
