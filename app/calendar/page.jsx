'use client';

import PageContainer from '../components/PageContainer/PageContainer';
import { useUsers } from '../components/db/indexedDB';

export default function CalendarPage() {
  const {data, error, isLoading} = useUsers({
    onSuccess: (data) => {
      console.log(data)
    }
  });

  return (
    <PageContainer>
      <h1>Calendar Page</h1>
      <pre><code>{JSON.stringify(data, null, 2)}</code></pre>
    </PageContainer>
  );
}
