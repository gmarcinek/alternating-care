'use client';
import { useAppContext } from '@app/AppContext';
import { Button } from '@components/Button/Button';
import { CalendarItem } from '@components/Calendar/components/CalendarItem/CalendarItem';
import { Stack } from '@components/Stack/Stack';
import { useFormPutEventMutation } from '@modules/db/events/useFormPutEventMutation';
import { CalendarEventType } from '@modules/db/types';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import {
  Divider,
  Input,
  Select,
  SelectItem,
  Textarea,
} from '@nextui-org/react';
import { blueGreen700, getTextColor, white } from '@utils/color';
import { colorPick, linearGradients } from '@utils/constants';
import { dateFormat } from '@utils/dates';
import crypto from 'crypto';
import dayjs from 'dayjs';
import { useCallback, useState } from 'react';
import { CirclePicker, ColorResult } from 'react-color';
import { toast } from 'react-toastify';
import { calendarEventFormI18n } from './calendarEventForm.i18n'; // Import your i18n file

interface CalendarEventFormProps {
  selection: string[];
  onSuccess: () => void;
}

export const CalendarEventForm = (props: CalendarEventFormProps) => {
  const { selection, onSuccess } = props;
  const { language } = useAppContext();
  const translation = calendarEventFormI18n[language];

  const [date, setDate] = useState('');
  const [type, setType] = useState(new Set<CalendarEventType>([]));
  const [issuer, setIssuer] = useState('');
  const [groupId, setGroupId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#d5e1d6');
  const [textColor, setTextColor] = useState('#000000');

  const { mutateAsync, isPending } = useFormPutEventMutation({
    onSuccess: () => {
      onSuccess();

      setDate('');
      setType(new Set<CalendarEventType>([]));
      setIssuer('');
      setName('');
      setGroupId('');
      setDescription('');
      setBackgroundColor('#d5e1d6');
      setTextColor('#000000');
      toast(translation.eventAddedSuccessfully, {
        type: 'success',
        className: 'bg-green-100',
      });
    },
  });

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (type.size === 0 || !name) {
        toast(translation.pleaseFillInAllRequiredFields, { type: 'info' });
        return;
      }

      const typeToSave = Array.from(type)[0].toUpperCase() as CalendarEventType;
      const groupId = crypto.randomBytes(16).toString('hex');

      const newEvents = selection.map((date) => ({
        id: crypto.randomBytes(16).toString('hex'),
        groupId,
        date,
        type: typeToSave,
        issuer: 'Admin',
        name,
        description,
        style: {
          background:
            typeToSave === CalendarEventType.Alternating
              ? blueGreen700
              : backgroundColor,
          color:
            typeToSave === CalendarEventType.Alternating ? white : textColor,
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
      name,
      description,
      backgroundColor,
      textColor,
      mutateAsync,
      selection,
      language,
    ]
  );

  const exampleDate = {
    date: dayjs().format(dateFormat),
    isOffset: false,
  };

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
              isDisabled={isPending}
              radius='sm'
              variant='bordered'
              size='lg'
              onSelectionChange={(value) => {
                setType(new Set(value as unknown as CalendarEventType[]));
              }}
              renderValue={() => {
                return Array.from(type).at(0) ?? undefined;
              }}
              value={Array.from(type).at(0) ?? undefined}
              required
            >
              {Object.keys(CalendarEventType).map((key) => (
                <SelectItem
                  key={key}
                  value={
                    CalendarEventType[key as keyof typeof CalendarEventType]
                  }
                >
                  {CalendarEventType[key as keyof typeof CalendarEventType]}
                </SelectItem>
              ))}
            </Select>
          </Stack>

          <Textarea
            label={translation.eventDescription}
            value={description}
            radius='sm'
            variant='bordered'
            size='lg'
            onValueChange={setDescription}
          />

          <Divider className='my-4' />

          <h3>Widoczność</h3>
          <Stack direction='horizontal' contentAlignment='between'>
            <CirclePicker
              colors={colorPick}
              onChange={(value: ColorResult) => {
                setBackgroundColor(value.hex);
              }}
              onChangeComplete={(value: ColorResult) => {
                setTextColor(getTextColor(value.hex));
              }}
            />

            <CalendarItem
              day={exampleDate}
              className=''
              style={{
                backgroundColor: backgroundColor,
                background: linearGradients[
                  backgroundColor as keyof typeof linearGradients
                ]
                  ? linearGradients[
                      backgroundColor as keyof typeof linearGradients
                    ]
                  : backgroundColor,
                color: getTextColor(backgroundColor),
              }}
            >
              <Stack gap={0}>
                <small>{dayjs().format('MMM')}</small>
              </Stack>
            </CalendarItem>
          </Stack>
          <Divider className='my-4' />
          <div>
            <Button
              type='submit'
              disabled={isPending}
              className='mt-2'
              radius='sm'
              variant='solid'
              color='danger'
            >
              <EventAvailableIcon />
              {isPending ? translation.saving : translation.addEvent}
            </Button>
          </div>
        </Stack>
      </form>
    </Stack>
  );
};
