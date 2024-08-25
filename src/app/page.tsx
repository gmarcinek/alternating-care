'use client';

import { Calendar } from '@components/Calendar/Calendar';
import PageContainer from '@components/PageContainer/PageContainer';
import { Stack } from '@components/Stack/Stack';
import { useFormReadUsersMutation } from '@modules/db/users/useFormReadUsersMutation';
import { dateFormat } from '@utils/dates';
import dayjs from 'dayjs';

export default function Home() {
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
          startDate={startDate}
          endDate={dayjs(startDate).add(4, 'week').format(dateFormat)}
          rowSize={7}
          isTodayVisible
          isPlanVisible={false}
          isWeekendsVisible
          isAlternatingVisible
          events={[]}
        />
        <h3>Lista wszystkich wydarzeń na 4 tygodnie</h3>
      </Stack>
    </PageContainer>
  );
}
