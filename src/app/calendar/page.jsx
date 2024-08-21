'use client';

import PageContainer from '@components/PageContainer/PageContainer';
import { useFormReadUsersMutation } from '@modules/db/users/useFormReadUsersMutation';
import { EventFormCalendar } from './components/EventFormCalendar/EventFormCalendar';

export default function CalendarPage() {
  const { data, isPending } = useFormReadUsersMutation();

  if (isPending) {
    return <PageContainer>Ładowanie</PageContainer>;
  }

  const user = data.at(0);

  return (
    <PageContainer>
      <EventFormCalendar user={user?.name} />
    </PageContainer>
  );
}
