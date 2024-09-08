'use client';

import { useFormPutUserMutation } from '@api/db/users/useFormPutUserMutation'; // Hook do zapisywania użytkownika
import PageContainer from '@components/PageContainer/PageContainer';
import { Stack } from '@components/Stack/Stack';
import { Button, Input } from '@nextui-org/react'; // Zakładam, że używasz NextUI
import crypto from 'crypto';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';

export default function UserForm() {
  const [userName, setUserName] = useState('');
  const { mutateAsync, isPending, isSuccess, isError } = useFormPutUserMutation(
    {
      onSuccess: () => {
        setUserName('');
      },
    }
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (userName.trim() === '') {
        toast('Please fill in all required fields', { type: 'error' });
        return;
      }

      const newUser = {
        id: crypto.randomBytes(16).toString('hex'),
        name: userName,
      };

      try {
        const promise = mutateAsync(newUser);
        toast.promise(promise, {
          pending: 'Wysyłam',
          success: 'Zapisano dane',
          error: 'Wyjebałem się',
        });
        await promise;
      } catch (error) {
        toast.error('Failed to save user');
      }
    },
    [userName, mutateAsync]
  );

  return (
    <PageContainer>
      <Stack gap={16}>
        <h2>Add New User</h2>
        <form onSubmit={handleSubmit}>
          <Stack gap={16}>
            <Input
              type='text'
              label='User Name'
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder='Enter user name'
              required
            />
            <Button type='submit' disabled={isPending}>
              {isPending ? 'Saving...' : 'Add User'}
            </Button>
            {isSuccess && <div>User added successfully!</div>}
            {isError && <div>Error adding user</div>}
          </Stack>
        </form>
      </Stack>
    </PageContainer>
  );
}
