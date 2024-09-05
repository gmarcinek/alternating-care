'use client';

import { useAppContext } from '@app/AppContext';
import { Stack } from '@components/Stack/Stack';
import { Avatar } from '@nextui-org/react';
import Link from 'next/link';
import { AppUser } from '../../db/types';
import { Language } from './Language';
import { Logo } from './Logo';
import { MenuButton } from './MenuButton';
import { navigationBarI18n } from './navigationBar.i18n';
interface NavbarProps {
  toggle: () => void;
  user: AppUser;
}

export const NavigationBar = (props: NavbarProps) => {
  const { toggle, user } = props;

  const { language } = useAppContext();
  const i18n = navigationBarI18n[language];

  return (
    <div
      className='x-0 sticky top-0 z-50 h-16 w-full bg-white shadow-lg shadow-slate-200/50'
      id='main-navbar'
    >
      <div className='container-fluid h-full px-4'>
        <div className='flex h-full items-center justify-between'>
          <div className='flex h-full items-center justify-between gap-x-8 divide-x divide-slate-300'>
            <Logo />
            <ul className='hidden gap-x-6 pl-8 md:flex'>
              <Link href='/'>
                <p>{i18n.home}</p>
              </Link>

              <Link href='/calendar'>
                <p>{i18n.edit}</p>
              </Link>

              <Link href='/alternating'>
                <p>Opieka</p>
              </Link>

              <Link href='/settings'>
                <p>{i18n.settings}</p>
              </Link>
            </ul>
          </div>
          <div>
            <Stack direction='horizontal' contentAlignment='end'>
              <Language />
              {user.name && <Avatar name={user.name} />}
              <MenuButton onClick={toggle}>{i18n.menu}</MenuButton>
            </Stack>
          </div>
        </div>
      </div>
    </div>
  );
};
