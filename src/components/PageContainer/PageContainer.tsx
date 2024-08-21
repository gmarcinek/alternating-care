import { Stack } from '@components/Stack/Stack';
import classNames from 'classnames';
import { PropsWithChildren } from 'react';
import styles from './PageContainer.module.scss';

export default function PageContainer(props: PropsWithChildren) {
  const pageContainerClasses = classNames(
    styles.pageContainer,
    'container mx-auto mb-10 flex flex-col px-4'
  );

  return (
    <div className={pageContainerClasses}>
      <Stack>{props.children}</Stack>
    </div>
  );
}
