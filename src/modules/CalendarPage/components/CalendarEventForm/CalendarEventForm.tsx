'use client';
import { useAppContext } from '@app/AppContext';
import { Button } from '@components/Button/Button';
import { CalendarItem } from '@components/Calendar/components/CalendarItem/CalendarItem';
import { Stack } from '@components/Stack/Stack';
import { useFormPutEventMutation } from '@modules/db/events/useFormPutEventMutation';
import { CalendarEventType } from '@modules/db/types';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Divider, Input, Radio, RadioGroup, Textarea } from '@nextui-org/react';
import { colorBlueGreen700, getTextColor, white } from '@utils/color';
import { dateFormat } from '@utils/dates';
import { capitalizeFirstLetter } from '@utils/string';
import crypto from 'crypto';
import dayjs from 'dayjs';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { ColorResult, SwatchesPicker } from 'react-color';
import { toast } from 'react-toastify';
import { calendarEventFormI18n } from './calendarEventForm.i18n'; // Import your i18n file

interface CalendarEventFormProps {
  selection: string[];
  setSelection: Dispatch<SetStateAction<Set<string>>>;
  onSuccess: () => void;
}

export const CalendarEventForm = (props: CalendarEventFormProps) => {
  const { selection, onSuccess, setSelection } = props;
  const { language } = useAppContext();
  const i18n = calendarEventFormI18n[language];

  const [date, setDate] = useState('');
  const [type, setType] = useState(CalendarEventType.Alternating);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#E57373');
  const [textColor, setTextColor] = useState('#ffffff');

  const { mutateAsync, isPending } = useFormPutEventMutation({
    onSuccess: () => {
      onSuccess();

      setDate('');
      setType(CalendarEventType.Alternating);
      setName('');
      setDescription('');
      setBackgroundColor('#E57373');
      setTextColor('#ffffff');
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

  const handleCancel = useCallback(() => {
    setSelection(new Set([]));
  }, [setSelection]);

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
                size='md'
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

          {type !== CalendarEventType.Alternating && (
            <Stack>
              <Stack direction='horizontal'>
                <VisibilityIcon />
                <h3>{i18n.visibility}</h3>
              </Stack>
              <Stack direction='horizontal' contentAlignment='between'>
                <SwatchesPicker
                  height={243}
                  width={372}
                  onChange={(value: ColorResult) => {
                    setBackgroundColor(value.hex);
                  }}
                  onChangeComplete={(value: ColorResult) => {
                    setTextColor(getTextColor(value.hex));
                  }}
                  colors={[
                    ['#B71C1C', '#F44336', '#E57373', '#FFCDD2'], // Red
                    ['#880E4F', '#E91E63', '#F06292', '#F8BBD0'], // Pink
                    ['#4A148C', '#9C27B0', '#BA68C8', '#E1BEE7'], // Purple
                    ['#311B92', '#673AB7', '#9575CD', '#D1C4E9'], // Deep Purple
                    ['#1A237E', '#3F51B5', '#7986CB', '#C5CAE9'], // Indigo
                    ['#01579B', '#03A9F4', '#6fbbdd', '#B3E5FC'], // Light Blue
                    ['#004D40', '#009688', '#4DB6AC', '#B2DFDB'], // Teal
                    ['#194D33', '#4CAF50', '#81C784', '#C8E6C9'], // Green
                    ['#33691E', '#8BC34A', '#AED581', '#DCEDC8'], // Light Green
                    ['#827717', '#CDDC39', '#DCE775', '#F0F4C3'], // Lime
                    ['#FF6F00', '#FFC107', '#FFD54F', '#FFECB3'], // Amber
                    ['#BF360C', '#FF5722', '#FF8A65', '#FFCCBC'], // Deep Orange
                    ['#263238', '#607D8B', '#90A4AE', '#CFD8DC'], // Blue Grey
                    ['#333333', '#969696', '#D9D9D9', '#F0F0F0'], // Black to White Scale
                  ]}
                />
                <CalendarItem
                  day={exampleDate}
                  className=''
                  style={{
                    backgroundColor: backgroundColor,
                    color: getTextColor(backgroundColor),
                  }}
                >
                  <Stack gap={0}>
                    <small>{dayjs().format('MMM')}</small>
                  </Stack>
                </CalendarItem>

                <CalendarItem day={exampleDate} className=''>
                  <Stack gap={0}>
                    <small>{dayjs().clone().add(1, 'day').format('MMM')}</small>
                  </Stack>
                </CalendarItem>
              </Stack>
              <Divider className='my-4' />
            </Stack>
          )}

          <Stack direction='horizontal'>
            <Button
              onClick={handleCancel}
              isDisabled={selection.length === 0}
              className='mt-2'
              radius='sm'
              variant='flat'
              color='default'
            >
              <EventBusyIcon />
              Anuluj
            </Button>
            <Button
              type='submit'
              isDisabled={selection.length === 0 || isPending}
              className='mt-2'
              radius='sm'
              variant='solid'
              color='danger'
            >
              <EventAvailableIcon />
              {isPending ? i18n.saving : i18n.addEvent}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Stack>
  );
};
