'use client';

import { useInitDb } from '@modules/db/db';
import { useFormReadUsersMutation } from '@modules/db/users/useFormReadUsersMutation';
import Navigation from '@modules/Navigation';

import { PropsWithChildren, useMemo, useState } from 'react';
import { AppConfigurationEffect } from './AppConfigurationEffect';
import {
  AppContext,
  AppContextData,
  defaultUser,
  SupportedLanguages,
} from './AppContext';

export default function AppRoot(props: PropsWithChildren) {
  const [defaultLanguage] =
    typeof navigator !== 'undefined' ? navigator.language.split('-') : ['pl'];
  const { isReady } = useInitDb();
  const { data, isSuccess } = useFormReadUsersMutation();
  const [language, setLanguage] = useState(
    (defaultLanguage as SupportedLanguages) ?? SupportedLanguages.Pl
  );

  const contextData: AppContextData = useMemo(() => {
    return {
      user: data.at(0) ?? { ...defaultUser },
      language,
      setLanguage,
    };
  }, [isSuccess, language, setLanguage]);

  return isReady ? (
    <AppContext.Provider value={contextData}>
      <AppConfigurationEffect />
      <Navigation />
      {props.children}
    </AppContext.Provider>
  ) : null;
}
