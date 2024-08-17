'use client';

import { Calendar } from '@/src/components/Calendar/Calendar';
import PageContainer from '@/src/components/PageContainer/PageContainer';
import { Stack } from '@/src/components/Stack/Stack';
import { useFormReadUsersMutation } from '@/src/modules/db/users/useFormReadUsersMutation';
import { dateFormat } from '@/src/utils/dates';
import { Checkbox } from '@nextui-org/checkbox';
import { Divider } from '@nextui-org/divider';
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
            marks={[
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
            ]}
            showSteps
            minValue={1}
            maxValue={4}
            defaultValue={2}
            onChange={(value) => {
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
            }}
          />
          <Divider orientation='vertical' />
          <Checkbox defaultSelected size='lg'>
            Oddziel miesiące
          </Checkbox>
        </Stack>

        <Divider className='my-0' />

        <Calendar
          startDate={startDate}
          countingRange={sliderValue}
          rowSize={sliderValue}
        />
      </Stack>
    </PageContainer>
  );
}
