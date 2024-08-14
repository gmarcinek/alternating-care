import { createContext, useContext } from 'react';

interface AppContextData {
  foo: string;
}

export const AppContext = createContext<AppContextData>({
  foo: 'bar',
});

export const useAppContext = () => {
  const appContextData = useContext(AppContext);
  return appContextData;
};
