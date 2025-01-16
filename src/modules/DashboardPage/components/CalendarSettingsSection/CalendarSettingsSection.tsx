'use client';

import { useAppContext } from '@app/AppContext';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import { Stack } from '@components/Stack/Stack';
import { CalendarDate, parseDate } from '@internationalized/date';
import { useDashboardPageContext } from '@modules/DashboardPage/DashboardPage.context';
import { DatePicker, Switch } from '@nextui-org/react';
import { useUpdateQueryParam } from '@utils/useUpdateQueryParam';
import dayjs from 'dayjs';
import { useCallback } from 'react';
import { calendarSettingsSectionI18n } from './calendarSettingsSection.i18n';

interface CalendarSettingsSectionProps {
  isPlanVisible: boolean;
  setIsPlanVisible: (value: boolean) => void;

  isAlternatingVisible: boolean;
  setIsAlternatingVisible: (value: boolean) => void;

  isEventsVisible: boolean;
  setIsEventsVisible: (value: boolean) => void;
}

export const CalendarSettingsSection = (
  props: CalendarSettingsSectionProps
) => {
  const {
    isPlanVisible,
    setIsPlanVisible,
    isAlternatingVisible,
    setIsAlternatingVisible,
    isEventsVisible,
    setIsEventsVisible,
  } = props;
  const updateQueryParam = useUpdateQueryParam();
  const { language } = useAppContext();
  const i18n = calendarSettingsSectionI18n[language];

  const { startDate, endDate } = useDashboardPageContext();

  const handleOnChangeStartDate = useCallback((value: CalendarDate) => {
    updateQueryParam('startDate', dayjs(value.toString()).format(dateFormat));
  }, []);

  const handleOnChangeEndDate = useCallback((value: CalendarDate) => {
    updateQueryParam('endDate', dayjs(value.toString()).format(dateFormat));
  }, []);

  return (
    <Stack direction='horizontal' className='wrap flex-wrap py-4'>
      <Switch
        defaultSelected={isPlanVisible}
        onValueChange={setIsPlanVisible}
        size='sm'
      >
        {i18n.plan}
      </Switch>

      <Switch
        defaultSelected={isAlternatingVisible}
        onValueChange={setIsAlternatingVisible}
        size='sm'
      >
        {i18n.alternating}
      </Switch>

      {!isPlanVisible && (
        <Switch
          defaultSelected={isEventsVisible}
          onValueChange={setIsEventsVisible}
          size='sm'
        >
          {i18n.events}
        </Switch>
      )}

      <div>
        <DatePicker
          label={i18n.startDate}
          defaultValue={parseDate(dayjs(startDate).format(dateFormat))}
          onChange={handleOnChangeStartDate}
        />
      </div>

      <div>
        <DatePicker
          label={i18n.endDate}
          defaultValue={parseDate(dayjs(endDate).format(dateFormat))}
          onChange={handleOnChangeEndDate}
          granularity='day'
        />
      </div>
    </Stack>
  );
};
