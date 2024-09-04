'use client';
import { useAppContext } from '@app/AppContext';
import { Button } from '@components/Button/Button';
import { CalendarItem } from '@components/Calendar/components/CalendarItem/CalendarItem';
import { Stack } from '@components/Stack/Stack';
import { useFormPutEventMutation } from '@modules/db/events/useFormPutEventMutation';
import { CalendarEventType } from '@modules/db/types';
import AddIcon from '@mui/icons-material/Add';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Divider, Input, Radio, RadioGroup, Textarea } from '@nextui-org/react';
import { colorBlueGreen700, getTextColor, swatches, white } from '@utils/color';
import { dateFormat } from '@utils/dates';
import { capitalizeFirstLetter } from '@utils/string';
import classNames from 'classnames';
import crypto from 'crypto';
import dayjs from 'dayjs';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { ColorResult, SwatchesPicker } from 'react-color';
import { toast } from 'react-toastify';
import { dashboardEventFormI18n } from './dashboardEventForm.i18n'; // Import your i18n file
import styles from './dashboardEventForm.module.scss';

interface DashboardEventFormProps {
  selection: string[];
  setSelection: Dispatch<SetStateAction<Set<string>>>;
  onSuccess: () => void;
  isMultiSelectionMode: boolean;
  setIsMultiSelectionMode: (value: boolean) => void;
}

export const DashboardEventForm = (props: DashboardEventFormProps) => {
  const {
    selection,
    onSuccess,
    setSelection,
    isMultiSelectionMode,
    setIsMultiSelectionMode,
  } = props;
  const { language } = useAppContext();
  const i18n = dashboardEventFormI18n[language];

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
    setIsMultiSelectionMode(false);
  }, [setSelection]);

  const formClasses = classNames(styles.dashboardEventForm, {
    [styles.isSelectionNotEmpty]: selection.length !== 0,
    [styles.isColorPickerVisible]:
      selection.length !== 0 && type !== CalendarEventType.Alternating,
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

        <Divider className='my-4' />

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
              <Stack contentAlignment='between' direction='horizontal'>
                <SwatchesPicker
                  height={364}
                  width={473}
                  className={styles.swatches}
                  onChange={(value: ColorResult) => {
                    setBackgroundColor(value.hex);
                  }}
                  onChangeComplete={(value: ColorResult) => {
                    setTextColor(getTextColor(value.hex));
                  }}
                  colors={swatches}
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
              </Stack>
              <Divider className='my-4' />
            </Stack>
          )}
        </Stack>
      </form>
    </>
  );
};
