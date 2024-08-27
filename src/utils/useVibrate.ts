import { useCallback, useMemo } from 'react';

export const useVibrate = () => {
  const vibrateSoft = useCallback(() => {
    if (!navigator.vibrate) {
      return;
    }

    navigator.vibrate([200]);
  }, []);

  const api = useMemo(() => {
    return { vibrateSoft };
  }, []);

  return {
    ...api,
  };
};
