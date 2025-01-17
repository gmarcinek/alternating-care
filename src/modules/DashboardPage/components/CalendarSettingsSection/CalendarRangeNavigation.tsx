'use client';

import { dateFormat } from '@components/Calendar/Calendar.helpers';
import { Stack } from '@components/Stack/Stack';
import { CalendarDate, parseDate } from '@internationalized/date';
import { useDashboardPageContext } from '@modules/DashboardPage/DashboardPage.context';
import { DateRangePicker, RangeValue } from '@nextui-org/react';
import { useUpdateQueryParam } from '@utils/useUpdateQueryParam';
import dayjs from 'dayjs';
import { useCallback, useLayoutEffect, useState } from 'react';
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from 'react-icons/md';

export const CalendarRangeNavigation = () => {
  const { startDate, endDate } = useDashboardPageContext();
  const updateQueryParam = useUpdateQueryParam();

  useLayoutEffect(() => {
    if (!startDate) {
      updateQueryParam('startDate', dayjs().format(dateFormat));
    }
    if (!endDate) {
      updateQueryParam('endDate', dayjs().add(1, 'year').format(dateFormat));
    }
  }, []);

  const [parsedDates, setParsedDates] = useState({
    start: parseDate(dayjs().format(dateFormat)),
    end: parseDate(dayjs().add(1, 'year').format(dateFormat)),
  });

  const handlePickerOnChangeDates = useCallback(
    (value: RangeValue<CalendarDate>) => {
      const startDate = dayjs(value.start.toString()).format(dateFormat);
      const endDate = dayjs(value.end.toString()).format(dateFormat);

      updateQueryParam('startDate', startDate);
      updateQueryParam('endDate', endDate);
    },
    []
  );

  const handleUpdateRange = (
    direction: 'back' | 'forward',
    granular: 'month' | 'year'
  ) => {
    const newStartDate = dayjs(startDate)
      [direction === 'back' ? 'subtract' : 'add'](1, granular)
      .format(dateFormat);

    const newEndDate = dayjs(endDate)
      [direction === 'back' ? 'subtract' : 'add'](1, granular)
      .format(dateFormat);

    setParsedDates({
      start: parseDate(newStartDate),
      end: parseDate(newEndDate),
    });

    updateQueryParam('startDate', newStartDate);
    updateQueryParam('endDate', newEndDate);
  };

  return (
    <Stack
      direction='horizontal'
      itemsAlignment='center'
      contentAlignment='end'
    >
      <MdKeyboardDoubleArrowLeft
        onClick={() => handleUpdateRange('back', 'year')}
      />
      <MdKeyboardArrowLeft onClick={() => handleUpdateRange('back', 'month')} />
      <div>
        <DateRangePicker
          variant='bordered'
          visibleMonths={2}
          size='sm'
          value={parsedDates}
          onChange={handlePickerOnChangeDates}
          onKeyDown={(event) => event.preventDefault()}
          defaultValue={{
            start: parseDate(dayjs(startDate?.toString()).format(dateFormat)),
            end: endDate
              ? parseDate(dayjs(endDate).format(dateFormat))
              : parseDate(dayjs().format(dateFormat)),
          }}
        />
      </div>
      <MdKeyboardArrowRight
        onClick={() => handleUpdateRange('forward', 'month')}
      />
      <MdKeyboardDoubleArrowRight
        onClick={() => handleUpdateRange('forward', 'year')}
      />
    </Stack>
  );
};
