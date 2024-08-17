import { CalendarDay } from '@/src/modules/db/types';
import useElementSize from '@custom-react-hooks/use-element-size';
import { Avatar } from '@nextui-org/react';
import classNames from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import { useMemo } from 'react';
import styles from './CalendarItemBody14.module.scss';

interface CalendarItemBody14Props {
  day: CalendarDay;
}

export function CalendarItemBody14(props: CalendarItemBody14Props) {
  const { day } = props;
  const [setRef, size] = useElementSize();
  const currentDate = dayjs(day.date);
  const { label } = useMemo(() => {
    return {
      label: toFormatedLabel(currentDate),
    };
  }, [currentDate]);

  const textClasses = classNames(styles.textItem, {
    [styles.font16]: size.width <= 300,
    [styles.font10]: size.width <= 200,
    [styles.font8]: size.width <= 80,
  });

  return <Avatar name={label} size='sm' />;
}

function toFormatedLabel(date: string | Dayjs) {
  const formated = dayjs(date).format('D');
  return formated.charAt(0).toUpperCase() + formated.slice(1, formated.length);
}
