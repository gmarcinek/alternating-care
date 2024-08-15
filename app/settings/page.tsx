'use client';

import crypto from 'crypto';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '../components/Button/Button';
import { User } from '../components/db/types';
import { useFormPutUserMutation } from '../components/db/users/useFormPutUserMutation';
import PageContainer from '../components/PageContainer/PageContainer';
import { Stack } from '../components/Stack/Stack';
import '../globals.css';

const readOnlyClasses =
  'block rounded-md py-4 pl-4 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6';
const inputClasses =
  'block rounded-md border-0 py-4 pl-4 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6';

export default function SettingsPage() {
  const { mutateAsync, isPending } = useFormPutUserMutation();
  const [users, setUsers] = useState<User[] | []>([]);
  const [formData, setFormData] = useState<User>({
    id: '',
    name: '',
    startDate: '',
    countingRange: '',
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { name, startDate, countingRange, id } = formData;

    const payload: User = {
      id: crypto.randomBytes(16).toString('hex'),
      name,
      startDate,
      countingRange: countingRange,
    };

    setFormData({ ...payload });

    const mutation = mutateAsync(payload);

    toast.promise(mutation, {
      pending: 'Wysyłam',
      success: 'Zapisano dane',
      error: 'Wyjebałem się',
    });
  };

  return (
    <PageContainer>
      <Stack>
        <h1>Moje Ustawienia</h1>
        <Stack direction='horizontal'>
          <form onSubmit={handleFormSubmit} className='w-full'>
            <Stack>
              <input
                type='text'
                name='name'
                placeholder='Imię'
                className={inputClasses}
                defaultValue={formData.name}
                onChange={handleInputChange}
              />

              <input
                type='date'
                name='startDate'
                placeholder='Początek pętli'
                className={inputClasses}
                defaultValue={formData.startDate}
                onChange={handleInputChange}
              />

              <input
                type='number'
                name='countingRange'
                placeholder='Długość pętli'
                className={inputClasses}
                defaultValue={formData.countingRange}
                onChange={handleInputChange}
              />

              <Button type='submit' disabled={isPending}>
                Zapisz
              </Button>
            </Stack>
          </form>

          <div className='w-full'>
            <Stack>
              <Stack direction='horizontal' className={readOnlyClasses}>
                <div>Nazwa</div>
                <div>{users[0]?.name}</div>
              </Stack>
              <Stack direction='horizontal' className={readOnlyClasses}>
                <div>Data początkowa</div>
                <div>{users[0]?.startDate}</div>
              </Stack>
              <Stack direction='horizontal' className={readOnlyClasses}>
                <div>Długość rundy</div>
                <div>{users[0]?.countingRange}</div>
              </Stack>
            </Stack>
          </div>
        </Stack>
      </Stack>
    </PageContainer>
  );
}
