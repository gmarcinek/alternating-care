'use client';

import { useAppContext } from '@app/AppContext';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react';
import { SupportedLanguages } from '@utils/lang';

export function Language() {
  const { setLanguage, language } = useAppContext();

  return (
    <Dropdown size='sm'>
      <DropdownTrigger>
        <Button variant='bordered'>{language.toUpperCase()}</Button>
      </DropdownTrigger>
      <DropdownMenu>
        {Object.values(SupportedLanguages).map((key) => {
          const onSelect = (value: SupportedLanguages) => {
            setLanguage(value);
          };

          return (
            <DropdownItem
              key={key}
              value={key}
              onClick={() => {
                onSelect(key);
              }}
            >
              {key.toUpperCase()}
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );
}
