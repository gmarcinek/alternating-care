import { useEffect, useState } from 'react';

let request: IDBOpenDBRequest | undefined;
let db: IDBDatabase | null = null;
let version = 1;

export enum UserRole {
  Holder = 'HOLDER',
  Parent = 'PARENT',
  Child = 'CHILD',
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  startCountDate: string;
  countingRange: string;
  role: string;
}

export enum CalendarEventType {
  Alternating = 'ALTERNATING',
  Event = 'EVENT',
}

export interface CalendarEvent {
  id: string;
  date: string;
  type: CalendarEventType;
  isuer: string;
}

export enum Stores {
  Users = 'users',
  Events = 'events',
}

export const initDB = (): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    // Open connection
    const request = indexedDB.open('alternatingCareDatabase', version);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // create users schema
      if (!db.objectStoreNames.contains(Stores.Users)) {
        const userStore = db.createObjectStore('users', { keyPath: 'id' });

        userStore.createIndex('firstName', 'firstname', { unique: false });
        userStore.createIndex('lastName', 'lastname', { unique: false });
        userStore.createIndex('email', 'email', { unique: true });
        userStore.createIndex('startCountDate', 'startcountdate', {
          unique: false,
        });
        userStore.createIndex('countingRange', 'countingrange', {
          unique: false,
        });
        userStore.createIndex('role', 'role', { unique: false });
      }

      // create events schema
      if (!db.objectStoreNames.contains(Stores.Events)) {
        const eventsStore = db.createObjectStore(Stores.Events, {
          keyPath: 'id',
        });
        eventsStore.createIndex('date', 'date', { unique: false });
        eventsStore.createIndex('type', 'type', { unique: false });
        eventsStore.createIndex('isuer', 'isuer', { unique: false });
      }
    };

    request.onsuccess = (event: Event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      version = db.version;
      console.log('request.onsuccess - initDB', version);
      resolve(true);
    };

    request.onerror = (event: Event) => {
      resolve(false);
    };
  });
};

export const addData = <T>(
  storeName: Stores,
  data: T
): Promise<T | string | null> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('alternatingCareDatabase', version);

    request.onsuccess = () => {
      console.log('request.onsuccess - addData', data);

      const db = request.result;
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      store.put(data);

      transaction.oncomplete = () => {
        resolve(data);
      };

      transaction.onerror = (event: Event) => {
        reject();
      };
    };

    request.onerror = () => {
      if (!request) {
        return;
      }

      const error = request.error?.message;
      if (error) {
        resolve(error);
      } else {
        resolve('Nieznany błąd');
      }
    };
  });
};

export const getStoreData = <T>(storeName: Stores): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('alternatingCareDatabase', version);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const res = store.getAll();
      res.onsuccess = () => {
        resolve(res.result);
      };
    };
  });
};

export type StoreDataHookResult<T> = {
  data: T[];
  isLoading: boolean;
  isSuccess: boolean;
  error: Error | null;
  onSuccess?: (data: T[]) => void;
};

interface UseStoreData<T> {
  storeName: Stores;
  onSuccess?: (data: T[]) => void;
}

export const useStoreData = <T>(
  props: UseStoreData<T>
): StoreDataHookResult<T> => {
  const { storeName, onSuccess } = props;
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storeData = await getStoreData<T>(storeName);
        setIsSuccess(true);
        onSuccess?.(storeData);
        setData(storeData);
      } catch (err) {
        setError(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [storeName]);

  return { data, isLoading, isSuccess, error, onSuccess };
};

interface UseUsersProps {
  onSuccess?: (data: User[]) => void;
}

export const useUsers = (props: UseUsersProps): StoreDataHookResult<User> => {
  const { data, isLoading, error, isSuccess } = useStoreData<User>({
    storeName: Stores.Users,
    onSuccess: props.onSuccess,
  });

  return { data, isLoading, error, isSuccess };
};
