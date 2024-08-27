'use client';

import { Calendar } from '@components/Calendar/Calendar';
import PageContainer from '@components/PageContainer/PageContainer';
import { Stack } from '@components/Stack/Stack';
import { ALTERNATING_DATES } from '@modules/CalendarPage/constants';
import { useFormReadUsersMutation } from '@modules/db/users/useFormReadUsersMutation';
import { dateFormat } from '@utils/dates';
import dayjs from 'dayjs';

export default function Week() {
  const { data, isPending } = useFormReadUsersMutation();
  const startDate = dayjs().format(dateFormat);
  const startDay = dayjs(startDate).startOf('month').clone().startOf('week');

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
          startDate={startDay.format(dateFormat)}
          endDate={startDay.add(5, 'week').format(dateFormat)}
          rowSize={7}
          isTodayVisible
          isWeekendsVisible
          isAlternatingVisible
          displayStrategy='separateMonths'
          events={ALTERNATING_DATES}
        />
      </Stack>
    </PageContainer>
  );
}
