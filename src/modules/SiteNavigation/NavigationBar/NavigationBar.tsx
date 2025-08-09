'use client';

import { useExportEvents } from '@api/db/export/useExportEvents';
import { useAppContext } from '@app/AppContext';
import { Stack } from '@components/Stack/Stack';
import { useBreakpoints } from '@utils/useBreakpoints';
import Link from 'next/link';
import { PiExport } from 'react-icons/pi';
import { AuthButton } from '../../../auth/AuthButton';
import { SyncButton } from '../../../components/SyncButton/SyncButton';
import { siteNavigationI18n } from '../siteNavigation.i18n';
import { Language } from './Language';
import { Logo } from './Logo';
import { MenuButton } from './MenuButton';

interface NavbarProps {
  toggle: () => void;
}

export const NavigationBar = (props: NavbarProps) => {
  const { toggle } = props;
  const { exportEventsToFile } = useExportEvents();
  const { language } = useAppContext();
  const i18n = siteNavigationI18n[language];
  const { is768 } = useBreakpoints();

  return (
    <div
      className='x-0 sticky top-0 z-50 h-12 w-full bg-white shadow-lg shadow-slate-200/50'
      id='main-navbar'
    >
      <div className='container-fluid h-full px-4'>
        <div className='flex h-full items-center justify-between'>
          <div className='flex h-full items-center justify-between gap-x-8 divide-x divide-slate-300'>
            <Logo />
            <ul className='hidden gap-x-6 pl-8 md:flex'>
              <Link href='/[mode]' as={'/'}>
                <span>{i18n.home}</span>
              </Link>

              <Link href='/alternating'>
                <span>{i18n.alternating}</span>
              </Link>

              <Link href='/analytics'>
                <span>{i18n.analytics}</span>
              </Link>

              <Link href='/settings'>
                <span>{i18n.settings}</span>
              </Link>
              <Link href='/help'>
                <span className='my-0 py-0'>{i18n.help}</span>
              </Link>
            </ul>
          </div>
          <div>
            <Stack
              direction='horizontal'
              contentAlignment='end'
              itemsAlignment='center'
            >
              {is768 && <PiExport size={24} onClick={exportEventsToFile} />}

              <Language />
              <SyncButton />
              <AuthButton />
              <MenuButton onClick={toggle}>{i18n.menu}</MenuButton>
            </Stack>
          </div>
        </div>
      </div>
    </div>
  );
};
