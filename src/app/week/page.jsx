'use client';

import { Calendar } from '@/src/components/Calendar/Calendar';
import PageContainer from '@/src/components/PageContainer/PageContainer';
import { Stack } from '@/src/components/Stack/Stack';
import { useFormReadUsersMutation } from '@/src/modules/db/users/useFormReadUsersMutation';
import { dateFormat } from '@/src/utils/dates';
import dayjs from 'dayjs';

export default function Week() {
  const { data, isPending } = useFormReadUsersMutation();
  const startDate = dayjs().format(dateFormat);

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

        <Calendar
          startDate={dayjs(startDate).startOf('week')}
          endDate={dayjs(startDate).add(1, 'week').format(dateFormat)}
          rowSize={7}
          isTodayVisible
          isPlanVisible
          isWeekendsVisible
          isAlternatingVisible
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
