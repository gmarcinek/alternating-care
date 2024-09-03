import { useAppContext } from '@app/AppContext';
import TuneIcon from '@mui/icons-material/Tune';
import { Input, Switch } from '@nextui-org/react';
import { useBreakpoints } from '@utils/useBreakpoints';
import { calendarSettingsFormI18n } from './calendarSettingsForm.i18n';

interface CalendarSettingsFormProps {
  isPlanVisible: boolean;
  setIsPlanVisible: (value: boolean) => void;

  isAlternatingVisible: boolean;
  setIsAlternatingVisible: (value: boolean) => void;
  sliderValue: number;
}

export const CalendarSettingsForm = (props: CalendarSettingsFormProps) => {
  const {
    isPlanVisible,
    setIsPlanVisible,
    isAlternatingVisible,
    setIsAlternatingVisible,
    sliderValue,
  } = props;

  const { isMobile } = useBreakpoints();
  const { language } = useAppContext();
  const i18n = calendarSettingsFormI18n[language];

  return (
    <>
      {sliderValue !== 1 && (
        <Switch
          defaultSelected={isPlanVisible}
          onValueChange={setIsPlanVisible}
          size='sm'
        >
          {i18n.plan}
        </Switch>
      )}

      <Switch
        defaultSelected={isAlternatingVisible}
        onValueChange={setIsAlternatingVisible}
        size='sm'
      >
        {i18n.alternating}
      </Switch>

      <Input
        type='text'
        radius='full'
        placeholder='Filtr'
        isClearable
        variant='faded'
        size='sm'
        startContent={<TuneIcon />}
      />
    </>
  );
};
