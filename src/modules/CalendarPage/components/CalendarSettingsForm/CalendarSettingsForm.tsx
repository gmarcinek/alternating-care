import { useAppContext } from '@app/AppContext';
import { Switch } from '@nextui-org/react';
import { dateFormat } from '@utils/dates';
import { useBreakpoints } from '@utils/useBreakpoints';
import dayjs from 'dayjs';
import { useCallback } from 'react';
import { calendarSettingsFormI18n } from './calendarSettingsForm.i18n';

interface CalendarSettingsFormProps {
  isTodayVisible: boolean;
  setIsTodayVisible: (value: boolean) => void;
  isPlanVisible: boolean;
  setIsPlanVisible: (value: boolean) => void;
  isContiniousDisplayStrategy: boolean;
  setIsContiniousDisplayStrategy: (value: boolean) => void;
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
    isContiniousDisplayStrategy,
    setIsContiniousDisplayStrategy,
    isWeekendsVisible,
    setIsWeekendsVisible,
    isAlternatingVisible,
    setIsAlternatingVisible,
    sliderValue,
  } = props;

  const { isMobile } = useBreakpoints();
  const { language } = useAppContext();
  const i18n = calendarSettingsFormI18n[language];

  const handleSwitchToday = useCallback((value: boolean) => {
    setIsTodayVisible(value);

    if (value === true) {
      const element = document.getElementById(
        `day-${dayjs().format(dateFormat)}`
      );

      if (element) {
        // Get the element's position relative to the top of the document
        const headerHeight = 164;
        const position =
          element.getBoundingClientRect().top + window.scrollY - headerHeight;

        // Scroll to the element with the header offset
        window.scrollTo({ top: position, behavior: 'smooth' });
      }
    }
  }, []);

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

      {sliderValue === 7 && (
        <Switch
          defaultSelected={isContiniousDisplayStrategy}
          onValueChange={setIsContiniousDisplayStrategy}
          isDisabled={sliderValue !== 7}
          size='sm'
        >
          {i18n.continuousDisplay}
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
