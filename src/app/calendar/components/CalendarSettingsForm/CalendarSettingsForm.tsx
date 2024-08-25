import { Checkbox } from '@nextui-org/react';

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
  isTablet: boolean;
  isMobile: boolean;
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
    isTablet,
    isMobile,
  } = props;
  return (
    <>
      <Checkbox
        defaultSelected={isTodayVisible}
        onValueChange={setIsTodayVisible}
      >
        Dziś
      </Checkbox>

      {isTablet && sliderValue !== 1 && (
        <Checkbox
          defaultSelected={isPlanVisible}
          onValueChange={setIsPlanVisible}
        >
          Plan
        </Checkbox>
      )}

      {sliderValue === 7 && (
        <Checkbox
          defaultSelected={isContiniousDisplayStrategy}
          onValueChange={setIsContiniousDisplayStrategy}
          isDisabled={sliderValue !== 7}
        >
          {!isContiniousDisplayStrategy ? 'Złącz' : 'Rozłącz'}
        </Checkbox>
      )}

      {!isMobile && (
        <Checkbox
          defaultSelected={isWeekendsVisible}
          onValueChange={setIsWeekendsVisible}
        >
          Weekend
        </Checkbox>
      )}

      <Checkbox
        defaultSelected={isAlternatingVisible}
        onValueChange={setIsAlternatingVisible}
      >
        Opieka
      </Checkbox>
    </>
  );
};
