'use client';

import { ALTERNATING_DATES } from '@app/calendar/constants';
import { Calendar } from '@components/Calendar/Calendar';
import { OnDayClickHandler } from '@components/Calendar/Calendar.context';
import { Stack } from '@components/Stack/Stack';
import { dateFormat } from '@utils/dates';
import { useBreakpoints } from '@utils/useBreakpoints';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useCallback, useState } from 'react';
import { CalendarSettingsForm } from '../CalendarSettingsForm/CalendarSettingsForm';
import { CalendarSizeSlider } from '../CalendarSizeSlider/CalendarSizeSlider';
import styles from './EventFormCalendar.module.scss';

interface EventFormCalendarProps {
  userName: string;
}

export const EventFormCalendar = (props: EventFormCalendarProps) => {
  const startDate = dayjs().format(dateFormat);
  const { isMobile, isTablet } = useBreakpoints();
  const [selection, setSelection] = useState<string | string[]>([]);
  const [sliderValue, setSliderValue] = useState(7);
  const [isTodayVisible, setIsTodayVisible] = useState(true);
  const [isPlanVisible, setIsPlanVisible] = useState(false);
  const [isWeekendsVisible, setIsWeekendsVisible] = useState(true);
  const [isAlternatingVisible, setIsAlternatingVisible] = useState(true);
  const [isContiniousDisplayStrategy, setIsContiniousDisplayStrategy] =
    useState(false);

  const formClasses = classNames(styles.formContainer, 'sticky t-20 z-10 h-1 ');

  const handleOnDayClick = useCallback<OnDayClickHandler>((day) => {
    setSelection(day.date);
  }, []);

  return (
    <Stack gap={0} className={styles.eventFormCalendar}>
      {isTablet && (
        <>
          <Stack>
            <h3>Edytuj zawartość kalendarza</h3>
            <Stack gap={8} direction='horizontal'>
              <CalendarSettingsForm
                isTodayVisible={isTodayVisible}
                setIsTodayVisible={setIsTodayVisible}
                isPlanVisible={isPlanVisible}
                setIsPlanVisible={setIsPlanVisible}
                isContiniousDisplayStrategy={isContiniousDisplayStrategy}
                setIsContiniousDisplayStrategy={setIsContiniousDisplayStrategy}
                isWeekendsVisible={isWeekendsVisible}
                setIsWeekendsVisible={setIsWeekendsVisible}
                isAlternatingVisible={isAlternatingVisible}
                setIsAlternatingVisible={setIsAlternatingVisible}
                sliderValue={sliderValue}
                isTablet={isTablet}
                isMobile={isMobile}
              />
            </Stack>
          </Stack>

          <div className='sticky top-[64px] z-10 h-12 bg-gray-100 pt-3'>
            <CalendarSizeSlider
              step={1}
              showMarks={false}
              onChange={setSliderValue}
            />
          </div>
        </>
      )}

      <Stack direction='horizontal' gap={24}>
        <div className={styles.calendarContainer}>
          <Calendar
            startDate={startDate}
            rowSize={sliderValue}
            isTodayVisible={isTodayVisible}
            isPlanVisible={isPlanVisible}
            isWeekendsVisible={isWeekendsVisible}
            isAlternatingVisible={isAlternatingVisible}
            displayStrategy={
              isContiniousDisplayStrategy ? 'continous' : 'separateMonths'
            }
            events={ALTERNATING_DATES}
            onDayClick={handleOnDayClick}
            selection={selection}
          />
        </div>

        <div className={formClasses}>
          <Stack className={styles.p2}>
            <h3>Edytuj zawartość kalendarza</h3>
            {!isTablet && (
              <CalendarSizeSlider
                showMarks
                step={1}
                onChange={setSliderValue}
              />
            )}

            <div>
              <Stack gap={12} direction='horizontal'>
                <CalendarSettingsForm
                  isTodayVisible={isTodayVisible}
                  setIsTodayVisible={setIsTodayVisible}
                  isPlanVisible={isPlanVisible}
                  setIsPlanVisible={setIsPlanVisible}
                  isContiniousDisplayStrategy={isContiniousDisplayStrategy}
                  setIsContiniousDisplayStrategy={
                    setIsContiniousDisplayStrategy
                  }
                  isWeekendsVisible={isWeekendsVisible}
                  setIsWeekendsVisible={setIsWeekendsVisible}
                  isAlternatingVisible={isAlternatingVisible}
                  setIsAlternatingVisible={setIsAlternatingVisible}
                  sliderValue={sliderValue}
                  isTablet={isTablet}
                  isMobile={isMobile}
                />
              </Stack>
            </div>
          </Stack>
        </div>
      </Stack>
    </Stack>
  );
};
