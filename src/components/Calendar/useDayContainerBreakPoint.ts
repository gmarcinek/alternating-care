import { useMemo } from 'react';
import { StackGap } from '../Stack/Stack';

export const useDayContainerBreakPoint = (rowSize: number, width: number) => {
  const style = useMemo(() => {
    return {
      style: toFontSizeByContainerSize(rowSize, width),
    };
  }, [rowSize, width]);

  return {
    style,
  };
};

function toFontSizeByContainerSize(rowSize: number, width: number) {
  const size608 = 608;
  const size736 = 736;
  const size992 = 992;
  // const size1504 = 1504;

  if (width <= size608) {
    switch (rowSize) {
      case 1:
        return {
          fontSize: '12px',
          lineHeight: '14px',
        };
      case 7:
        return {
          fontSize: '12px',
          lineHeight: 'initial',
        };
      case 14:
        return {
          fontSize: 'inherit',
          lineHeight: 'inherit',
        };
    }
  }

  if (width <= size736) {
    switch (rowSize) {
      case 1:
        return {
          fontSize: '16px',
          lineHeight: '20px',
        };
      case 7:
        return {
          fontSize: '16px',
          lineHeight: 'initial',
          padding: '0.5rem',
        };
      case 14:
        return {
          fontSize: '12px',
          lineHeight: '12px',
          padding: '0.25rem',
        };
    }
  }

  switch (rowSize) {
    case 1:
      return {
        fontSize: '16px',
        lineHeight: '20px',
      };
    case 7:
      return {
        fontSize: '16px',
        lineHeight: '20px',
        padding: '0.5rem',
      };
    case 14:
      return {
        fontSize: '12px',
        lineHeight: '12px',
        padding: '0.5rem',
      };
  }
}

interface ToGapSizeProps {
  rowSize: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isBigDesktop: boolean;
}

function toGapSizeByRowSize(props: ToGapSizeProps): StackGap {
  const { isBigDesktop, isDesktop, isMobile, isTablet, rowSize } = props;

  if (isMobile) {
    switch (rowSize) {
      case 1:
        return 12;
      case 7:
        return 4;
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
      case 14:
        return 8;
    }
  }

  return 16;
}
