'use client';

import { dateFormat } from '@components/Calendar/Calendar.helpers';
import { Stack } from '@components/Stack/Stack';
import { CalendarDate, parseDate } from '@internationalized/date';
import { DateRangePicker, RangeValue } from '@nextui-org/react';
import { useAppSearchParams } from '@utils/useAppSearchParams';
import { useUpdateQueryParam } from '@utils/useUpdateQueryParam';
import dayjs from 'dayjs';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import {
  MdClose,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from 'react-icons/md';

interface RangeNavigationProps {
  alignItems?: React.ComponentProps<typeof Stack>['itemsAlignment'];
  contentAlignment?: React.ComponentProps<typeof Stack>['contentAlignment'];
  buttonSize?: number;
}

export const RangeNavigation = (props: RangeNavigationProps) => {
  const { alignItems, contentAlignment, buttonSize = 20 } = props;
  const { startDate, endDate } = useAppSearchParams();

  const updateQueryParam = useUpdateQueryParam();

  const defaultDates = useMemo(() => {
    const start = dayjs(startDate).startOf('month').format(dateFormat);
    const end = startDate
      ? dayjs(startDate).add(11, 'month').endOf('month').format(dateFormat)
      : dayjs().add(11, 'month').endOf('month').format(dateFormat);

    return {
      start,
      end,
    };
  }, [startDate, endDate]);

  const [parsedDates, setParsedDates] = useState({
    start: parseDate(defaultDates.start),
    end: parseDate(defaultDates.end),
  });

  useLayoutEffect(() => {
    if (!startDate) {
      updateQueryParam('startDate', defaultDates.start);
    }
    if (!endDate) {
      updateQueryParam('endDate', defaultDates.end);
    }
  }, [defaultDates, startDate, endDate]);

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
    const startDate = dayjs().startOf('month').format(dateFormat);
    const endDate = dayjs().add(11, 'month').endOf('month').format(dateFormat);

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
      itemsAlignment={alignItems ?? 'center'}
      contentAlignment={contentAlignment ?? 'end'}
    >
      <MdKeyboardDoubleArrowLeft
        onClick={() => handleUpdateRange('back', 'year')}
        size={buttonSize}
      />
      <MdKeyboardArrowLeft
        onClick={() => handleUpdateRange('back', 'month')}
        size={buttonSize}
      />
      <div>
        <DateRangePicker
          variant='bordered'
          visibleMonths={2}
          value={parsedDates}
          onChange={handlePickerOnChangeDates}
          onKeyDown={(event) => event.preventDefault()}
        />
      </div>
      <MdKeyboardArrowRight
        onClick={() => handleUpdateRange('forward', 'month')}
        size={buttonSize}
      />
      <MdKeyboardDoubleArrowRight
        onClick={() => handleUpdateRange('forward', 'year')}
        size={buttonSize}
      />
      <MdClose onClick={() => handleResetDates()} size={buttonSize} />
    </Stack>
  );
};
