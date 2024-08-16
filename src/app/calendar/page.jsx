'use client';

import { Calendar } from '@/src/components/Calendar/Calendar';
import PageContainer from '@/src/components/PageContainer/PageContainer';
import { Stack } from '@/src/components/Stack/Stack';
import { useFormReadUsersMutation } from '@/src/modules/db/users/useFormReadUsersMutation';
import { dateFormat } from '@/src/utils/dates';
import { Slider } from '@nextui-org/slider';
import dayjs from 'dayjs';
import { useState } from 'react';

export default function CalendarPage() {
  const { data, isPending } = useFormReadUsersMutation();
  const [sliderValue, setSliderValue] = useState(7);
  const startDate = dayjs().format(dateFormat);

  if (isPending) {
    return <>ładowanie</>;
  }

  const user = data.at(0);

  return (
    <PageContainer>
      <h1>
        Cześć <span>{user?.name}</span>
      </h1>

      <Slider
        size='md'
        step={1}
        color='danger'
        label='Widok'
        showSteps
        maxValue={14}
        minValue={1}
        defaultValue={7}
        className='max-w-xl'
        onChange={setSliderValue}
      />

      <Stack>
        <Calendar
          startDate={startDate}
          countingRange={sliderValue}
          rowSize={sliderValue}
        />
      </Stack>
    </PageContainer>
  );
}
