'use client';

import { Calendar } from '@/src/components/Calendar/Calendar';
import PageContainer from '@/src/components/PageContainer/PageContainer';
import { Stack } from '@/src/components/Stack/Stack';
import { useFormReadUsersMutation } from '@/src/modules/db/users/useFormReadUsersMutation';
import { dateFormat } from '@/src/utils/dates';
import { useBreakpoints } from '@/src/utils/useBreakpoints';
import { Checkbox } from '@nextui-org/checkbox';
import { Divider } from '@nextui-org/divider';
import { Slider } from '@nextui-org/slider';
import dayjs from 'dayjs';
import { useCallback, useState } from 'react';

export default function CalendarPage() {
  const { isMobile } = useBreakpoints();
  const { data, isPending } = useFormReadUsersMutation();
  const [sliderValue, setSliderValue] = useState(7);

  const [isTodayVisible, setIsTodayVisible] = useState(true);
  const [isPlanVisible, setIsPlanVisible] = useState(false);
  const [isContiniousDisplayStrategy, setIsContiniousDisplayStrategy] =
    useState(true);
  const [isWeekendsVisible, setIsWeekendsVisible] = useState(true);
  const [isAlternatingVisible, setIsAlternatingVisible] = useState(true);

  const startDate = dayjs().format(dateFormat);

  const handleSliderChange = useCallback(
    (value) => {
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

  if (isPending) {
    return <PageContainer>Ładowanie</PageContainer>;
  }

  const user = data.at(0);

  return (
    <PageContainer>
      <Stack gap={24}>
        <h2>
          Cześć <span>{user?.name}</span>
        </h2>

        <Stack className='wrap sticky top-16 z-10 h-10 bg-gray-100 pb-2 pt-5'>
          <Stack direction='horizontal' className='flex flex-wrap'>
            <Checkbox
              defaultSelected={isTodayVisible}
              onValueChange={setIsTodayVisible}
            >
              Dziś
            </Checkbox>
            <Checkbox
              defaultSelected={isPlanVisible}
              onValueChange={setIsPlanVisible}
            >
              Plan
            </Checkbox>
            <Checkbox
              defaultSelected={isContiniousDisplayStrategy}
              onValueChange={setIsContiniousDisplayStrategy}
              isDisabled={sliderValue !== 7}
            >
              Łącz miesiące
            </Checkbox>
            <Checkbox
              defaultSelected={isWeekendsVisible}
              onValueChange={setIsWeekendsVisible}
            >
              Weekendy
            </Checkbox>
            <Checkbox
              defaultSelected={isAlternatingVisible}
              onValueChange={setIsAlternatingVisible}
            >
              Opieka
            </Checkbox>
            <Divider orientation='vertical' />
          </Stack>

          <Slider
            size={isMobile ? 'md' : 'lg'}
            step={1}
            color='danger'
            marks={marks}
            showSteps
            minValue={1}
            maxValue={3}
            defaultValue={2}
            onChange={handleSliderChange}
            aria-label='slider'
          />
        </Stack>

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
          alternatingDates={[
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
          ]}
        />
      </Stack>
    </PageContainer>
  );
}
