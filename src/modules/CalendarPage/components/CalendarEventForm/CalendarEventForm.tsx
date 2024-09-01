'use client';
import { useAppContext } from '@app/AppContext';
import { Button } from '@components/Button/Button';
import { CalendarItem } from '@components/Calendar/components/CalendarItem/CalendarItem';
import { Stack } from '@components/Stack/Stack';
import { useFormPutEventMutation } from '@modules/db/events/useFormPutEventMutation';
import { CalendarEventType } from '@modules/db/types';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { Divider, Input, Radio, RadioGroup, Textarea } from '@nextui-org/react';
import { colorBlueGreen700, getTextColor, white } from '@utils/color';
import { colorPick, linearGradients } from '@utils/constants';
import { dateFormat } from '@utils/dates';
import { capitalizeFirstLetter } from '@utils/string';
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
  const i18n = calendarEventFormI18n[language];

  const [date, setDate] = useState('');
  const [type, setType] = useState(CalendarEventType.Alternating);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('');
  const [textColor, setTextColor] = useState('');

  const { mutateAsync, isPending } = useFormPutEventMutation({
    onSuccess: () => {
      onSuccess();

      setDate('');
      setType(CalendarEventType.Alternating);
      setName('');
      setDescription('');
      setBackgroundColor('#d5e1d6');
      setTextColor('#000000');
      toast(i18n.eventAddedSuccessfully, {
        type: 'success',
        className: 'bg-green-100',
      });
    },
  });

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (!name) {
        toast(i18n.pleaseFillInAllRequiredFields, { type: 'info' });
        return;
      }

      const typeToSave = type.toUpperCase() as CalendarEventType;
      const groupId = crypto.randomBytes(16).toString('hex');

      const newEvents = selection.map((date) => ({
        id: crypto.randomBytes(16).toString('hex'),
        groupId:
          typeToSave === CalendarEventType.Alternating ? typeToSave : groupId,
        creationTime: new Date().getTime(),
        date,
        type: typeToSave,
        issuer: 'Admin',
        name,
        description,
        style: {
          background:
            typeToSave === CalendarEventType.Alternating
              ? colorBlueGreen700
              : backgroundColor,
          color:
            typeToSave === CalendarEventType.Alternating ? white : textColor,
        },
      }));

      try {
        await mutateAsync(newEvents);
      } catch (error) {
        console.error('Failed to save event:', error);
        toast(i18n.errorAddingEvent, { type: 'error' });
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
            <Stack>
              <Input
                type='text'
                label={i18n.eventName}
                value={name}
                radius='sm'
                variant='bordered'
                size='lg'
                onValueChange={setName}
              />

              <Textarea
                label={i18n.eventDescription}
                value={description}
                radius='sm'
                variant='bordered'
                size='lg'
                onValueChange={setDescription}
              />
            </Stack>

            <RadioGroup
              className='ml-4 mr-8'
              label={i18n.eventType}
              value={type}
              onValueChange={(value) => {
                setType(value as CalendarEventType);
              }}
            >
              {Object.keys(CalendarEventType).map((key) => {
                if (key.toUpperCase() === CalendarEventType.Offset) {
                  return;
                }

                return (
                  <Radio
                    key={key}
                    value={
                      CalendarEventType[key as keyof typeof CalendarEventType]
                    }
                  >
                    {capitalizeFirstLetter(
                      CalendarEventType[
                        key as keyof typeof CalendarEventType
                      ].toLocaleLowerCase()
                    )}
                  </Radio>
                );
              })}
            </RadioGroup>
          </Stack>

          <Divider className='my-4' />

          {type !== CalendarEventType.Alternating && (
            <Stack>
              <h3>{i18n.visibility}</h3>
              <Stack direction='horizontal' contentAlignment='between'>
                <CirclePicker
                  colors={colorPick}
                  circleSpacing={8}
                  circleSize={32}
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
            </Stack>
          )}
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
              {isPending ? i18n.saving : i18n.addEvent}
            </Button>
          </div>
        </Stack>
      </form>
    </Stack>
  );
};
