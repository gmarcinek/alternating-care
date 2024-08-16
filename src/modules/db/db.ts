import { openDB } from 'idb';
import { useCallback, useEffect, useState } from 'react';
import { dbName, dbVersion } from './constants';
import { AlternatingCareDBSchema } from './schema';

export const useInitDb = () => {
  const [isReady, setIsReady] = useState(false);

  const initiateDb = useCallback(async () => {
    const db = await openDB<AlternatingCareDBSchema>(dbName, dbVersion, {
      upgrade: (db) => {
        const userStore = db.createObjectStore('users', {
          keyPath: 'id',
        });
        userStore.createIndex('by-id', 'id', { unique: true });
        userStore.createIndex('by-name', 'name');
        userStore.createIndex('by-startDate', 'startDate');
        userStore.createIndex('by-countingRange', 'countingRange');

        const eventStore = db.createObjectStore('events', {
          keyPath: 'id',
        });
        eventStore.createIndex('by-id', 'id', { unique: true });
        eventStore.createIndex('by-date', 'date');
        eventStore.createIndex('by-type', 'type');
        eventStore.createIndex('by-issuer', 'issuer');
      },
    });

    setIsReady(true);
    db.close();
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    if (isReady) {
      return;
    }

    if (isSubscribed) {
      initiateDb().catch(console.error);
    }

    return () => {
      isSubscribed = false;
    };
  }, []);

  return { isReady };
};
