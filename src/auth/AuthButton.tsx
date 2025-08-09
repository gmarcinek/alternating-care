import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react';
import { useState } from 'react';
import { useAuth } from './AuthContext';
import { LoginForm } from './LoginForm';

export const AuthButton = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <>
        <Button
          color='primary'
          variant='bordered'
          onClick={() => setIsLoginOpen(true)}
        >
          Zaloguj się
        </Button>
        <LoginForm isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </>
    );
  }

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant='light' className='min-w-0 p-0'>
          <Avatar
            name={user?.name}
            size='sm'
            showFallback
            className='h-8 w-8'
          />
          <span className='ml-2 hidden sm:inline'>{user?.name}</span>
        </Button>
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem key='profile' className='h-14 gap-2'>
          <p className='font-semibold'>{user?.name}</p>
          <p className='text-sm text-gray-500'>{user?.email}</p>
        </DropdownItem>
        <DropdownItem key='logout' color='danger' onClick={logout}>
          Wyloguj się
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
