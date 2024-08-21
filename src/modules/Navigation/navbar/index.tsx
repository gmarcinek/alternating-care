import { Stack } from '@components/Stack/Stack';
import { Avatar } from '@nextui-org/react';
import Link from 'next/link';
import { AppUser } from '../../db/types';
import Logo from './Logo';
import MenuButton from './MenuButton';

interface NavbarProps {
  toggle: () => void;
  user: AppUser;
}

const Navbar = (props: NavbarProps) => {
  const { toggle, user } = props;

  return (
    <div className='sticky top-0 z-50 h-16 w-full bg-white shadow-lg shadow-slate-200/50'>
      <div className='container-fluid h-full px-4'>
        <div className='flex h-full items-center justify-between'>
          <div className='flex h-full items-center justify-between gap-x-8 divide-x divide-slate-300'>
            <Logo />
            <ul className='hidden gap-x-6 pl-8 md:flex'>
              <Link href='/'>
                <p>Start</p>
              </Link>
              <Link href='/week'>
                <p>Tydzień</p>
              </Link>
              <Link href='/month'>
                <p>Miesiąc</p>
              </Link>
              <Link href='/calendar'>
                <p>Edycja</p>
              </Link>
              <Link href='/settings'>
                <p>Ustawienia</p>
              </Link>
            </ul>
          </div>
          <div>
            <Stack direction='horizontal' contentAlignment='end'>
              {user.name && <Avatar name={user.name} />}
              <MenuButton onClick={toggle}>Menu</MenuButton>
            </Stack>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
