import React, { useRef } from 'react';
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
    <div>
      <input
        ref={fileInputRef}
        type='file'
        accept='.json'
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <button onClick={() => fileInputRef.current?.click()}>
        Wybierz plik do importu
      </button>
    </div>
  );
};

export default ImportButton;
