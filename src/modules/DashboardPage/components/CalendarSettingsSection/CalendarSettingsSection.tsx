'use client';

import { useAppContext } from '@app/AppContext';
import { RangeNavigation } from '@components/RangeNavigation/RangeNavigation';
import { Stack } from '@components/Stack/Stack';
import { Switch } from '@nextui-org/react';
import { useBreakpoints } from '@utils/useBreakpoints';
import { useRowSize } from '../Dashboard/useRowSize';
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
  const { language } = useAppContext();
  const i18n = calendarSettingsSectionI18n[language];
  const { isMax1280 } = useBreakpoints();
  const { automaticRowSize } = useRowSize({
    isPlanVisible,
  });

  return (
    <Stack
      direction='horizontal'
      className='wrap flex-wrap py-4'
      itemsAlignment='between'
    >
      <Stack direction='horizontal'>
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
      </Stack>

      <RangeNavigation
        alignItems={'center'}
        contentAlignment={isMax1280 ? 'between' : 'end'}
        fastGranulation={isPlanVisible ? 'day' : 'year'}
        slowGranulation={isPlanVisible ? 'day' : 'month'}
        count={isPlanVisible ? automaticRowSize : 1}
      />
    </Stack>
  );
};
