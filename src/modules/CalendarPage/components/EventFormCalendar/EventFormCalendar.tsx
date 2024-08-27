'use client';

import { Calendar } from '@components/Calendar/Calendar';
import { CalendarItem } from '@components/Calendar/components/CalendarItem/CalendarItem';
import { Stack } from '@components/Stack/Stack';
import { ALTERNATING_DATES } from '@modules/CalendarPage/constants';
import { Input, Textarea } from '@nextui-org/input';
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

  const { selection, handleOnDayPointerDown, handleOnDayPointerUp } =
    useSelection({
      isMultiSelectionMode,
      setIsMultiSelectionMode,
    });

  const formClasses = classNames(styles.formContainer, 'sticky t-20 z-10 h-1 ');

  const bind = useLongPress(
    () => {
      setIsMultiSelectionMode(true);
    },
    {
      filterEvents: (event) => true, // All events can potentially trigger long press (same as 'undefined')
      threshold: 500, // In milliseconds
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
            <h3>Edycja zawartości kalendarza</h3>
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
            onDayPointerDown={handleOnDayPointerDown}
            onDayPointerUp={handleOnDayPointerUp}
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

              <Divider className='my-8' />

              <Stack>
                <h3 className='mt-0'>Nowy plan</h3>

                <Input
                  type='text'
                  label='Nazwa wydarzenia'
                  radius='sm'
                  variant='bordered'
                  size='lg'
                />
                <Textarea
                  radius='sm'
                  label='Opis wydarzenia'
                  variant='bordered'
                  size='lg'
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

              <Divider className='my-8' />

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
