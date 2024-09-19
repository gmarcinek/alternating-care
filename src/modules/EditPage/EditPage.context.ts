import { createContext, useContext } from 'react';

export interface EditPageContextData {
  groupId: string;
}

export const EditPageContext = createContext<EditPageContextData>({
  groupId: '',
});

export const useEditPageContext = () => {
  const cashboardContextData = useContext(EditPageContext);
  return cashboardContextData;
};
