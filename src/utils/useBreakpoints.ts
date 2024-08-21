import { useMemo } from 'react';
import { useMediaQuery } from 'react-responsive';

export const useBreakpoints = () => {
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' });
  const isTablet = useMediaQuery({
    query: '(max-width: 1023px)',
  });
  const isDesktop = useMediaQuery({
    query: '(max-width: 1280px)',
  });
  const isBigDesktop = useMediaQuery({ query: '(min-width: 1281px)' });

  const api = useMemo(() => {
    return {
      isMobile,
      isTablet,
      isDesktop,
      isBigDesktop,
    };
  }, [isMobile, isTablet, isDesktop, isBigDesktop]);

  return {
    ...api,
  };
};
