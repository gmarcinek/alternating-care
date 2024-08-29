import { IDBPDatabase } from 'idb';
import { createContext, useContext } from 'react';
import { AlternatingCareDBSchema } from './schema';

// Typy dla kontekstu
interface DbContextType {
  db: IDBPDatabase<AlternatingCareDBSchema> | null;
}

// Tworzymy kontekst z początkową wartością `null`
const DbContext = createContext<DbContextType>({ db: null });

// Hook do używania kontekstu
export const useDbContext = () => useContext(DbContext);

// Provider kontekstu
export const DbProvider: React.FC<{
  db: IDBPDatabase<AlternatingCareDBSchema> | null;
  children: React.ReactNode;
}> = ({ db, children }) => {
  return <DbContext.Provider value={{ db }}>{children}</DbContext.Provider>;
};
