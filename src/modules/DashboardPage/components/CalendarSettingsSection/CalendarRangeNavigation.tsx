'use client';

import { dateFormat } from '@components/Calendar/Calendar.helpers';
import { Stack } from '@components/Stack/Stack';
import { CalendarDate, parseDate } from '@internationalized/date';
import { useDashboardPageContext } from '@modules/DashboardPage/DashboardPage.context';
import { DateRangePicker, RangeValue } from '@nextui-org/react';
import { useUpdateQueryParam } from '@utils/useUpdateQueryParam';
import dayjs from 'dayjs';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from 'react-icons/md';
import { TfiBackLeft } from 'react-icons/tfi';

export const CalendarRangeNavigation = () => {
  const { startDate, endDate } = useDashboardPageContext();
  const updateQueryParam = useUpdateQueryParam();

  const defaultDates = useMemo(() => {
    const start = dayjs().startOf('month').format(dateFormat);
    const end = dayjs().add(11, 'month').endOf('month').format(dateFormat);

    return {
      start,
      end,
    };
  }, []);

  useLayoutEffect(() => {
    if (!startDate) {
      updateQueryParam('startDate', defaultDates.start);
    }
    if (!endDate) {
      updateQueryParam('endDate', defaultDates.end);
    }
  }, [defaultDates]);

  const [parsedDates, setParsedDates] = useState({
    start: parseDate(dayjs().startOf('month').format(dateFormat)),
    end: parseDate(dayjs().add(11, 'month').endOf('month').format(dateFormat)),
  });

  const handlePickerOnChangeDates = useCallback(
    (value: RangeValue<CalendarDate>) => {
      const startDate = dayjs(value.start.toString()).format(dateFormat);
      const endDate = dayjs(value.end.toString()).format(dateFormat);

      updateQueryParam('startDate', startDate);
      updateQueryParam('endDate', endDate);

      setParsedDates({
        start: parseDate(startDate),
        end: parseDate(endDate),
      });
    },
    [updateQueryParam, setParsedDates]
  );

  const handleResetDates = useCallback(() => {
    const startDate = dayjs(defaultDates.start).format(dateFormat);
    const endDate = dayjs(defaultDates.end).format(dateFormat);

    updateQueryParam('startDate', startDate);
    updateQueryParam('endDate', endDate);

    setParsedDates({
      start: parseDate(startDate),
      end: parseDate(endDate),
    });
  }, [updateQueryParam, setParsedDates]);

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
            start: parseDate(defaultDates.start),
            end: parseDate(defaultDates.end),
          }}
        />
      </div>
      <MdKeyboardArrowRight
        onClick={() => handleUpdateRange('forward', 'month')}
      />
      <MdKeyboardDoubleArrowRight
        onClick={() => handleUpdateRange('forward', 'year')}
      />
      <TfiBackLeft onClick={() => handleResetDates()} />
    </Stack>
  );
};
