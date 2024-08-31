import { IDBPDatabase, openDB } from 'idb';
import { useCallback, useEffect, useRef, useState } from 'react';
import { dbName, dbVersion } from './constants';
import { AlternatingCareDBSchema } from './schema';

/**
 * Initializes the database and returns the state of readiness, database instance, and any potential error.
 *
 * @returns An object containing the state of readiness, database instance, and error.
 */
export const useInitDb = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [dbInstance, setDbInstance] =
    useState<IDBPDatabase<AlternatingCareDBSchema> | null>(null);
  const isSubscribedRef = useRef(true);

  const initiateDb = useCallback(async () => {
    try {
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
          eventStore.createIndex('by-groupId', 'groupId');
          eventStore.createIndex('by-date', 'date');
          eventStore.createIndex('by-type', 'type');
          eventStore.createIndex('by-issuer', 'issuer');
        },
      });

      if (isSubscribedRef.current) {
        setDbInstance(db);
        setIsReady(true);
      } else {
        db.close(); // Zamykamy bazę, jeśli komponent jest już odmontowany
      }
    } catch (err) {
      if (isSubscribedRef.current) {
        setIsError(true);
        setError(err as Error); // Zapisujemy błąd do stanu, aby można go było wyświetlić
      }
      console.error('Failed to initialize the database:', err);
    }
  }, []);

  useEffect(() => {
    isSubscribedRef.current = true;

    if (!isReady) {
      initiateDb();
    }

    return () => {
      isSubscribedRef.current = false;

      if (dbInstance) {
        dbInstance.close();
      }
    };
  }, [initiateDb, isReady, dbInstance]);

  return { isReady, dbInstance, isError, error };
};
