import { IDBPDatabase, openDB } from 'idb';
import { useCallback, useEffect, useRef, useState } from 'react';
import { dbName, dbVersion } from './constants';
import { AlternatingCareDBSchema } from './schema';

/**
 * Inicjalizuje bazę danych IndexedDB i zwraca stan gotowości, instancję bazy danych oraz ewentualne błędy.
 *
 * Hak ten wykorzystuje bibliotekę `idb` do obsługi bazy danych IndexedDB oraz zarządza cyklem życia
 * komponentu, aby upewnić się, że baza danych jest poprawnie zainicjalizowana i zamknięta, gdy komponent
 * jest odmontowany.
 *
 * @returns {Object} Obiekt zawierający:
 * - `isReady` (boolean): `true`, jeśli baza danych została pomyślnie zainicjalizowana, `false` w przeciwnym razie.
 * - `dbInstance` (IDBPDatabase<AlternatingCareDBSchema> | null): Instancja bazy danych, jeśli została poprawnie zainicjalizowana; `null`, jeśli nie.
 * - `isError` (boolean): `true`, jeśli wystąpił błąd podczas inicjalizacji bazy danych, `false` w przeciwnym razie.
 * - `error` (Error | null): Obiekt błędu, jeśli wystąpił błąd podczas inicjalizacji bazy danych; `null`, jeśli nie wystąpił.
 *
 * @example
 * // Przykład użycia haka
 * import React, { useEffect } from 'react';
 * import { useInitDb } from './useInitDb'; // Załóżmy, że hak jest zapisany w pliku `useInitDb.ts`
 *
 * const MyComponent: React.FC = () => {
 *   const { isReady, dbInstance, isError, error } = useInitDb();
 *
 *   useEffect(() => {
 *     if (isReady && dbInstance) {
 *       // Można teraz korzystać z dbInstance
 *       console.log('Baza danych jest gotowa', dbInstance);
 *     }
 *   }, [isReady, dbInstance]);
 *
 *   if (isError) {
 *     return <div>Wystąpił błąd podczas inicjalizacji bazy danych: {error?.message}</div>;
 *   }
 *
 *   return <div>Stan bazy danych: {isReady ? 'Gotowa' : 'Niegotowa'}</div>;
 * };
 *
 * export default MyComponent;
 */
export const useInitDb = () => {
  // Stan gotowości bazy danych
  const [isReady, setIsReady] = useState(false);

  // Stan błędu
  const [error, setError] = useState<Error | null>(null);
  const [isError, setIsError] = useState<boolean>(false);

  // Instancja bazy danych
  const [dbInstance, setDbInstance] =
    useState<IDBPDatabase<AlternatingCareDBSchema> | null>(null);

  // Ref do śledzenia, czy komponent jest zamontowany
  const isSubscribedRef = useRef(true);

  // Funkcja inicjalizująca bazę danych
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

  // Efekt uruchamiający funkcję inicjalizacji bazy danych
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
