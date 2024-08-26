'use client';

import { ALTERNATING_DATES } from '@app/calendar/constants';
import { Calendar } from '@components/Calendar/Calendar';
import { CalendarItem } from '@components/Calendar/components/CalendarItem/CalendarItem';
import { Stack } from '@components/Stack/Stack';
import { Divider } from '@nextui-org/react';
import { dateFormat } from '@utils/dates';
import { useBreakpoints } from '@utils/useBreakpoints';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useLongPress } from 'use-long-press';
import { CalendarSettingsForm } from '../CalendarSettingsForm/CalendarSettingsForm';
import { CalendarSizeSlider } from '../CalendarSizeSlider/CalendarSizeSlider';
import styles from './EventFormCalendar.module.scss';
import { useSelection } from './useSelection';

interface EventFormCalendarProps {
  userName: string;
}

export const EventFormCalendar = (props: EventFormCalendarProps) => {
  const startDate = dayjs().format(dateFormat);
  const { isTablet } = useBreakpoints();
  const [isMultiSelectionMode, setIsMultiSelectionMode] = useState(false);
  const [sliderValue, setSliderValue] = useState(7);
  const [isTodayVisible, setIsTodayVisible] = useState(true);
  const [isPlanVisible, setIsPlanVisible] = useState(false);
  const [isWeekendsVisible, setIsWeekendsVisible] = useState(true);
  const [isAlternatingVisible, setIsAlternatingVisible] = useState(true);
  const [isContiniousDisplayStrategy, setIsContiniousDisplayStrategy] =
    useState(false);

  const { selection, handleOnDayClick } = useSelection({
    isMultiSelectionMode,
    setIsMultiSelectionMode,
  });

  const formClasses = classNames(styles.formContainer, 'sticky t-20 z-10 h-1 ');

  const bind = useLongPress(
    () => {
      setIsMultiSelectionMode(true);
    },
    {
      // onStart: (event) => console.log('Press started'),
      // onFinish: (event) => console.log('Long press finished'),
      // onCancel: (event) => console.log('Press cancelled'),
      // onMove: (event) => console.log('Detected mouse or touch movement'),
      filterEvents: (event) => true, // All events can potentially trigger long press (same as 'undefined')
      threshold: 400, // In milliseconds
      captureEvent: true, // Event won't get cleared after React finish processing it
      cancelOnMovement: 25, // Square side size (in pixels) inside which movement won't cancel long press
      cancelOutsideElement: true, // Cancel long press when moved mouse / pointer outside element while pressing
    }
  );

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
        <div className={styles.calendarContainer} {...bind()}>
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
            selection={Array.from(selection)}
            isMultiSelectionMode={isMultiSelectionMode}
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
                />
              </Stack>

              <Divider className='my-4' />

              <Stack>
                <h3>Nowy plan</h3>
                <input
                  type='text'
                  name='name'
                  placeholder='Nazwa'
                  className='block rounded-md border-0 py-4 pl-4 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
                <textarea
                  placeholder='Opis wydarzenia'
                  className='block rounded-md border-0 py-4 pl-4 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
                <Stack direction='horizontal'>
                  <label>
                    Kolor tła
                    <input
                      type='color'
                      name='background'
                      placeholder='Kolor tła'
                      defaultValue='#00A9FD'
                      className='block border-0 text-gray-900 ring-1 ring-inset ring-gray-300'
                    />
                  </label>

                  <label>
                    Kolor tekstu
                    <input
                      type='color'
                      name='textColor'
                      defaultValue='#ffffff'
                      placeholder='Kolor tekstu'
                      className='block border-0 text-gray-900 ring-1 ring-inset ring-gray-300'
                    />
                  </label>
                </Stack>
              </Stack>

              <Divider className='my-4' />

              <Stack>
                {selection.size !== 0 && (
                  <h3>Przegląd zaplanowanych wydarzeń</h3>
                )}
                {Array.from(selection).map((item, index) => {
                  return (
                    <CalendarItem
                      day={{
                        date: item,
                      }}
                      key={`${item}-${index}`}
                    />
                  );
                })}
              </Stack>
            </div>
          </Stack>
        </div>
      </Stack>
    </Stack>
  );
};
