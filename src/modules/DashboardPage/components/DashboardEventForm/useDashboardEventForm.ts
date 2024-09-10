import { useFormPutEventMutation } from '@api/db/events/useFormPutEventMutation';
import { CalendarEventType } from '@api/db/types';
import { useAppContext } from '@app/AppContext';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import { colorBlueGreen700, getTextColor, white } from '@utils/color';
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
import { dashboardEventFormI18n } from './dashboardEventForm.i18n';

const defaultBgColor = '#E57373';
const defaultTextColor = '#ffffff';

interface useDashboardEventFormProps {
  setIsRadioGroupVisible: Dispatch<SetStateAction<boolean>>;
  selection: string[];
  setSelection: Dispatch<SetStateAction<Set<string>>>;
  onSuccess: () => void;
  setIsMultiSelectionMode: (value: boolean) => void;
}

export const useDashboardEventForm = (props: useDashboardEventFormProps) => {
  const {
    onSuccess,
    setIsRadioGroupVisible,
    selection,
    setIsMultiSelectionMode,
    setSelection,
  } = props;

  const [date, setDate] = useState('');
  const [type, setType] = useState<CalendarEventType | undefined>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#009688');
  const [textColor, setTextColor] = useState(defaultTextColor);

  const { language } = useAppContext();
  const i18n = dashboardEventFormI18n[language];

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

  const formPutEventMutation = useFormPutEventMutation({
    onSuccess: () => {
      onSuccess();
      setIsRadioGroupVisible(false);

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
        await formPutEventMutation.mutateAsync(newEvents);
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
      formPutEventMutation.mutateAsync,
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
    setDate('');
    setName('');
    setDescription('');
  }, [setSelection]);

  const handleReset = useCallback(() => {
    setType(undefined);
    setBackgroundColor(defaultBgColor);
    setTextColor(defaultTextColor);
    setDate('');
    setName('');
    setDescription('');
  }, [setSelection]);

  return {
    handleSubmit,
    handleCancel,
    formPutEventMutation,
    date,
    setDate,
    type,
    setType,
    name,
    setName,
    description,
    setDescription,
    backgroundColor,
    setBackgroundColor,
    textColor,
    setTextColor,
    newEvent,
    handleReset,
  };
};
