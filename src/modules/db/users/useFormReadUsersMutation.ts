import { openDB } from 'idb';
import { useCallback, useEffect, useState } from 'react';
import { dbName, dbVersion } from '../constants';
import { AlternatingCareDBSchema } from '../schema';
import { AppUser } from '../types';

interface UseFormReadUsersQueryProps {
  onSuccess?: (data?: AppUser[]) => void;
  onError?: (error: unknown) => void;
}

export const useFormReadUsersMutation = (
  props: UseFormReadUsersQueryProps = {
    onError() {},
    onSuccess() {},
  }
) => {
  const { onError, onSuccess } = props;
  const [isPending, setIsPending] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState<AppUser[]>([]);

  const initiateDb = useCallback(async () => {
    const db = await openDB<AlternatingCareDBSchema>(dbName, dbVersion);

    if (!db) {
      return;
    }

    // actions
    const data = await db.getAll('users');
    setData(data);
    db.close();

    return data;
  }, []);

  useEffect(() => {
    initiateDb()
      .then((data) => {
        setIsSuccess(true);
        onSuccess?.(data);
      })
      .catch((error) => {
        setIsError(true);
        onError?.(error);
      })
      .finally(() => {
        setIsPending(false);
      });
  }, []);

  return {
    data,
    isPending,
    isSuccess,
    isError,
  };
};
