'use client';

import { useInitDb } from '@api/db/db';
import { DbProvider } from '@api/db/DbContext';
import { useFormReadUsersMutation } from '@api/db/users/useFormReadUsersMutation';
import { ErrorMessage } from '@components/ErrorMessage/ErrorMessage';
import { Stack } from '@components/Stack/Stack';
import { SiteNavigation } from '@modules/SiteNavigation/SiteNavigation';
import { Spinner } from '@nextui-org/react';
import { SupportedLanguages } from '@utils/lang';
import { PropsWithChildren, useMemo, useState } from 'react';
import { AppConfigurationEffect } from './AppConfigurationEffect';
import { AppContext, AppContextData, defaultUser } from './AppContext';

export default function AppRoot({ children }: PropsWithChildren) {
  const {
    isReady: isDbReady,
    isError: isDbError,
    error: dbError,
    dbInstance,
  } = useInitDb();
  const [defaultLanguage] =
    typeof navigator !== 'undefined' ? navigator.language.split('-') : ['pl'];

  const { data: usersData, isSuccess: usersFetched } =
    useFormReadUsersMutation();

  const [language, setLanguage] = useState<SupportedLanguages>(
    (defaultLanguage as SupportedLanguages) ?? SupportedLanguages.Pl
  );

  const contextData: AppContextData = useMemo(
    () => ({
      user: usersFetched ? (usersData[0] ?? defaultUser) : defaultUser,
      language,
      setLanguage,
    }),
    [usersFetched, usersData, language]
  );

  if (isDbError) {
    return (
      <ErrorMessage message={dbError?.message || 'Unexpected error occurred'} />
    );
  }

  if (!isDbReady) {
    return (
      <div className='flex'>
        <Stack contentAlignment='center'>
          <Spinner color='danger' />
        </Stack>
      </div>
    );
  }

  return (
    <DbProvider db={dbInstance}>
      <AppContext.Provider value={contextData}>
        <AppConfigurationEffect />
        <SiteNavigation />
        {children}
      </AppContext.Provider>
    </DbProvider>
  );
}
