'use client';

import { useAppContext } from '@/app/AppContext';
import { useState } from 'react';
import Navbar from './navbar';
import Sidebar from './sidebar';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { user } = useAppContext();
  const toggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Sidebar isOpen={isOpen} toggle={toggle} />
      <Navbar toggle={toggle} user={user} />
    </>
  );
};

export default Navigation;
