import { SyncWorkerState } from '@api/sync/BackgroundSyncWorker';
import { useSyncEvents } from '@api/sync/useSyncEvents';
import React, { useEffect, useState } from 'react';
import styles from './SyncStatusIndicator.module.scss';

interface SyncStatusIndicatorProps {
  showDetails?: boolean;
  compact?: boolean;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  showDetails = false,
  compact = false,
}) => {
  const { status, getSyncStats, getPendingOperations } = useSyncEvents();
  const [syncStats, setSyncStats] = useState(getSyncStats());
  const [isExpanded, setIsExpanded] = useState(false);

  // Update stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStats(getSyncStats());
    }, 1000);

    return () => clearInterval(interval);
  }, [getSyncStats]);

  if (!syncStats && !showDetails) return null;

  const getStateIcon = () => {
    switch (status.workerState) {
      case SyncWorkerState.SYNCING:
        return '🔄';
      case SyncWorkerState.IDLE:
        return status.queueSize > 0 ? '⏱️' : '✅';
      case SyncWorkerState.PAUSED:
        return '⏸️';
      case SyncWorkerState.ERROR:
        return '❌';
      default:
        return '⚪';
    }
  };

  const getStateLabel = () => {
    switch (status.workerState) {
      case SyncWorkerState.SYNCING:
        return 'Syncing...';
      case SyncWorkerState.IDLE:
        return status.queueSize > 0 ? 'Pending' : 'Synced';
      case SyncWorkerState.PAUSED:
        return 'Paused';
      case SyncWorkerState.ERROR:
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getNextSyncIn = () => {
    if (!syncStats?.nextSyncTime) return null;
    const diff = syncStats.nextSyncTime - Date.now();
    if (diff < 0) return 'Now';
    return `${Math.ceil(diff / 1000)}s`;
  };

  if (compact) {
    return (
      <div className={styles.compact} title={getStateLabel()}>
        <span className={styles.icon}>{getStateIcon()}</span>
        {status.queueSize > 0 && (
          <span className={styles.badge}>{status.queueSize}</span>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        <span className={styles.icon}>{getStateIcon()}</span>
        <span className={styles.label}>{getStateLabel()}</span>
        {status.queueSize > 0 && (
          <span className={styles.queue}>({status.queueSize} pending)</span>
        )}
        {showDetails && (
          <span className={styles.toggle}>{isExpanded ? '▼' : '▶'}</span>
        )}
      </div>

      {showDetails && isExpanded && syncStats && (
        <div className={styles.details}>
          <div className={styles.row}>
            <span>Last Sync:</span>
            <span>{formatTime(syncStats.lastSyncTime)}</span>
          </div>
          <div className={styles.row}>
            <span>Next Sync:</span>
            <span>{getNextSyncIn() || 'N/A'}</span>
          </div>
          <div className={styles.row}>
            <span>Total Syncs:</span>
            <span>{syncStats.totalSyncs}</span>
          </div>
          <div className={styles.row}>
            <span>Success Rate:</span>
            <span>
              {syncStats.totalSyncs > 0
                ? Math.round(
                    (syncStats.successfulSyncs / syncStats.totalSyncs) * 100
                  )
                : 0}
              %
            </span>
          </div>
          <div className={styles.row}>
            <span>Uploaded:</span>
            <span>{syncStats.eventsUploaded} events</span>
          </div>
          <div className={styles.row}>
            <span>Downloaded:</span>
            <span>{syncStats.eventsDownloaded} events</span>
          </div>
          <div className={styles.row}>
            <span>Queue Size:</span>
            <span>{syncStats.queueSize} operations</span>
          </div>
        </div>
      )}
    </div>
  );
};
