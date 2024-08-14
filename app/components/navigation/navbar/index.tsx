import React from 'react';
import Link from 'next/link';
import Logo from './Logo';
import MenuButton from './MenuButton';

interface NavbarProps {
  toggle: () => void;
}

const Navbar = (props: NavbarProps) => {
  const { toggle } = props;

  return (
    <div className='sticky top-0 h-20 w-full bg-white shadow-lg shadow-slate-200/50'>
      <div className='container-fluid h-full px-4'>
        <div className='flex h-full items-center justify-between'>
          <div className='flex h-full items-center justify-between gap-x-8 divide-x divide-slate-300'>
            <Logo />
            <ul className='hidden gap-x-6 pl-8 md:flex'>
              <Link href='/'>
                <p>Podsumowanie</p>
              </Link>
              <Link href='/calendar'>
                <p>Kalendarz</p>
              </Link>
              <Link href='/settings'>
                <p>Ustawienia</p>
              </Link>
            </ul>
          </div>
          <MenuButton onClick={toggle}>Menu</MenuButton>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
