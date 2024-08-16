'use client';

import Navigation from '@/src/modules/Navigation';
import { useInitDb } from '@/src/modules/db/db';
import { useFormReadUsersMutation } from '@/src/modules/db/users/useFormReadUsersMutation';
import dayjs from 'dayjs';
import 'dayjs/locale/pl';
import { PropsWithChildren, useMemo } from 'react';
import { AppContext, AppContextData, defaultUser } from './AppContext';

dayjs.locale('pl');

export default function AppRoot(props: PropsWithChildren) {
  const { isReady } = useInitDb();
  const { data, isSuccess } = useFormReadUsersMutation();
  const contextData: AppContextData = useMemo(() => {
    return {
      user: data.at(0) ?? { ...defaultUser },
    };
  }, [isSuccess]);

  return isReady ? (
    <AppContext.Provider value={contextData}>
      <Navigation />
      {props.children}
    </AppContext.Provider>
  ) : null;
}
