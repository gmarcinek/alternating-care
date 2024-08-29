'use client';
import { useAppContext } from '@app/AppContext';
import { Button } from '@components/Button/Button';
import { Stack } from '@components/Stack/Stack';
import { useFormPutEventMutation } from '@modules/db/events/useFormPutEventMutation';
import { CalendarEventType } from '@modules/db/types';
import { Input, Select, SelectItem, Textarea } from '@nextui-org/react';
import crypto from 'crypto';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { calendarEventFormI18n } from './calendarEventForm.i18n'; // Import your i18n file

interface CalendarEventFormProps {
  selection: string[];
}

export const CalendarEventForm = (props: CalendarEventFormProps) => {
  const { selection } = props;
  const { language } = useAppContext();
  const translation = calendarEventFormI18n[language];

  const [date, setDate] = useState('');
  const [type, setType] = useState<CalendarEventType>(
    CalendarEventType.Alternating
  );
  const [issuer, setIssuer] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#00A9FD');
  const [textColor, setTextColor] = useState('#ffffff');

  const { mutateAsync, isSuccess, isError, isPending } =
    useFormPutEventMutation({
      onSuccess: () => {
        setDate('');
        setType(CalendarEventType.Alternating);
        setIssuer('');
        setName('');
        setDescription('');
        setBackgroundColor('#00A9FD');
        setTextColor('#ffffff');
        toast(translation.eventAddedSuccessfully);
      },
    });

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (!type || !issuer) {
        toast(translation.pleaseFillInAllRequiredFields, { type: 'info' });
        return;
      }

      const newEvents = selection.map((date) => ({
        id: crypto.randomBytes(16).toString('hex'),
        date,
        type,
        issuer: 'Admin',
        name,
        description,
        style: {
          background: backgroundColor,
          color: textColor,
        },
      }));

      try {
        await mutateAsync(newEvents);
      } catch (error) {
        console.error('Failed to save event:', error);
        toast(translation.errorAddingEvent, { type: 'error' });
      }
    },
    [
      date,
      type,
      issuer,
      name,
      description,
      backgroundColor,
      textColor,
      mutateAsync,
      selection,
      language,
    ]
  );

  return (
    <Stack>
      <form onSubmit={handleSubmit}>
        <Stack>
          <Stack direction='horizontal'>
            <Input
              type='text'
              label={translation.eventName}
              value={name}
              radius='sm'
              variant='bordered'
              size='lg'
              onValueChange={setName}
            />
            <Select
              label={translation.eventType}
              radius='sm'
              variant='bordered'
              size='lg'
              onSelectionChange={(value) => {
                setType(value.currentKey as unknown as CalendarEventType);
              }}
              required
            >
              <SelectItem key={CalendarEventType.Alternating}>
                {CalendarEventType.Alternating}
              </SelectItem>
              <SelectItem key={CalendarEventType.Event}>
                {CalendarEventType.Event}
              </SelectItem>
            </Select>
          </Stack>

          <Input
            type='text'
            label={translation.issuer}
            value={issuer}
            radius='sm'
            variant='bordered'
            size='lg'
            onValueChange={setIssuer}
            required
          />

          <Textarea
            label={translation.eventDescription}
            value={description}
            radius='sm'
            variant='bordered'
            size='lg'
            onValueChange={setDescription}
          />
          <Stack direction='horizontal' gap={16}>
            <Input
              type='color'
              label={translation.backgroundColor}
              value={backgroundColor}
              radius='sm'
              variant='bordered'
              size='lg'
              onValueChange={setBackgroundColor}
            />
            <Input
              type='color'
              label={translation.textColor}
              value={textColor}
              radius='sm'
              variant='bordered'
              size='lg'
              onValueChange={setTextColor}
            />
          </Stack>
          <Button type='submit' disabled={isPending}>
            {isPending ? translation.saving : translation.addEvent}
          </Button>
          {isSuccess && <div>{translation.eventAddedSuccessfully}</div>}
          {isError && <div>{translation.errorAddingEvent}</div>}
        </Stack>
      </form>
    </Stack>
  );
};
