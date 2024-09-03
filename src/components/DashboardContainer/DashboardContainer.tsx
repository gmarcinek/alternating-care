import { Stack } from '@components/Stack/Stack';
import { PropsWithChildren } from 'react';
import styles from './DashboardContainer.module.scss';

export default function DashboardContainer(props: PropsWithChildren) {
  const { children } = props;

  return <Stack className={styles.dashboardContainer}>{children}</Stack>;
}
