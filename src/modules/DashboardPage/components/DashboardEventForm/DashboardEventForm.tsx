'use client';
import { useFormPutEventMutation } from '@api/db/events/useFormPutEventMutation';
import { useAppContext } from '@app/AppContext';
import { Button } from '@components/Button/Button';
import CalendarEventListItem from '@components/Calendar/components/CalendarEventListItem/CalendarEventListItem';
import { Stack } from '@components/Stack/Stack';

import { CalendarEventType } from '@api/db/types';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import ColorPicker from '@components/ColorPicker/ColorPicker';
import AddIcon from '@mui/icons-material/Add';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Divider, Input, Radio, RadioGroup, Textarea } from '@nextui-org/react';
import { colorBlueGreen700, getTextColor, white } from '@utils/color';
import { capitalizeFirstLetter } from '@utils/string';
import classNames from 'classnames';
import crypto from 'crypto';
import dayjs from 'dayjs';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { toast } from 'react-toastify';
import { dashboardEventFormI18n } from './dashboardEventForm.i18n'; // Import your i18n file
import styles from './dashboardEventForm.module.scss';

interface DashboardEventFormProps {
  selection: string[];
  setSelection: Dispatch<SetStateAction<Set<string>>>;
  onSuccess: () => void;
  isMultiSelectionMode?: boolean;
  setIsMultiSelectionMode: (value: boolean) => void;
}

const defaultBgColor = '#E57373';
const defaultTextColor = '#ffffff';

export const DashboardEventForm = (props: DashboardEventFormProps) => {
  const { selection, onSuccess, setSelection, setIsMultiSelectionMode } = props;
  const { language } = useAppContext();
  const i18n = dashboardEventFormI18n[language];

  const [date, setDate] = useState('');
  const [type, setType] = useState<CalendarEventType | undefined>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#009688');
  const [textColor, setTextColor] = useState(defaultTextColor);

  const exampleDate = {
    date: dayjs().format(dateFormat),
    isOffset: false,
  };

  const newEvent = useMemo(() => {
    return {
      date: exampleDate.date,
      type: type ?? CalendarEventType.Event,
      name: name || 'Nazwa nowego wydarzenia',
      description: description || 'Opis wydarzenia, godzina, miejsce',
      style: {
        background: backgroundColor,
        color: getTextColor(backgroundColor),
      },
      creationTime: 0,
      groupId: '',
      id: '',
      issuer: '',
    };
  }, [backgroundColor, description, name, type, exampleDate.date]);

  const { mutateAsync, isPending } = useFormPutEventMutation({
    onSuccess: () => {
      onSuccess();

      setDate('');
      setType(undefined);
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

      const typeToSave = type?.toUpperCase() as CalendarEventType;
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

  const handleCancel = useCallback(() => {
    setSelection(new Set([]));
    setType(undefined);
    setBackgroundColor(defaultBgColor);
    setTextColor(defaultTextColor);
    setIsMultiSelectionMode(false);
  }, [setSelection]);

  const formClasses = classNames(styles.dashboardEventForm, {
    [styles.isSelectionNotEmpty]: selection.length !== 0,
    [styles.isColorPickerVisible]: selection.length !== 0 && type !== undefined,
  });

  return (
    <>
      <form onSubmit={handleSubmit} className={formClasses}>
        <Stack direction='horizontal' gap={8}>
          <AddIcon />
          <h3 className='mt-0'>{i18n.newPlanTitle}</h3>
        </Stack>
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
            {i18n.cancel}
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

        <Divider className='my-4' />

        <Stack>
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
            <div className='grid auto-rows-max grid-cols-2 gap-2'>
              {Object.keys(CalendarEventType).map((key) => {
                if (
                  [
                    CalendarEventType.Offset,
                    CalendarEventType.Alternating,
                  ].includes(key.toUpperCase() as CalendarEventType)
                ) {
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
            </div>
          </RadioGroup>

          {type !== CalendarEventType.Alternating && (
            <Stack>
              <Divider className='my-2' />
              <Stack direction='horizontal'>
                <VisibilityIcon />
                <h3>{i18n.visibility}</h3>
              </Stack>
              <Stack>
                <CalendarEventListItem
                  event={newEvent}
                  paragraphClassName={styles.exampleItemParagraph}
                  titleClassName={styles.exampleItemTitle}
                />

                <ColorPicker
                  onColorChange={(color) => {
                    setBackgroundColor(color);
                    setTextColor(getTextColor(color));
                  }}
                />
              </Stack>
              <Divider className='my-4' />
            </Stack>
          )}
        </Stack>
      </form>
    </>
  );
};
