'use client';

import { SupportedLanguages } from '@utils/lang';
import { createContext, useContext } from 'react';
import { AppUser } from '../api/db/types';

export interface AppContextData {
  user: AppUser;
  setUser: (user: AppUser) => void;
  language: SupportedLanguages;
  setLanguage: (value: SupportedLanguages) => void;
}

export const defaultUser = {
  id: '',
  name: '',
  email: '',
  passwordHash: '',
  startDate: '',
  countingRange: '',
};

export const AppContext = createContext<AppContextData>({
  user: { ...defaultUser },
  setUser() {},
  language: SupportedLanguages.Pl,
  setLanguage() {},
});

export const useAppContext = () => {
  const appContextData = useContext(AppContext);
  return appContextData;
};
