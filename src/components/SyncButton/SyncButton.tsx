import { Button, Tooltip } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { PiCloudArrowDown, PiCloudArrowUp, PiSpinner } from 'react-icons/pi';
import { useSyncEvents } from '../../api/sync/useSyncEvents';
import { useAuth } from '../../auth/AuthContext';

export const SyncButton = () => {
  const { isAuthenticated } = useAuth();
  const { syncToRemote, syncFromRemote, forceSyncNow, status, canSync } =
    useSyncEvents();
  const [groupId, setGroupId] = useState<string | null>(null);

  // Get groupId from localStorage (set by SyncIntegration)
  useEffect(() => {
    if (!isAuthenticated) {
      setGroupId(null);
      return;
    }

    // Check localStorage for groupId set by SyncIntegration
    const storedGroupId = localStorage.getItem('currentGroupId');
    if (storedGroupId) {
      setGroupId(storedGroupId);
    }

    // Listen for storage changes (when SyncIntegration sets the groupId)
    const handleStorageChange = () => {
      const updatedGroupId = localStorage.getItem('currentGroupId');
      setGroupId(updatedGroupId);
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check periodically in case storage event doesn't fire
    const interval = setInterval(() => {
      const updatedGroupId = localStorage.getItem('currentGroupId');
      if (updatedGroupId !== groupId) {
        setGroupId(updatedGroupId);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [isAuthenticated, groupId]);

  const handleUpload = async () => {
    console.log('🔼 Upload clicked - canSync:', canSync, 'groupId:', groupId);

    if (!canSync) {
      console.error('❌ Cannot sync - not authenticated or DB not ready');
      return;
    }

    if (!groupId) {
      console.error('❌ Cannot sync - no groupId');
      return;
    }

    try {
      console.log('🚀 Forcing sync now...');
      await forceSyncNow();
      console.log('✅ Force sync completed');
    } catch (error) {
      console.error('❌ Upload failed:', error);
    }
  };

  const handleDownload = async () => {
    console.log('🔽 Download clicked - canSync:', canSync, 'groupId:', groupId);

    if (!canSync) {
      console.error('❌ Cannot sync - not authenticated or DB not ready');
      return;
    }

    if (!groupId) {
      console.error('❌ Cannot sync - no groupId');
      return;
    }

    try {
      console.log('📥 Downloading from group:', groupId);
      await syncFromRemote(groupId);
      console.log('✅ Download completed');
    } catch (error) {
      console.error('❌ Download failed:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <Tooltip content='Zaloguj się aby synchronizować'>
        <Button
          variant='light'
          size='sm'
          isDisabled
          startContent={<PiCloudArrowUp size={16} />}
        >
          Sync
        </Button>
      </Tooltip>
    );
  }

  return (
    <>
      <Tooltip content='Wyślij lokalne zmiany do chmury'>
        <Button
          variant='light'
          size='sm'
          onClick={handleUpload}
          isLoading={status.isLoading}
          isDisabled={!groupId}
          color={status.error ? 'danger' : 'default'}
          startContent={
            status.isLoading ? (
              <PiSpinner size={16} className='animate-spin' />
            ) : (
              <PiCloudArrowUp size={16} />
            )
          }
        >
          Upload
        </Button>
      </Tooltip>

      <Tooltip content='Pobierz zmiany z chmury'>
        <Button
          variant='light'
          size='sm'
          onClick={handleDownload}
          isLoading={status.isLoading}
          isDisabled={!groupId}
          color={status.error ? 'danger' : 'default'}
          startContent={
            status.isLoading ? (
              <PiSpinner size={16} className='animate-spin' />
            ) : (
              <PiCloudArrowDown size={16} />
            )
          }
        >
          Download
        </Button>
      </Tooltip>
    </>
  );
};
