import { createContext, useContext } from 'react';
import { AppUser } from '../modules/db/types';

export interface AppContextData {
  user: AppUser;
}

export const defaultUser = {
  id: '',
  name: '',
  startDate: '',
  countingRange: '',
};

export const AppContext = createContext<AppContextData>({
  user: { ...defaultUser },
});

export const useAppContext = () => {
  const appContextData = useContext(AppContext);
  return appContextData;
};
