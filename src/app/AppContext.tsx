'use client';

import { createContext, useContext } from 'react';
import { AppUser } from '../modules/db/types';

export enum SupportedLanguages {
  Pl = 'pl',
  En = 'en',
  De = 'de',
  Es = 'es',
  Ru = 'ru',
  Zh = 'zh',
  Pt = 'pt',
}
export interface AppContextData {
  user: AppUser;
  language: SupportedLanguages;
  setLanguage: (value: SupportedLanguages) => void;
}

export const defaultUser = {
  id: '',
  name: '',
  startDate: '',
  countingRange: '',
};

export const AppContext = createContext<AppContextData>({
  user: { ...defaultUser },
  language: SupportedLanguages.Pl,
  setLanguage() {},
});

export const useAppContext = () => {
  const appContextData = useContext(AppContext);
  return appContextData;
};
