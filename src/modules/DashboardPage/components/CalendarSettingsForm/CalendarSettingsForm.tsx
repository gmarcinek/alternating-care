import { useAppContext } from '@app/AppContext';
import { Stack } from '@components/Stack/Stack';
import { Switch } from '@nextui-org/react';
import { calendarSettingsFormI18n } from './calendarSettingsForm.i18n';

interface CalendarSettingsFormProps {
  isPlanVisible: boolean;
  setIsPlanVisible: (value: boolean) => void;

  isAlternatingVisible: boolean;
  setIsAlternatingVisible: (value: boolean) => void;

  isEventsVisible: boolean;
  setIsEventsVisible: (value: boolean) => void;
}

export const CalendarSettingsForm = (props: CalendarSettingsFormProps) => {
  const {
    isPlanVisible,
    setIsPlanVisible,
    isAlternatingVisible,
    setIsAlternatingVisible,
    isEventsVisible,
    setIsEventsVisible,
  } = props;

  const { language } = useAppContext();
  const i18n = calendarSettingsFormI18n[language];

  return (
    <Stack direction='horizontal' className='py-4'>
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
  );
};
