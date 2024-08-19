import type { CSSProperties, PropsWithChildren } from 'react';
import React from 'react';

type StackAlignment = 'start' | 'end' | 'between' | 'center';
type StackDirection = 'horizontal' | 'vertical';
export type StackGap = 0 | 1 | 2 | 4 | 8 | 12 | 16 | 20 | 24 | 32 | 48 | 64;

interface StackProps extends PropsWithChildren {
  direction?: StackDirection;
  gap?: StackGap;
  contentAlignment?: StackAlignment;
  style?: CSSProperties;
  className?: string;
}

export const Stack: React.FC<StackProps> = ({
  direction = 'vertical',
  gap = 16,
  contentAlignment,
  style,
  className,
  children,
}) => {
  const flexDirection = direction === 'horizontal' ? 'row' : 'column';
  const justifyContent = contentAlignment
    ? {
        start: 'flex-start',
        end: 'flex-end',
        between: 'space-between',
        center: 'center',
      }[contentAlignment]
    : undefined;

  const computedStyle: CSSProperties = {
    display: 'flex',
    flex: '1',
    flexDirection,
    justifyContent,
    gap: `${gap}px`,
    ...style,
  };

  return (
    <div style={computedStyle} className={className}>
      {children}
    </div>
  );
};
