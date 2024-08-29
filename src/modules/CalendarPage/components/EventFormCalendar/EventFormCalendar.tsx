'use client';

import { useAppContext } from '@app/AppContext';
import { Calendar } from '@components/Calendar/Calendar';
import { Stack } from '@components/Stack/Stack';
import { CalendarEvent } from '@modules/db/types';
import { Divider } from '@nextui-org/divider';
import { UseMutationResult } from '@tanstack/react-query';
import { dateFormat } from '@utils/dates';
import { useBreakpoints } from '@utils/useBreakpoints';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useCallback, useState } from 'react';
import { useLongPress } from 'use-long-press';
import { CalendarEventForm } from '../CalendarEventForm/CalendarEventForm';
import { CalendarSettingsForm } from '../CalendarSettingsForm/CalendarSettingsForm';
import { eventFormCalendarI18n } from './eventFormCalendar.i18n';
import styles from './EventFormCalendar.module.scss';
import { useSelection } from './useSelection';
interface EventFormCalendarProps {
  fetchEventsMutation: UseMutationResult<
    CalendarEvent[],
    unknown,
    void,
    unknown
  >;
}

export const EventFormCalendar = (props: EventFormCalendarProps) => {
  const { fetchEventsMutation } = props;
  const { isTablet } = useBreakpoints();
  const { language } = useAppContext();
  const startDate = dayjs().format(dateFormat);

  const [isTodayVisible, setIsTodayVisible] = useState(true);
  const [isPlanVisible, setIsPlanVisible] = useState(false);
  const [isWeekendsVisible, setIsWeekendsVisible] = useState(true);
  const [isAlternatingVisible, setIsAlternatingVisible] = useState(true);
  const [isContinuousDisplayStrategy, setIsContinuousDisplayStrategy] =
    useState(false);

  const {
    selection,
    handlers,
    isMultiSelectionMode,
    setIsMultiSelectionMode,
    handleCancelMultiSelect,
  } = useSelection({
    isMultiSelectionAvailable: true,
  });

  const onAddEventSuccess = useCallback(() => {
    setIsMultiSelectionMode(false);
    handleCancelMultiSelect();
    fetchEventsMutation.mutate();
  }, [
    setIsMultiSelectionMode,
    handleCancelMultiSelect,
    fetchEventsMutation.mutate,
  ]);

  const formClasses = classNames(
    styles.formContainer,
    'scrollSmall sticky t-20 z-10 h-1'
  );

  const handleLongPress = useCallback(() => {
    setIsMultiSelectionMode(true);
  }, []);

  const bind = useLongPress(handleLongPress, {
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
            events={fetchEventsMutation.data || []}
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
                  <span>
                    {eventFormCalendarI18n[language].editSection.newPlanTitle}
                  </span>
                </h3>

                <CalendarEventForm
                  selection={Array.from(selection)}
                  onSuccess={onAddEventSuccess}
                />
              </Stack>
            </Stack>
          </Stack>
        </div>
      </Stack>
    </Stack>
  );
};
