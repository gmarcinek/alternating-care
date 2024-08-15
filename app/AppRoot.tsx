'use client';

import { PropsWithChildren } from 'react';
import { useInitDb } from './components/db/db';
import Navigation from './components/navigation';

export default function AppRoot(props: PropsWithChildren) {
  const { isReady } = useInitDb();
  console.log(isReady);
  return isReady ? (
    <>
      <Navigation />
      {props.children}
    </>
  ) : null;
}
