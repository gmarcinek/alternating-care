import { useBreakpoints } from '@/src/utils/useBreakpoints';
import { useMemo } from 'react';
import { StackGap } from '../Stack/Stack';

export const useCalendarGap = (rowSize: number) => {
  const { isDesktop, isMobile, isTablet, isBigDesktop } = useBreakpoints();

  const gap = useMemo(() => {
    return toGapSize({
      isBigDesktop,
      isDesktop,
      isMobile,
      isTablet,
      rowSize,
    });
  }, [isBigDesktop, isDesktop, isMobile, isTablet, rowSize]);

  return gap;
};

interface ToGapSizeProps {
  rowSize: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isBigDesktop: boolean;
}

function toGapSize(props: ToGapSizeProps): StackGap {
  const { isBigDesktop, isDesktop, isMobile, isTablet, rowSize } = props;

  if (isMobile) {
    switch (rowSize) {
      case 1:
        return 12;
      case 7:
        return 4;
      case 10:
      case 14:
        return 2;
    }
  }

  if (isTablet) {
    switch (rowSize) {
      case 1:
        return 12;
      case 7:
        return 12;
      case 10:
      case 14:
        return 4;
    }
  }

  if (isDesktop) {
    switch (rowSize) {
      case 1:
        return 16;
      case 7:
        return 12;
      case 10:
      case 14:
        return 8;
    }
  }

  if (isBigDesktop) {
    switch (rowSize) {
      case 1:
        return 16;
      case 7:
        return 12;
      case 10:
      case 14:
        return 8;
    }
  }

  return 16;
}
