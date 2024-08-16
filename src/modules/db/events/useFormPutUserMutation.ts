import { openDB } from 'idb';
import { useCallback, useState } from 'react';
import { dbName, dbVersion } from '../constants';
import { AlternatingCareDBSchema } from '../schema';
import { AppUser } from '../types';

export const useFormPutUserMutation = (props: {
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const initiateDb = useCallback(async (payload: AppUser) => {
    setIsPending(true);
    const db = await openDB<AlternatingCareDBSchema>(dbName, dbVersion);
    if (!db) {
      return;
    }

    // actions
    db.put('users', payload);
    db.close();
  }, []);

  const mutateAsync = async (payload: AppUser) => {
    return await initiateDb(payload)
      .then(() => {
        setIsSuccess(true);
        props.onSuccess?.();
      })
      .catch(() => {
        setIsError(true);
        props.onError?.();
      })
      .finally(() => {
        setIsPending(false);
      });
  };

  return {
    mutateAsync,
    isPending,
    isSuccess,
    isError,
  };
};
