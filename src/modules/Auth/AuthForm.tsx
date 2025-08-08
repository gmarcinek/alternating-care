'use client';

import { useCallback, useEffect, useState } from 'react';
import { Input } from '@nextui-org/react';
import { Button } from '@components/Button/Button';
import { Stack } from '@components/Stack/Stack';
import { useAppContext } from '@app/AppContext';
import { useDbContext } from '@api/db/DbContext';
import { useFormPutUserMutation } from '@api/db/users/useFormPutUserMutation';
import { AppUser } from '@api/db/types';
import { v4 as uuidv4 } from 'uuid';

const decodeJwt = (token: string) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );

  return JSON.parse(jsonPayload);
};

export const AuthForm = () => {
  const { setUser } = useAppContext();
  const { db } = useDbContext();
  const { mutateAsync: saveUser } = useFormPutUserMutation();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const hashPassword = useCallback(async (pwd: string) => {
    const data = new TextEncoder().encode(pwd);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!db) return;
      setError(null);

      const transaction = db.transaction('users', 'readonly');
      const store = transaction.objectStore('users');
      const index = store.index('by-email');

      if (mode === 'register') {
        if (!email || !password || !name) {
          setError('Wypełnij wszystkie pola');
          return;
        }
        const existing = (await index.get(email)) as AppUser | undefined;
        await transaction.done;
        if (existing) {
          setError('Użytkownik z takim e-mailem już istnieje');
          return;
        }
        const passwordHash = await hashPassword(password);
        const newUser: AppUser = {
          id: uuidv4(),
          name,
          email,
          passwordHash,
        };
        await saveUser(newUser);
        setUser(newUser);
      } else {
        if (!email || !password) {
          setError('Wypełnij wszystkie pola');
          return;
        }
        const existing = (await index.get(email)) as AppUser | undefined;
        await transaction.done;
        if (!existing) {
          setError('Nie znaleziono użytkownika');
          return;
        }
        const passwordHash = await hashPassword(password);
        if (existing.passwordHash !== passwordHash) {
          setError('Błędne hasło');
          return;
        }
        setUser(existing);
      }
    },
    [db, email, hashPassword, mode, name, password, saveUser, setUser]
  );

  const handleGoogleResponse = useCallback(
    async (response: any) => {
      try {
        const profile = decodeJwt(response.credential);
        const user: AppUser = {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
        };
        await saveUser(user);
        setUser(user);
      } catch (err) {
        setError('Nie udało się zalogować przez Google');
      }
    },
    [saveUser, setUser]
  );

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID');
      return;
    }

    if (document.getElementById('gsi-client')) return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.id = 'gsi-client';
    script.onload = () => {
      const google = (window as any).google;
      if (!google) return;
      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
      });
      const btn = document.getElementById('googleSignInBtn');
      if (btn) {
        google.accounts.id.renderButton(btn, { theme: 'outline', size: 'large' });
      }
    };
    document.body.appendChild(script);
  }, [handleGoogleResponse]);

  return (
    <form onSubmit={handleSubmit} className='py-8 max-w-md mx-auto'>
      <Stack gap={16}>
        {mode === 'register' && (
          <Input
            label='Nazwa'
            value={name}
            onValueChange={setName}
            variant='bordered'
          />
        )}
        <Input
          type='email'
          label='Email'
          value={email}
          onValueChange={setEmail}
          variant='bordered'
        />
        <Input
          type='password'
          label='Hasło'
          value={password}
          onValueChange={setPassword}
          variant='bordered'
        />
        {error && <p className='text-red-500 text-sm'>{error}</p>}
        <Button type='submit' color='danger' radius='sm'>
          {mode === 'login' ? 'Zaloguj' : 'Zarejestruj'}
        </Button>
        <div id='googleSignInBtn' />
        <Button
          type='button'
          variant='light'
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login'
            ? 'Nie masz konta? Zarejestruj się'
            : 'Masz konto? Zaloguj się'}
        </Button>
      </Stack>
    </form>
  );
};

export default AuthForm;

