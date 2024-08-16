import { PropsWithChildren } from 'react';
import { Stack } from '../Stack/Stack';

export default function PageContainer(props: PropsWithChildren) {
  return (
    <div className='container mx-auto mb-20 mt-10 flex flex-col px-4'>
      <Stack>{props.children}</Stack>
    </div>
  );
}
