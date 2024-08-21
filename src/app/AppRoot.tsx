'use client';

import { useInitDb } from '@modules/db/db';
import { useFormReadUsersMutation } from '@modules/db/users/useFormReadUsersMutation';
import Navigation from '@modules/Navigation';
import dayjs from 'dayjs';
import 'dayjs/locale/pl';
import arraySupport from 'dayjs/plugin/arraySupport';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { PropsWithChildren, useMemo } from 'react';
import { AppContext, AppContextData, defaultUser } from './AppContext';

dayjs.extend(weekOfYear);
dayjs.extend(weekday);
dayjs.extend(arraySupport);
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
