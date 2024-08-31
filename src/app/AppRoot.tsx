'use client';

import { ErrorMessage } from '@components/ErrorMessage/ErrorMessage';
import { useInitDb } from '@modules/db/db';
import { DbProvider } from '@modules/db/DbContext';
import { useFormReadUsersMutation } from '@modules/db/users/useFormReadUsersMutation';

import Navigation from '@modules/Navigation/Navigation';
import { Spinner } from '@nextui-org/react';
import { PropsWithChildren, useMemo, useState } from 'react';
import { AppConfigurationEffect } from './AppConfigurationEffect';
import {
  AppContext,
  AppContextData,
  defaultUser,
  SupportedLanguages,
} from './AppContext';

export default function AppRoot({ children }: PropsWithChildren) {
  const { isReady, isError, error, dbInstance } = useInitDb();
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

  if (isError) {
    return (
      <ErrorMessage message={error?.message || 'Unexpected error occurred'} />
    );
  }

  if (!isReady) {
    return <Spinner color='danger' />;
  }

  return (
    <DbProvider db={dbInstance}>
      <AppContext.Provider value={contextData}>
        <AppConfigurationEffect />
        <Navigation />
        {children}
      </AppContext.Provider>
    </DbProvider>
  );
}
