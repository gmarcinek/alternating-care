import { useBreakpoints } from '@utils/useBreakpoints';
import { useMemo } from 'react';

interface UseRowSizeProps {
  isPlanVisible: boolean;
}

export const useRowSize = (props: UseRowSizeProps) => {
  const { isPlanVisible } = props;
  const { isMobile, isTablet, is1024, is1280, is1360, is1440, is1671, is1920 } =
    useBreakpoints();

  const rowSize = useMemo(() => {
    if (isPlanVisible && is1920) {
      return 30;
    }
    if (isPlanVisible && is1671) {
      return 30;
    }
    if (isPlanVisible && is1440) {
      return 14;
    }
    if (isPlanVisible && is1360) {
      return 14;
    }
    if (isPlanVisible && is1280) {
      return 14;
    }
    if (isPlanVisible && is1024) {
      return 14;
    }
    if (isPlanVisible && isTablet) {
      return 7;
    }
    if (isPlanVisible && isMobile) {
      return 7;
    }

    return 7;
  }, [
    isPlanVisible,
    isTablet,
    isMobile,
    is1024,
    is1280,
    is1360,
    is1440,
    is1671,
    is1920,
  ]);

  return rowSize;
};
