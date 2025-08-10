import { Button, Tooltip } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { PiCloudArrowDown, PiCloudArrowUp, PiSpinner } from 'react-icons/pi';
import { apiClient } from '../../api/sync/apiClient';
import { useSyncEvents } from '../../api/sync/useSyncEvents';
import { useAuth } from '../../auth/AuthContext';

export const SyncButton = () => {
  const { isAuthenticated } = useAuth();
  const { syncToRemote, syncFromRemote, autoSyncIfEmpty, status, canSync } =
    useSyncEvents();
  const [groupId, setGroupId] = useState<string | null>(null);

  // Get user's group (should exist after register)
  useEffect(() => {
    if (!isAuthenticated) return;

    const getGroup = async () => {
      try {
        console.log('Fetching groups for authenticated user...');
        const groups = await apiClient.getMyGroups();
        console.log('Groups found:', groups);

        if (groups.length > 0) {
          setGroupId(groups[0].id);
          console.log('Set groupId:', groups[0].id);
        } else {
          console.warn('No group found - user should register first');
        }
      } catch (error) {
        console.error('Failed to get groups:', error);
      }
    };

    getGroup();
  }, [isAuthenticated]);

  // Auto-sync ONLY if group already exists and calendar empty
  useEffect(() => {
    if (!groupId || !canSync) return;

    let isCancelled = false;

    const doAutoSync = async () => {
      try {
        const didAutoSync = await autoSyncIfEmpty(groupId);
        if (!isCancelled && didAutoSync) {
          console.log('Auto-sync completed for returning user');
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Auto-sync failed:', error);
        }
      }
    };

    doAutoSync();

    return () => {
      isCancelled = true;
    };
  }, [groupId, canSync]);

  const handleUpload = async () => {
    if (!canSync || !groupId) return;

    try {
      await syncToRemote(groupId);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleDownload = async () => {
    if (!canSync || !groupId) return;

    try {
      await syncFromRemote(groupId);
    } catch (error) {
      console.error('Download failed:', error);
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
