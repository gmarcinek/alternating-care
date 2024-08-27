import { Switch } from '@nextui-org/react';
import { useBreakpoints } from '@utils/useBreakpoints';

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

  const { isMobile, isTablet } = useBreakpoints();

  return (
    <>
      <Switch
        defaultSelected={isTodayVisible}
        onValueChange={setIsTodayVisible}
        size='sm'
      >
        Dziś
      </Switch>

      {sliderValue !== 1 && (
        <Switch
          defaultSelected={isPlanVisible}
          onValueChange={setIsPlanVisible}
          size='sm'
        >
          Plan
        </Switch>
      )}

      {sliderValue === 7 && (
        <Switch
          defaultSelected={isContiniousDisplayStrategy}
          onValueChange={setIsContiniousDisplayStrategy}
          isDisabled={sliderValue !== 7}
          size='sm'
        >
          {'Łącz'}
        </Switch>
      )}

      {!isMobile && (
        <Switch
          defaultSelected={isWeekendsVisible}
          onValueChange={setIsWeekendsVisible}
          size='sm'
        >
          Weekend
        </Switch>
      )}

      <Switch
        defaultSelected={isAlternatingVisible}
        onValueChange={setIsAlternatingVisible}
        size='sm'
      >
        Opieka
      </Switch>
    </>
  );
};
