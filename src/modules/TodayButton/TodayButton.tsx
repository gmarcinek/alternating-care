import TodaySharpIcon from '@mui/icons-material/TodaySharp';
import { Button, ButtonProps } from '@nextui-org/button';
import '@styles/globals.css';
import { dateFormat } from '@utils/dates';
import { useScrollToId } from '@utils/useScrollTo';
import classNames from 'classnames';
import dayjs from 'dayjs';
import styles from './TodayButton.module.scss';

export interface TodayButtonProps extends ButtonProps {
  position?: 'tl' | 'tr' | 'bl' | 'br';
}

export const TodayButton = (props: TodayButtonProps) => {
  const { children, className, position = 'bl', ...restProps } = props;
  const { scrollToElement } = useScrollToId();
  const todayDate = dayjs().format(dateFormat);

  const classes = classNames(
    styles.todayButton,
    'bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg',
    {
      [styles.isTl]: position === 'tl',
      [styles.isTr]: position === 'tr',
      [styles.isBl]: position === 'bl',
      [styles.isBr]: position === 'br',
    },
    className
  );

  return (
    <Button
      isIconOnly
      color='danger'
      variant='flat'
      aria-label='Today'
      className={classes}
      onClick={() => scrollToElement(`day-${todayDate}`, 100)}
      {...restProps}
    >
      <TodaySharpIcon />
    </Button>
  );
};
