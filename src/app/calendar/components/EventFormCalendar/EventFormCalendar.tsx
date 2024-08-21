'use client';

import { Calendar } from '@components/Calendar/Calendar';
import { Stack } from '@components/Stack/Stack';
import { Checkbox, Slider } from '@nextui-org/react';
import { dateFormat } from '@utils/dates';
import { useBreakpoints } from '@utils/useBreakpoints';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useCallback, useState } from 'react';
import styles from './EventFormCalendar.module.scss';

const opieka = [
  '2024-08-03',
  '2024-08-04',
  '2024-08-05',
  '2024-08-06',
  '2024-08-07',
  '2024-08-08',
  '2024-08-09',
  '2024-08-10',
  '2024-08-11',
  '2024-08-12',
  '2024-08-13',
  '2024-08-14',

  '2024-08-25',
  '2024-08-26',
  '2024-08-27',
  '2024-08-28',
  '2024-08-29',
  '2024-08-30',
  '2024-08-31',
  '2024-09-01',
  '2024-09-02',
  '2024-09-03',
  '2024-09-04',

  '2024-09-13',
  '2024-09-14',
  '2024-09-15',
  '2024-09-16',
  '2024-09-17',
  '2024-09-18',
  '2024-09-19',
  '2024-09-20',

  '2024-09-30',
  '2024-10-01',
  '2024-10-02',
  '2024-10-03',
  '2024-10-04',
  '2024-10-05',
  '2024-10-06',
  '2024-10-07',
  '2024-10-08',
  '2024-10-09',
];

interface EventFormCalendarProps {
  userName: string;
}

export const EventFormCalendar = (props: EventFormCalendarProps) => {
  const startDate = dayjs().format(dateFormat);
  const { isMobile, isTablet } = useBreakpoints();
  const [sliderValue, setSliderValue] = useState(7);
  const [isTodayVisible, setIsTodayVisible] = useState(true);
  const [isPlanVisible, setIsPlanVisible] = useState(false);
  const [isWeekendsVisible, setIsWeekendsVisible] = useState(true);
  const [isAlternatingVisible, setIsAlternatingVisible] = useState(true);
  const [isContiniousDisplayStrategy, setIsContiniousDisplayStrategy] =
    useState(false);

  const handleSliderChange = useCallback(
    (value: number | number[]) => {
      switch (value) {
        case 1:
          return setSliderValue(1);
        case 2:
          return setSliderValue(7);
        case 3:
          return setSliderValue(14);
      }
    },
    [setSliderValue]
  );

  const marks = [
    {
      label: '1',
      value: 1,
    },
    {
      label: '7',
      value: 2,
    },
    {
      label: '14',
      value: 3,
    },
  ];

  const formClasses = classNames(styles.formContainer, 'sticky t-20 z-10 h-1 ');
  const slider = (
    <Slider
      step={1}
      color='danger'
      marks={isTablet ? undefined : marks}
      showSteps
      minValue={1}
      maxValue={3}
      defaultValue={2}
      onChange={handleSliderChange}
      aria-label='slider'
    />
  );

  const checkboxes = (
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

  return (
    <Stack gap={0} className={styles.eventFormCalendar}>
      {isTablet && (
        <>
          <Stack>
            <h3>Edytuj zawartość kalendarza</h3>
            <Stack gap={8} direction='horizontal'>
              {checkboxes}
            </Stack>
          </Stack>

          <div className='sticky top-[64px] z-10 h-12 bg-gray-100 pt-3'>
            {slider}
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
            alternatingDates={opieka}
          />
        </div>

        <div className={formClasses}>
          <Stack className={styles.p2}>
            <h3>Edytuj zawartość kalendarza</h3>
            {!isTablet && slider}

            <Stack gap={8}>{checkboxes}</Stack>
          </Stack>
        </div>
      </Stack>
    </Stack>
  );
};
