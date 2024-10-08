'use client';
import { CalendarEventType } from '@api/db/types';
import { useAppContext } from '@app/AppContext';
import { Button } from '@components/Button/Button';
import ColorPicker from '@components/ColorPicker/ColorPicker';
import EventListItem from '@components/EventList/components/EventListItem/EventListItem';
import { Stack } from '@components/Stack/Stack';
import AddIcon from '@mui/icons-material/Add';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { Divider, Input, Textarea } from '@nextui-org/react';
import { getTextColor } from '@utils/color';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { Dispatch, SetStateAction, useEffect, useMemo } from 'react';
import { BsTags } from 'react-icons/bs';
import { MdOutlineVisibility } from 'react-icons/md';
import { dashboardEventFormI18n } from './dashboardEventForm.i18n'; // Import your i18n file
import styles from './dashboardEventForm.module.scss';
import { DashboardEventFormTypeSelectInput } from './DashboardEventFormTypeSelectInput';
import { useDashboardEventForm } from './useDashboardEventForm';
import { useDashboardEventFormAnimations } from './useDashboardEventFormAnimations';

interface DashboardEventFormProps {
  selection: string[];
  setSelection: Dispatch<SetStateAction<Set<string>>>;
  onSuccess: () => void;
  setIsMultiSelectionMode: (value: boolean) => void;
}

export const DashboardEventForm = (props: DashboardEventFormProps) => {
  const { selection, onSuccess, setSelection, setIsMultiSelectionMode } = props;
  const { language } = useAppContext();
  const i18n = dashboardEventFormI18n[language];

  // Animation state
  const {
    handleAnimationColapseEnd,
    handleAnimationOpenStart,
    isRadioGroupVisible,
    setIsRadioGroupVisible,
  } = useDashboardEventFormAnimations();

  // Form
  const {
    description,
    name,
    formPutEventMutation,
    type,
    newEvent,
    handleReset,
    handleCancel,
    handleSubmit,
    setBackgroundColor,
    setDescription,
    setName,
    setTextColor,
    setType,
  } = useDashboardEventForm({
    onSuccess,
    selection,
    setIsMultiSelectionMode,
    setIsRadioGroupVisible,
    setSelection,
  });

  const formClasses = classNames(styles.dashboardEventForm, {
    [styles.isSelectionNotEmpty]: selection.length !== 0,
    [styles.isColorPickerVisible]: selection.length !== 0 && type !== undefined,
  });

  useEffect(() => {
    if (selection.length === 0) {
      handleReset();
    }
  }, [selection.length, handleReset]);

  const selectedDaysHelper = useMemo(() => {
    const sordedSelection = selection.sort();
    const first = dayjs(sordedSelection.at(0)).format('MM.DD');
    const last = dayjs(sordedSelection.at(sordedSelection.length - 1)).format(
      'MM.DD'
    );

    return {
      sordedSelection,
      first,
      last,
    };
  }, [selection]);

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className={formClasses}
        onAnimationStart={handleAnimationOpenStart}
        onAnimationEnd={handleAnimationColapseEnd}
      >
        <Stack direction='horizontal' gap={8}>
          <AddIcon />
          {selection.length !== 0 && (
            <h3>
              Wybrano{' '}
              <strong>
                {`${selection.length} ${selection.length === 1 ? 'dzień' : 'dni'}`}
              </strong>
              {' - '}
              {selection.length === 1 ? (
                <small>{selectedDaysHelper.first}</small>
              ) : (
                <small>
                  {selectedDaysHelper.first}
                  {' / '}
                  {selectedDaysHelper.last}
                </small>
              )}
            </h3>
          )}
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
            isDisabled={
              selection.length === 0 || formPutEventMutation.isPending
            }
            className='mt-2'
            radius='sm'
            variant='solid'
            color='danger'
          >
            <EventAvailableIcon />
            {formPutEventMutation.isPending ? i18n.saving : i18n.addEvent}
          </Button>
        </Stack>

        <Divider className='my-4' />

        <Stack>
          <Stack>
            {isRadioGroupVisible && (
              <>
                <Stack direction='horizontal'>
                  <BsTags size={24} />
                  <h3>{i18n.eventType}</h3>
                </Stack>
                <DashboardEventFormTypeSelectInput
                  onValueChange={(value) => {
                    setType(value as CalendarEventType);
                  }}
                />
              </>
            )}

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

            <Divider className='my-2' />

            <Stack direction='horizontal'>
              <MdOutlineVisibility size={24} />
              <h3>{i18n.visibility}</h3>
            </Stack>

            <Stack>
              <EventListItem
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
        </Stack>
      </form>
    </>
  );
};
