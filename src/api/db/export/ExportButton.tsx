import { Button } from '@nextui-org/react';
import { PiExport } from 'react-icons/pi';
import { useExportEvents } from './useExportEvents';

const ExportButton = () => {
  const { exportEventsToFile } = useExportEvents();

  return (
    <div>
      <Button onClick={exportEventsToFile}>
        Exsportuj eventy
        <PiExport size={24} />
      </Button>
    </div>
  );
};

export default ExportButton;
