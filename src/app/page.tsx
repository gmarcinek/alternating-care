'use client';

import { Calendar } from '@components/Calendar/Calendar';
import { CalendarItem } from '@components/Calendar/components/CalendarItem/CalendarItem';
import { Stack } from '@components/Stack/Stack';
import { ALTERNATING_DATES } from '@modules/CalendarPage/constants';
import { Divider } from '@nextui-org/react';
import { dateFormat } from '@utils/dates';
import { useBreakpoints } from '@utils/useBreakpoints';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useState } from 'react';

import PageContainer from '@components/PageContainer/PageContainer';
import { CalendarSettingsForm } from '@modules/CalendarPage/components/CalendarSettingsForm/CalendarSettingsForm';
import { CalendarSizeSlider } from '@modules/CalendarPage/components/CalendarSizeSlider/CalendarSizeSlider';
import { useSelection } from '@modules/CalendarPage/components/EventFormCalendar/useSelection';
import styles from './page.module.scss';

export default function Page() {
  const startDate = dayjs().format(dateFormat);
  const { isTablet } = useBreakpoints();

  const [sliderValue, setSliderValue] = useState(7);
  const [isTodayVisible, setIsTodayVisible] = useState(true);
  const [isPlanVisible, setIsPlanVisible] = useState(false);
  const [isWeekendsVisible, setIsWeekendsVisible] = useState(true);
  const [isAlternatingVisible, setIsAlternatingVisible] = useState(true);
  const [isContiniousDisplayStrategy, setIsContiniousDisplayStrategy] =
    useState(false);

  const { selection, handleOnDayPointerDown, handleOnDayPointerUp } =
    useSelection({});

  const formClasses = classNames(styles.formContainer, 'sticky t-20 z-10 h-1 ');

  return (
    <PageContainer>
      <Stack gap={0} className={styles.eventFormCalendar}>
        {isTablet && (
          <>
            <Stack>
              <h3>Przegląd</h3>
              <Stack gap={8} direction='horizontal'>
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
              onDayPointerDown={handleOnDayPointerDown}
              onDayPointerUp={handleOnDayPointerUp}
              selection={Array.from(selection)}
              isMultiSelectionMode={false}
            />
          </div>

          <div className={formClasses}>
            <Stack className={styles.calendarDetails}>
              <h3>Przegląd</h3>
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
    </PageContainer>
  );
}
