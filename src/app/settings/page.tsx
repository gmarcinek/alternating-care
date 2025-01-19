'use client';

import ExportButton from '@api/db/export/ExportButton';
import ImportButton from '@api/db/import/ImportButton';
import PageContainer from '@components/PageContainer/PageContainer';
import { Stack } from '@components/Stack/Stack';
import DeleteDataBaseButton from './DeleteDataBaseButton';

export default function UserForm() {
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

        <Stack gap={16}>
          <h2>Wyczyść bazę danych</h2>
          <div>
            <DeleteDataBaseButton />
          </div>
        </Stack>
      </Stack>
    </PageContainer>
  );
}
