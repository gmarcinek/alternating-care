import React, { PropsWithChildren } from 'react';

export default function PageContainer(props: PropsWithChildren) {
  return (
    <div className='container mx-auto mt-10 flex flex-col px-4'>
      {props.children}
    </div>
  );
}
