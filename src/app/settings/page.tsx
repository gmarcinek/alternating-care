'use client';

import ExportButton from '@api/db/export/ExportButton';
import { useExportEvents } from '@api/db/export/useExportEvents';
import ImportButton from '@api/db/import/ImportButton';
import PageContainer from '@components/PageContainer/PageContainer';
import { Stack } from '@components/Stack/Stack';

export default function UserForm() {
  const { exportEventsToFile } = useExportEvents();

  return (
    <PageContainer>
      <Stack gap={64}>
        <Stack gap={16}>
          <h2>Import wydarzeń z pliku JSON</h2>
          <ImportButton />
        </Stack>

        <Stack gap={16}>
          <h2>Export wydarzeń do pliku JSON</h2>
          <div>
            <ExportButton />
          </div>
        </Stack>
      </Stack>
    </PageContainer>
  );
}
