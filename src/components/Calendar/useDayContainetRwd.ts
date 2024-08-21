import { useMemo } from 'react';

export const useDayContainetRwd = (width: number) => {
  const api = useMemo(() => {
    const size430 = 430;
    const size608 = 608;
    const size736 = 736;
    const size992 = 992;
    const size1504 = 1504;

    const is430 = width <= size430;
    const is608 = width <= size608;
    const is736 = width <= size736;
    const is992 = width <= size992;
    const is1504 = width <= size1504;

    return {
      is430,
      is608,
      is736,
      is992,
      is1504,
    };
  }, [width]);

  return {
    ...api,
  };
};
