'use client';

import PageContainer from '../components/PageContainer/PageContainer';
import { Stack } from '../components/Stack/Stack';
import { useFormReadUsersMutation } from '../components/db/users/useFormReadUsersMutation';

export default function CalendarPage() {
  const { data, isPending, isError, isSuccess } = useFormReadUsersMutation();

  return (
    <PageContainer>
      <h1>Cześć</h1>

      {isPending && <>Loading users</>}
      {isSuccess && data !== undefined && (
        <Stack>
          {data.map((user, index) => {
            return (
              <Stack direction='horizontal' key={`${user.id}-${index}`}>
                <div>{user.id}</div>
                <div>{user.name}</div>
                <div>{user.startDate}</div>
                <div>{user.countingRange}</div>
              </Stack>
            );
          })}
        </Stack>
      )}
    </PageContainer>
  );
}
