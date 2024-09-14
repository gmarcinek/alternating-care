'use client';
import { useAppContext } from '@app/AppContext';

import { CalendarEventType } from '@api/db/types';
import { Radio, RadioGroup } from '@nextui-org/react';
import { capitalizeFirstLetter } from '@utils/string';
import { dashboardEventFormI18n } from './dashboardEventForm.i18n'; // Import your i18n file
interface DashboardEventFormTypeSelectInputProps {
  onValueChange: (value: string) => void;
}

export const DashboardEventFormTypeSelectInput = (
  props: DashboardEventFormTypeSelectInputProps
) => {
  const { onValueChange } = props;
  const { language } = useAppContext();
  const i18n = dashboardEventFormI18n[language];

  return (
    <RadioGroup onValueChange={onValueChange}>
      <div className='grid auto-rows-max grid-cols-3 gap-2'>
        {Object.keys(CalendarEventType).map((key) => {
          if (
            [CalendarEventType.Offset, CalendarEventType.Alternating].includes(
              key.toUpperCase() as CalendarEventType
            )
          ) {
            return;
          }

          return (
            <Radio
              key={key}
              value={CalendarEventType[key as keyof typeof CalendarEventType]}
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
  );
};
