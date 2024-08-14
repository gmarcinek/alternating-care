'use client';

import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import Navigation from './components/navigation';
import { AppContext } from './AppContext';
import { initDB } from './components/db/indexedDB';

export default function AppRoot(props: PropsWithChildren) {
  const [isDBReady, setIsDBReady] = useState<boolean>(false);

  const initDataBase = async () => {
    const status = await initDB();
    setIsDBReady(status);
  };

  useEffect(() => {
    if (!isDBReady) {
      initDataBase();
    }
  }, []);

  return (
    <>
      {isDBReady && (
        <AppContext.Provider value={{ foo: 'aaaa' }}>
          <Navigation />
          {props.children}
        </AppContext.Provider>
      )}
    </>
  );
}
