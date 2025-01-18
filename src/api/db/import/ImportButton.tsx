import { Stack } from '@components/Stack/Stack';
import { Button } from '@nextui-org/react';
import React, { useRef } from 'react';
import { GrUploadOption } from 'react-icons/gr';
import { useImportEvents } from './useImportEvents';

const ImportButton = () => {
  const { importEventsFromFile } = useImportEvents();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importEventsFromFile(file); // Importujemy dane z wybranego pliku
    }
  };

  return (
    <Stack gap={16}>
      <div>
        <input
          ref={fileInputRef}
          type='file'
          accept='.json'
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>
      <div>
        <Button onClick={() => fileInputRef.current?.click()}>
          Wybierz plik do importu
          <GrUploadOption size={24} />
        </Button>
      </div>
    </Stack>
  );
};

export default ImportButton;
