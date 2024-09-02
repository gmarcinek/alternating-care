import { Stack } from '@components/Stack/Stack';
import { CalendarDayType } from '@modules/db/types';
import { capitalizeFirstLetter } from '@utils/string';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { CSSProperties, PropsWithChildren, useMemo } from 'react';
import styles from './CalendarItem.module.scss';

interface CalendarItemProps extends PropsWithChildren {
  day: CalendarDayType;
  className?: string;
  title?: string;
  style?: CSSProperties;
  mode?: 'short' | 'long' | 'full' | 'none';
  isNoPadding?: boolean;
}

export function CalendarItem(props: CalendarItemProps) {
  const {
    day,
    className,
    children,
    style,
    mode = 'short',
    isNoPadding,
    title,
  } = props;

  const currentDate = dayjs(day.date);
  const itemClasses = classNames(
    styles.calendarItem,
    {
      [styles.isClipped]: mode !== 'none',
      [styles.isNoPadding]: isNoPadding,
    },
    className
  );

  const { labelFull, labelLong, labelShort } = useMemo(() => {
    return {
      labelShort: capitalizeFirstLetter(currentDate.format('dd')),
      labelLong: capitalizeFirstLetter(currentDate.format('ddd')),
      labelFull: capitalizeFirstLetter(currentDate.format('dddd D MMMM YYYY')),
    };
  }, [currentDate]);

  return (
    <div className={itemClasses} style={style} title={title}>
      <Stack gap={0} direction='horizontal'>
        <Stack gap={0}>
          {mode === 'none' && <></>}
          {mode === 'short' && (
            <>
              <span>{labelShort}</span>
              <span>
                <strong>{currentDate.format('D')}</strong>
                <small>{currentDate.format('.MM')}</small>
              </span>
            </>
          )}
          {mode === 'long' && (
            <>
              <span>{labelLong}</span>
              <span>
                <strong>{currentDate.format('D')}</strong>
                <small>{currentDate.format('.MM')}</small>
              </span>
            </>
          )}
          {mode === 'full' && <h3>{labelFull}</h3>}

          {children}
        </Stack>
      </Stack>
    </div>
  );
}
