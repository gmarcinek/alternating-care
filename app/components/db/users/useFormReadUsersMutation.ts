import { openDB } from 'idb';
import { useCallback, useEffect, useState } from 'react';
import { dbName, dbVersion } from '../constants';
import { AlternatingCareDBSchema } from '../schema';
import { User } from '../types';

interface UseFormReadUsersQueryProps {
  onSuccess?: (data?: User[]) => void;
  onError?: (error: unknown) => void;
}

export const useFormReadUsersMutation = (
  props: UseFormReadUsersQueryProps = {
    onError() {},
    onSuccess() {},
  }
) => {
  const { onError, onSuccess } = props;
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState<User[]>([]);

  const initiateDb = useCallback(async () => {
    setIsPending(true);

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
