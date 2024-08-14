'use client';

import { useEffect, useState } from 'react';
import {
  addData,
  getStoreData,
  Stores,
  User,
  UserRole,
  useUsers,
} from '../components/db/indexedDB';
import PageContainer from '../components/PageContainer/PageContainer';
import '../globals.css';
import { Button } from '../components/Button/Button';
import { Stack } from '../components/Stack/Stack';

const readOnlyClasses =
  'block rounded-md py-4 pl-4 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6';
const inputClasses =
  'block rounded-md border-0 py-4 pl-4 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6';

export default function SettingsPage() {
  const [formData, setFormData] = useState<User>({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    role: UserRole.Holder,
    startCountDate: '',
    countingRange: '',
  });

  const [users, setUsers] = useState<User[] | []>([]);
  useUsers({
    onSuccess: (data) => {
      setUsers(data);
    },
  });

  const handleGetUsers = async () => {
    if (users[0] !== undefined) {
      setFormData(users[0]);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const {
      firstName,
      lastName,
      email,
      role,
      startCountDate,
      countingRange,
      id,
    } = formData;

    const payload: User = {
      id: Boolean(id) ? id : Date.now().toString(),
      firstName,
      lastName,
      email,
      role,
      startCountDate,
      countingRange: countingRange,
    };

    try {
      const res = await addData(Stores.Users, payload);
      if (typeof res !== 'string') {
        // Obsługa pomyślnego dodania danych
        console.log('Zapisano');
      } else {
        console.log('Coś poszło nie tak', res);
      }
    } catch (error) {
      console.log('Coś poszło nie tak', error);
    }
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
                name='firstName'
                placeholder='Imię'
                className={inputClasses}
                defaultValue={formData.firstName}
                onChange={handleInputChange}
              />
              <input
                type='text'
                name='lastName'
                placeholder='Nazwisko'
                className={inputClasses}
                defaultValue={formData.lastName}
                onChange={handleInputChange}
              />
              <input
                type='email'
                name='email'
                placeholder='Email'
                className={inputClasses}
                defaultValue={formData.email}
                onChange={handleInputChange}
              />
              <select
                name='role'
                className={inputClasses}
                onSelect={handleSelectChange}
                defaultValue={formData.role}
              >
                <option value={UserRole.Holder}>Ja</option>
                <option value={UserRole.Parent}>rodzic</option>
                <option value={UserRole.Child}>dziecko</option>
              </select>
              <input
                type='date'
                name='startCountDate'
                placeholder='Początek pętli'
                className={inputClasses}
                defaultValue={formData.startCountDate}
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

              <Button type='submit'>Zapisz</Button>
            </Stack>
          </form>

          <div className='w-full'>
            <Stack>
              <Stack direction='horizontal' className={readOnlyClasses}>
                <div>firstName</div>
                <div>{users[0]?.firstName}</div>
              </Stack>
              <Stack direction='horizontal' className={readOnlyClasses}>
                <div>lastName</div>
                <div>{users[0]?.lastName}</div>
              </Stack>
              <Stack direction='horizontal' className={readOnlyClasses}>
                <div>email</div>
                <div>{users[0]?.email}</div>
              </Stack>
              <Stack direction='horizontal' className={readOnlyClasses}>
                <div>role</div>
                <div>{users[0]?.role}</div>
              </Stack>
              <Stack direction='horizontal' className={readOnlyClasses}>
                <div>startCountDate</div>
                <div>{users[0]?.startCountDate}</div>
              </Stack>
              <Stack direction='horizontal' className={readOnlyClasses}>
                <div>countingRange</div>
                <div>{users[0]?.countingRange}</div>
              </Stack>
              <Button type='button' onClick={handleGetUsers}>
                {'Skopiuj'}
              </Button>
            </Stack>
          </div>
        </Stack>
      </Stack>
    </PageContainer>
  );
}
