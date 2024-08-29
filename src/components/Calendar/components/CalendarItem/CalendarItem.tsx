import { Stack } from '@components/Stack/Stack';
import { CalendarDayType } from '@modules/db/types';
import { capitalizeFirstLetter } from '@utils/string';
import classNames from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import { CSSProperties, PropsWithChildren, useMemo } from 'react';
import styles from './CalendarItem.module.scss';

interface CalendarItemProps extends PropsWithChildren {
  day: CalendarDayType;
  className?: string;
  style?: CSSProperties;
}

export function CalendarItem(props: CalendarItemProps) {
  const { day, className, children, style } = props;

  const currentDate = dayjs(day.date);
  const itemClasses = classNames(styles.calendarItem, className);

  const { label } = useMemo(() => {
    return {
      label: toFormatedLabel(currentDate),
    };
  }, [currentDate]);

  return (
    <div className={itemClasses} style={style}>
      <Stack gap={0} direction='horizontal'>
        <Stack gap={0}>
          <span>{label}</span>

          <span>
            <strong>{currentDate.format('D')}</strong>
            <small>{currentDate.format('.MM')}</small>
          </span>
          {children}
        </Stack>
      </Stack>
    </div>
  );
}

function toFormatedLabel(date: string | Dayjs) {
  return capitalizeFirstLetter(dayjs(date).format('dd'));
}
