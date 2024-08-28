'use client';

import { useAppContext } from '@app/AppContext';
import { Calendar } from '@components/Calendar/Calendar';
import { Stack } from '@components/Stack/Stack';
import { ALTERNATING_DATES } from '@modules/CalendarPage/constants';
import { CalendarEventType } from '@modules/db/types';
import { Divider } from '@nextui-org/divider';
import { Input, Textarea } from '@nextui-org/input';
import { Switch } from '@nextui-org/react';
import { Select, SelectItem } from '@nextui-org/select';
import { dateFormat } from '@utils/dates';
import { useBreakpoints } from '@utils/useBreakpoints';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useCallback, useState } from 'react';
import { useLongPress } from 'use-long-press';
import { CalendarSettingsForm } from '../CalendarSettingsForm/CalendarSettingsForm';
import { eventFormCalendarI18n } from './eventFormCalendar.i18n';
import styles from './EventFormCalendar.module.scss';
import { useSelection } from './useSelection';

interface EventFormCalendarProps {
  userName: string;
}

export const EventFormCalendar = (props: EventFormCalendarProps) => {
  const { isTablet } = useBreakpoints();
  const { language } = useAppContext();
  const startDate = dayjs().format(dateFormat);

  const [isTodayVisible, setIsTodayVisible] = useState(true);
  const [isPlanVisible, setIsPlanVisible] = useState(false);
  const [isWeekendsVisible, setIsWeekendsVisible] = useState(true);
  const [isAlternatingVisible, setIsAlternatingVisible] = useState(true);
  const [isContinuousDisplayStrategy, setIsContinuousDisplayStrategy] =
    useState(false);
  const [isLoopedEvent, setIsLoopedEvent] = useState(false);

  const { selection, handlers, isMultiSelectionMode, setIsMultiSelectionMode } =
    useSelection({
      isMultiSelectionAvailable: true,
    });

  const formClasses = classNames(
    styles.formContainer,
    'scrollSmall sticky t-20 z-10 h-1'
  );

  const handleLongPress = useCallback(() => {
    setIsMultiSelectionMode(true);
  }, []);

  const bind = useLongPress(handleLongPress, {
    // Add onFinish callback
    onFinish: () => {
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    },
    filterEvents: (event) => true,
    threshold: 500,
    captureEvent: true,
    cancelOnMovement: 25,
    cancelOutsideElement: true,
  });

  return (
    <Stack gap={0} className={styles.eventFormCalendar}>
      {isTablet && (
        <>
          <Stack>
            <h3>{eventFormCalendarI18n[language].editSection.title}</h3>
            <Stack gap={8} direction='horizontal' className='mb-4'>
              <CalendarSettingsForm
                isTodayVisible={isTodayVisible}
                setIsTodayVisible={setIsTodayVisible}
                isPlanVisible={isPlanVisible}
                setIsPlanVisible={setIsPlanVisible}
                isContiniousDisplayStrategy={isContinuousDisplayStrategy}
                setIsContiniousDisplayStrategy={setIsContinuousDisplayStrategy}
                isWeekendsVisible={isWeekendsVisible}
                setIsWeekendsVisible={setIsWeekendsVisible}
                isAlternatingVisible={isAlternatingVisible}
                setIsAlternatingVisible={setIsAlternatingVisible}
                sliderValue={7}
              />
            </Stack>
          </Stack>
        </>
      )}

      <Stack direction='horizontal' gap={24}>
        <div className={styles.calendarContainer} {...bind()}>
          <Calendar
            startDate={startDate}
            rowSize={7}
            isTodayVisible={isTodayVisible}
            isPlanVisible={isPlanVisible}
            isWeekendsVisible={isWeekendsVisible}
            isAlternatingVisible={isAlternatingVisible}
            displayStrategy={
              isContinuousDisplayStrategy ? 'continous' : 'separateMonths'
            }
            events={ALTERNATING_DATES}
            {...handlers}
            selection={Array.from(selection)}
            isMultiSelectionMode={isMultiSelectionMode}
          />
        </div>

        <div className={formClasses}>
          <Stack gap={0}>
            <Stack className={styles.calendarDetails}>
              <h3>{eventFormCalendarI18n[language].editSection.title}</h3>

              <Stack gap={12} direction='horizontal'>
                <CalendarSettingsForm
                  isTodayVisible={isTodayVisible}
                  setIsTodayVisible={setIsTodayVisible}
                  isPlanVisible={isPlanVisible}
                  setIsPlanVisible={setIsPlanVisible}
                  isContiniousDisplayStrategy={isContinuousDisplayStrategy}
                  setIsContiniousDisplayStrategy={
                    setIsContinuousDisplayStrategy
                  }
                  isWeekendsVisible={isWeekendsVisible}
                  setIsWeekendsVisible={setIsWeekendsVisible}
                  isAlternatingVisible={isAlternatingVisible}
                  setIsAlternatingVisible={setIsAlternatingVisible}
                  sliderValue={7}
                />
              </Stack>

              <Divider className='mb-4 mt-8' />

              <Stack>
                <h3 className='mt-0'>
                  {eventFormCalendarI18n[language].editSection.newPlanTitle}
                </h3>
                <Stack direction='horizontal'>
                  <Input
                    type='text'
                    label={eventFormCalendarI18n[language].inputs.eventName}
                    radius='sm'
                    variant='bordered'
                    size='lg'
                  />

                  <Select label='Typ' radius='sm' variant='bordered' size='lg'>
                    <SelectItem key={CalendarEventType.Alternating}>
                      {CalendarEventType.Alternating}
                    </SelectItem>
                    <SelectItem key={CalendarEventType.Event}>
                      {CalendarEventType.Event}
                    </SelectItem>
                  </Select>
                </Stack>
                <Textarea
                  radius='sm'
                  label={
                    eventFormCalendarI18n[language].inputs.eventDescription
                  }
                  variant='bordered'
                  size='lg'
                />
              </Stack>

              <Divider className='my-4' />

              <Stack>
                <h3 className='mt-0'>
                  {eventFormCalendarI18n[language].editSection.cyclicTitle}
                </h3>

                <Switch
                  defaultSelected={isLoopedEvent}
                  onValueChange={setIsLoopedEvent}
                  size='sm'
                  color='warning'
                >
                  {eventFormCalendarI18n[language].switches.repeat}
                </Switch>

                {isLoopedEvent && (
                  <Stack direction='horizontal'>
                    <Input
                      type='number'
                      label={
                        eventFormCalendarI18n[language].inputs
                          .repeatEventEveryXDays
                      }
                      radius='sm'
                      defaultValue='7'
                      max={366}
                      min={1}
                      variant='bordered'
                      size='lg'
                      description={
                        eventFormCalendarI18n[language].descriptions
                          .repeatEventDescription
                      }
                    />
                    <Input
                      type='number'
                      label={
                        eventFormCalendarI18n[language].inputs.repeatEventTimes
                      }
                      radius='sm'
                      defaultValue='2'
                      max={52}
                      min={2}
                      variant='bordered'
                      size='lg'
                    />
                  </Stack>
                )}
              </Stack>

              <Divider className='my-4' />

              <Stack>
                <h3 className='mt-0'>
                  {eventFormCalendarI18n[language].editSection.visibilityTitle}
                </h3>
                <Stack direction='horizontal'>
                  <Input
                    type='color'
                    label={
                      eventFormCalendarI18n[language].inputs.backgroundColor
                    }
                    radius='sm'
                    variant='bordered'
                    defaultValue='#00A9FD'
                    placeholder={
                      eventFormCalendarI18n[language].placeholders
                        .backgroundColor
                    }
                    className='block text-gray-900'
                    size='lg'
                  />
                  <Input
                    type='color'
                    label={eventFormCalendarI18n[language].inputs.textColor}
                    radius='sm'
                    variant='bordered'
                    defaultValue='#ffffff'
                    placeholder={
                      eventFormCalendarI18n[language].placeholders.textColor
                    }
                    className='block text-gray-900'
                    size='lg'
                  />
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </div>
      </Stack>
    </Stack>
  );
};
