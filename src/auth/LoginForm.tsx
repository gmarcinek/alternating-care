import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Modal,
  ModalContent,
} from '@nextui-org/react';
import { useState } from 'react';
import { useAuth } from './AuthContext';

interface LoginFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginForm = ({ isOpen, onClose }: LoginFormProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await register({ email, password, name });
      }
      onClose();
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    setIsLogin(true);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size='md'>
      <ModalContent>
        <Card className='border-none shadow-none'>
          <CardHeader className='flex flex-col space-y-1 pb-2'>
            <h2 className='text-xl font-semibold'>
              {isLogin ? 'Zaloguj się' : 'Zarejestruj się'}
            </h2>
            <p className='text-sm text-gray-600'>
              {isLogin ? 'Uzyskaj dostęp do synchronizacji' : 'Utwórz konto'}
            </p>
          </CardHeader>
          <CardBody className='pt-2'>
            <form onSubmit={handleSubmit} className='space-y-4'>
              {!isLogin && (
                <Input
                  label='Imię'
                  type='text'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  variant='bordered'
                />
              )}
              <Input
                label='Email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                variant='bordered'
              />
              <Input
                label='Hasło'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                variant='bordered'
              />

              {error && (
                <div className='rounded bg-red-50 p-2 text-sm text-red-500'>
                  {error}
                </div>
              )}

              <Button
                type='submit'
                className='w-full'
                color='primary'
                isLoading={loading}
              >
                {isLogin ? 'Zaloguj się' : 'Zarejestruj się'}
              </Button>

              <Button
                type='button'
                variant='light'
                className='w-full'
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin
                  ? 'Nie masz konta? Zarejestruj się'
                  : 'Masz już konto? Zaloguj się'}
              </Button>
            </form>
          </CardBody>
        </Card>
      </ModalContent>
    </Modal>
  );
};
