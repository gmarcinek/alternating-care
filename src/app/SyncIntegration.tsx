/**
 * Enterprise Sync Integration Component
 * Automatically starts background sync when authenticated
 */

'use client';

import { apiClient } from '@api/sync/apiClient';
import { useSyncEvents } from '@api/sync/useSyncEvents';
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

export function SyncIntegration() {
  const { isAuthenticated, user } = useAuth();
  const { startBackgroundSync, stopBackgroundSync, autoSyncIfEmpty, status } =
    useSyncEvents();
  const [groupId, setGroupId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch user's group when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setGroupId(null);
      setIsInitialized(false);
      stopBackgroundSync();
      return;
    }

    const fetchGroup = async () => {
      try {
        console.log('🔍 Fetching user groups...');
        console.log(
          'API_BASE:',
          process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'
        );
        console.log(
          'Token exists:',
          !!localStorage.getItem(
            process.env.NEXT_PUBLIC_TOKEN_KEY || 'auth_token'
          )
        );

        const groups = await apiClient.getMyGroups();
        console.log('📦 Groups received:', groups);

        if (groups.length > 0) {
          const primaryGroupId = groups[0].id;
          setGroupId(primaryGroupId);
          localStorage.setItem('currentGroupId', primaryGroupId);
          console.log(
            `✅ Found group: ${primaryGroupId}, Name: ${groups[0].name}`
          );
        } else {
          console.warn('⚠️ No groups found - user may need to create one');
        }
      } catch (error) {
        console.error('❌ Failed to fetch groups:', error);
        console.error(
          'Error details:',
          error instanceof Error ? error.message : error
        );
      }
    };

    fetchGroup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 SyncIntegration unmounting - stopping sync');
      stopBackgroundSync();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start background sync and initial download when groupId is available
  useEffect(() => {
    if (!groupId || !isAuthenticated || isInitialized) {
      return;
    }

    let cancelled = false;

    const initializeSync = async () => {
      try {
        console.log('🔄 Initializing sync for group:', groupId);

        // First, check if we need to download events (empty local DB)
        const didAutoSync = await autoSyncIfEmpty(groupId);

        if (cancelled) return;

        if (didAutoSync) {
          console.log('📥 Downloaded initial events from server');
        } else {
          console.log('ℹ️ Local DB not empty, skipping initial download');
        }

        // Start background sync worker
        console.log(`🚀 Starting enterprise sync for group: ${groupId}`);
        startBackgroundSync(groupId);
        console.log('✅ Background sync worker started successfully');

        setIsInitialized(true);
      } catch (error) {
        if (cancelled) return;
        console.error('❌ Failed to initialize sync:', error);
        console.error('Error stack:', error);
      }
    };

    initializeSync();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, isAuthenticated]);

  // Log sync status changes for debugging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Sync Status:', {
        state: status.workerState,
        queueSize: status.queueSize,
        lastSync: status.lastSync,
        stats: status.syncStats,
      });
    }
  }, [status]);

  return null; // This is a logic-only component
}
