import { useAppContext } from '@app/AppContext';
import { Switch } from '@nextui-org/react';
import { dateFormat } from '@utils/dates';
import { useBreakpoints } from '@utils/useBreakpoints';
import { useScrollToId } from '@utils/useScrollTo';
import dayjs from 'dayjs';
import { useCallback } from 'react';
import { calendarSettingsFormI18n } from './calendarSettingsForm.i18n';

interface CalendarSettingsFormProps {
  isTodayVisible: boolean;
  setIsTodayVisible: (value: boolean) => void;
  isPlanVisible: boolean;
  setIsPlanVisible: (value: boolean) => void;

  isWeekendsVisible: boolean;
  setIsWeekendsVisible: (value: boolean) => void;
  isAlternatingVisible: boolean;
  setIsAlternatingVisible: (value: boolean) => void;
  sliderValue: number;
}

export const CalendarSettingsForm = (props: CalendarSettingsFormProps) => {
  const {
    isTodayVisible,
    setIsTodayVisible,
    isPlanVisible,
    setIsPlanVisible,
    isWeekendsVisible,
    setIsWeekendsVisible,
    isAlternatingVisible,
    setIsAlternatingVisible,
    sliderValue,
  } = props;

  const { isMobile } = useBreakpoints();
  const { language } = useAppContext();
  const i18n = calendarSettingsFormI18n[language];

  const { scrollToElement } = useScrollToId();
  const todayDate = dayjs().format(dateFormat);

  const handleSwitchToday = useCallback(
    (value: boolean) => {
      setIsTodayVisible(value);

      if (value === true) {
        scrollToElement(`day-${todayDate}`, 100);
      }
    },
    [setIsTodayVisible, scrollToElement, todayDate]
  );

  return (
    <>
      <Switch
        defaultSelected={isTodayVisible}
        onValueChange={handleSwitchToday}
        size='sm'
      >
        {i18n.today}
      </Switch>

      {sliderValue !== 1 && (
        <Switch
          defaultSelected={isPlanVisible}
          onValueChange={setIsPlanVisible}
          size='sm'
        >
          {i18n.plan}
        </Switch>
      )}

      {!isMobile && (
        <Switch
          defaultSelected={isWeekendsVisible}
          onValueChange={setIsWeekendsVisible}
          size='sm'
        >
          {i18n.weekends}
        </Switch>
      )}

      <Switch
        defaultSelected={isAlternatingVisible}
        onValueChange={setIsAlternatingVisible}
        size='sm'
      >
        {i18n.alternating}
      </Switch>
    </>
  );
};
