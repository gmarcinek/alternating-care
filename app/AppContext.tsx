import { IDBPDatabase } from 'idb';
import { createContext, useContext } from 'react';
import { AlternatingCareDBSchema } from './components/db/schema';
interface AppContextData {
  db: IDBPDatabase<AlternatingCareDBSchema> | '';
}

export const AppContext = createContext<AppContextData>({
  db: '',
});

export const useAppContext = () => {
  const appContextData = useContext(AppContext);
  return appContextData;
};
