'use client';

import { Calendar } from '@components/Calendar/Calendar';
import { CalendarEvent } from '@modules/db/types';
import { dateFormat } from '@utils/dates';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useRowSize } from '../Dashboard/useRowSize';
import { useSelection } from '../Dashboard/useSelection';

interface CalendarBlockProps {
  data: CalendarEvent[];
}

export const CalendarBlock = (props: CalendarBlockProps) => {
  const startDate = dayjs().format(dateFormat);
  const { selection, handlers, isMultiSelectionMode } = useSelection({
    isMultiSelectionAvailable: true,
  });

  const [isPlanVisible] = useState(true);
  const [isAlternatingVisible, setIsAlternatingVisible] = useState(true);

  const { automaticRowSize } = useRowSize({
    isPlanVisible,
  });

  return (
    <Calendar
      startDate={startDate}
      rowSize={automaticRowSize}
      isTodayVisible
      isAlternatingVisible={isAlternatingVisible}
      displayStrategy={isPlanVisible ? 'continous' : 'separateMonths'}
      events={props.data}
      {...handlers}
      selection={Array.from(selection)}
      isMultiSelectionMode={isMultiSelectionMode}
    />
  );
};
