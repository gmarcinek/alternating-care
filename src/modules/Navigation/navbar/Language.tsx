'use client';

import { SupportedLanguages, useAppContext } from '@app/AppContext';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react';

export function Language() {
  const { setLanguage, language } = useAppContext();

  return (
    <Dropdown>
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
