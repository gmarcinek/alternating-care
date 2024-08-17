'use client';

import { Calendar } from '@/src/components/Calendar/Calendar';
import PageContainer from '@/src/components/PageContainer/PageContainer';
import { Stack } from '@/src/components/Stack/Stack';
import { useFormReadUsersMutation } from '@/src/modules/db/users/useFormReadUsersMutation';
import { dateFormat } from '@/src/utils/dates';
import { Divider } from '@nextui-org/divider';
import { Slider } from '@nextui-org/slider';
import dayjs from 'dayjs';
import { useCallback, useState } from 'react';

export default function CalendarPage() {
  const { data, isPending } = useFormReadUsersMutation();
  const [sliderValue, setSliderValue] = useState(7);
  const startDate = dayjs().format(dateFormat);

  const handleSliderChange = useCallback(
    (value) => {
      switch (value) {
        case 1:
          return setSliderValue(1);
        case 2:
          return setSliderValue(7);
        case 3:
          return setSliderValue(10);
        case 4:
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
      label: '10',
      value: 3,
    },
    {
      label: '14',
      value: 4,
    },
  ];

  if (isPending) {
    return <>ładowanie</>;
  }

  const user = data.at(0);

  return (
    <PageContainer>
      <Stack gap={48}>
        <h2>
          Cześć <span>{user?.name}</span>
        </h2>

        <Stack direction='horizontal'>
          <Slider
            className='max-w-xl'
            size='md'
            step={1}
            color='danger'
            marks={marks}
            showSteps
            minValue={1}
            maxValue={4}
            defaultValue={2}
            onChange={handleSliderChange}
            aria-label='slider'
          />
          <Divider orientation='vertical' />
        </Stack>

        <Divider className='my-0' />

        <Calendar startDate={startDate} rowSize={sliderValue} />
      </Stack>
    </PageContainer>
  );
}
