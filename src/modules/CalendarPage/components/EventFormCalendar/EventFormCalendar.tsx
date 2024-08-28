'use client';

import { useAppContext } from '@app/AppContext';
import { Calendar } from '@components/Calendar/Calendar';
import { Stack } from '@components/Stack/Stack';
import { ALTERNATING_DATES } from '@modules/CalendarPage/constants';
import { Divider } from '@nextui-org/divider';
import { Input, Textarea } from '@nextui-org/input';
import { Avatar, Switch } from '@nextui-org/react';
import { Select, SelectItem } from '@nextui-org/select';
import { dateFormat } from '@utils/dates';
import { useBreakpoints } from '@utils/useBreakpoints';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useLongPress } from 'use-long-press';
import { CalendarSettingsForm } from '../CalendarSettingsForm/CalendarSettingsForm';
import { eventFormCalendarI18n } from './eventFormCalendar.i18n';
import styles from './EventFormCalendar.module.scss';
import { useSelection } from './useSelection';

interface EventFormCalendarProps {
  userName: string;
}

export const EventFormCalendar = (props: EventFormCalendarProps) => {
  const { isTablet } = useBreakpoints();
  const [isMultiSelectionMode, setIsMultiSelectionMode] = useState(false);
  const { language } = useAppContext();
  const startDate = dayjs().format(dateFormat);

  const [isTodayVisible, setIsTodayVisible] = useState(true);
  const [isPlanVisible, setIsPlanVisible] = useState(false);
  const [isWeekendsVisible, setIsWeekendsVisible] = useState(true);
  const [isAlternatingVisible, setIsAlternatingVisible] = useState(true);
  const [isContiniousDisplayStrategy, setIsContiniousDisplayStrategy] =
    useState(false);

  const [isLoopedEvent, setIsLoopedEvent] = useState(false);

  const { selection, handleOnDayPointerDown, handleOnDayPointerUp } =
    useSelection({
      isMultiSelectionMode,
      setIsMultiSelectionMode,
    });

  const formClasses = classNames(styles.formContainer, 'sticky t-20 z-10 h-1');

  const bind = useLongPress(
    () => {
      setIsMultiSelectionMode(true);
    },
    {
      filterEvents: (event) => true,
      threshold: 500,
      captureEvent: true,
      cancelOnMovement: 25,
      cancelOutsideElement: true,
    }
  );

  return (
    <Stack gap={0} className={styles.eventFormCalendar}>
      {isTablet && (
        <>
          <Stack>
            <h3>{eventFormCalendarI18n[language].editSection.title}</h3>
            <Stack gap={8} direction='horizontal' className='mb-4'>
              <CalendarSettingsForm
                isTodayVisible={isTodayVisible}
                setIsTodayVisible={setIsTodayVisible}
                isPlanVisible={isPlanVisible}
                setIsPlanVisible={setIsPlanVisible}
                isContiniousDisplayStrategy={isContiniousDisplayStrategy}
                setIsContiniousDisplayStrategy={setIsContiniousDisplayStrategy}
                isWeekendsVisible={isWeekendsVisible}
                setIsWeekendsVisible={setIsWeekendsVisible}
                isAlternatingVisible={isAlternatingVisible}
                setIsAlternatingVisible={setIsAlternatingVisible}
                sliderValue={7}
              />
            </Stack>
          </Stack>
        </>
      )}

      <Stack direction='horizontal' gap={24}>
        <div className={styles.calendarContainer} {...bind()}>
          <Calendar
            startDate={startDate}
            rowSize={7}
            isTodayVisible={isTodayVisible}
            isPlanVisible={isPlanVisible}
            isWeekendsVisible={isWeekendsVisible}
            isAlternatingVisible={isAlternatingVisible}
            displayStrategy={
              isContiniousDisplayStrategy ? 'continous' : 'separateMonths'
            }
            events={ALTERNATING_DATES}
            onDayPointerDown={handleOnDayPointerDown}
            onDayPointerUp={handleOnDayPointerUp}
            selection={Array.from(selection)}
            isMultiSelectionMode={isMultiSelectionMode}
          />
        </div>

        <div className={formClasses}>
          <Stack gap={0}>
            <Stack className={styles.calendarDetails}>
              <h3>{eventFormCalendarI18n[language].editSection.title}</h3>

              <Stack gap={12} direction='horizontal'>
                <CalendarSettingsForm
                  isTodayVisible={isTodayVisible}
                  setIsTodayVisible={setIsTodayVisible}
                  isPlanVisible={isPlanVisible}
                  setIsPlanVisible={setIsPlanVisible}
                  isContiniousDisplayStrategy={isContiniousDisplayStrategy}
                  setIsContiniousDisplayStrategy={
                    setIsContiniousDisplayStrategy
                  }
                  isWeekendsVisible={isWeekendsVisible}
                  setIsWeekendsVisible={setIsWeekendsVisible}
                  isAlternatingVisible={isAlternatingVisible}
                  setIsAlternatingVisible={setIsAlternatingVisible}
                  sliderValue={7}
                />
              </Stack>

              <Divider className='mb-4 mt-8' />

              <Stack>
                <h3 className='mt-0'>
                  {eventFormCalendarI18n[language].editSection.newPlanTitle}
                </h3>
                <Stack direction='horizontal'>
                  <Input
                    type='text'
                    label={eventFormCalendarI18n[language].inputs.eventName}
                    radius='sm'
                    variant='bordered'
                    size='lg'
                  />

                  <Select
                    items={users}
                    label='Assigned to'
                    className='max-w-xs'
                    variant='bordered'
                    classNames={{
                      label: 'group-data-[filled=true]:-translate-y-5',
                      trigger: 'min-h-16',
                      listboxWrapper: 'max-h-[400px]',
                    }}
                    listboxProps={{
                      itemClasses: {
                        base: [
                          'rounded-md',
                          'text-default-500',
                          'transition-opacity',
                          'data-[hover=true]:text-foreground',
                          'data-[hover=true]:bg-default-100',
                          'dark:data-[hover=true]:bg-default-50',
                          'data-[selectable=true]:focus:bg-default-50',
                          'data-[pressed=true]:opacity-70',
                          'data-[focus-visible=true]:ring-default-500',
                        ],
                      },
                    }}
                    popoverProps={{
                      classNames: {
                        base: 'before:bg-default-200',
                        content:
                          'p-0 border-small border-divider bg-background',
                      },
                    }}
                    renderValue={(items) => {
                      return items.map((item) => (
                        <div key={item.key} className='flex items-center gap-2'>
                          <Avatar
                            alt={item?.data?.name}
                            className='flex-shrink-0'
                            size='sm'
                            src={item.data?.avatar}
                          />
                          <div className='flex flex-col'>
                            <span>{item.data?.name}</span>
                            <span className='text-tiny text-default-500'>
                              ({item.data?.email})
                            </span>
                          </div>
                        </div>
                      ));
                    }}
                  >
                    {(user) => (
                      <SelectItem key={user.id} textValue={user.name}>
                        <div className='flex items-center gap-2'>
                          <Avatar
                            alt={user.name}
                            className='flex-shrink-0'
                            size='sm'
                            src={user.avatar}
                          />
                          <div className='flex flex-col'>
                            <span className='text-small'>{user.name}</span>
                            <span className='text-tiny text-default-400'>
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    )}
                  </Select>
                </Stack>
                <Textarea
                  radius='sm'
                  label={
                    eventFormCalendarI18n[language].inputs.eventDescription
                  }
                  variant='bordered'
                  size='lg'
                />
              </Stack>

              <Divider className='my-4' />

              <Stack>
                <h3 className='mt-0'>
                  {eventFormCalendarI18n[language].editSection.cyclicTitle}
                </h3>

                <Switch
                  defaultSelected={isLoopedEvent}
                  onValueChange={setIsLoopedEvent}
                  size='sm'
                  color='warning'
                >
                  {eventFormCalendarI18n[language].switches.repeat}
                </Switch>

                {isLoopedEvent && (
                  <Stack direction='horizontal'>
                    <Input
                      type='number'
                      label={
                        eventFormCalendarI18n[language].inputs
                          .repeatEventEveryXDays
                      }
                      radius='sm'
                      defaultValue='7'
                      max={366}
                      min={1}
                      variant='bordered'
                      size='lg'
                      description={
                        eventFormCalendarI18n[language].descriptions
                          .repeatEventDescription
                      }
                    />
                    <Input
                      type='number'
                      label={
                        eventFormCalendarI18n[language].inputs.repeatEventTimes
                      }
                      radius='sm'
                      defaultValue='2'
                      max={52}
                      min={2}
                      variant='bordered'
                      size='lg'
                    />
                  </Stack>
                )}
              </Stack>

              <Divider className='my-4' />

              <Stack>
                <h3 className='mt-0'>
                  {eventFormCalendarI18n[language].editSection.visibilityTitle}
                </h3>
                <Stack direction='horizontal'>
                  <Input
                    type='color'
                    label={
                      eventFormCalendarI18n[language].inputs.backgroundColor
                    }
                    radius='sm'
                    variant='bordered'
                    defaultValue='#00A9FD'
                    placeholder={
                      eventFormCalendarI18n[language].placeholders
                        .backgroundColor
                    }
                    className='block text-gray-900'
                    size='lg'
                  />
                  <Input
                    type='color'
                    label={eventFormCalendarI18n[language].inputs.textColor}
                    radius='sm'
                    variant='bordered'
                    defaultValue='#ffffff'
                    placeholder={
                      eventFormCalendarI18n[language].placeholders.textColor
                    }
                    className='block text-gray-900'
                    size='lg'
                  />
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </div>
      </Stack>
    </Stack>
  );
};

export const users = [
  {
    id: 1,
    name: 'Tony Reichert',
    role: 'CEO',
    team: 'Management',
    status: 'active',
    age: '29',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/1.png',
    email: 'tony.reichert@example.com',
  },
  {
    id: 2,
    name: 'Zoey Lang',
    role: 'Tech Lead',
    team: 'Development',
    status: 'paused',
    age: '25',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/1.png',
    email: 'zoey.lang@example.com',
  },
  {
    id: 3,
    name: 'Jane Fisher',
    role: 'Sr. Dev',
    team: 'Development',
    status: 'active',
    age: '22',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/2.png',
    email: 'jane.fisher@example.com',
  },
  {
    id: 4,
    name: 'William Howard',
    role: 'C.M.',
    team: 'Marketing',
    status: 'vacation',
    age: '28',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/2.png',
    email: 'william.howard@example.com',
  },
  {
    id: 5,
    name: 'Kristen Copper',
    role: 'S. Manager',
    team: 'Sales',
    status: 'active',
    age: '24',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/3.png',
    email: 'kristen.cooper@example.com',
  },
  {
    id: 6,
    name: 'Brian Kim',
    role: 'P. Manager',
    team: 'Management',
    age: '29',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/3.png',
    email: 'brian.kim@example.com',
    status: 'active',
  },
  {
    id: 7,
    name: 'Michael Hunt',
    role: 'Designer',
    team: 'Design',
    status: 'paused',
    age: '27',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/4.png',
    email: 'michael.hunt@example.com',
  },
  {
    id: 8,
    name: 'Samantha Brooks',
    role: 'HR Manager',
    team: 'HR',
    status: 'active',
    age: '31',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/4.png',
    email: 'samantha.brooks@example.com',
  },
  {
    id: 9,
    name: 'Frank Harrison',
    role: 'F. Manager',
    team: 'Finance',
    status: 'vacation',
    age: '33',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/5.png',
    email: 'frank.harrison@example.com',
  },
  {
    id: 10,
    name: 'Emma Adams',
    role: 'Ops Manager',
    team: 'Operations',
    status: 'active',
    age: '35',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/5.png',
    email: 'emma.adams@example.com',
  },
  {
    id: 11,
    name: 'Brandon Stevens',
    role: 'Jr. Dev',
    team: 'Development',
    status: 'active',
    age: '22',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/7.png',
    email: 'brandon.stevens@example.com',
  },
  {
    id: 12,
    name: 'Megan Richards',
    role: 'P. Manager',
    team: 'Product',
    status: 'paused',
    age: '28',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/7.png',
    email: 'megan.richards@example.com',
  },
  {
    id: 13,
    name: 'Oliver Scott',
    role: 'S. Manager',
    team: 'Security',
    status: 'active',
    age: '37',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/8.png',
    email: 'oliver.scott@example.com',
  },
  {
    id: 14,
    name: 'Grace Allen',
    role: 'M. Specialist',
    team: 'Marketing',
    status: 'active',
    age: '30',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/8.png',
    email: 'grace.allen@example.com',
  },
  {
    id: 15,
    name: 'Noah Carter',
    role: 'IT Specialist',
    team: 'I. Technology',
    status: 'paused',
    age: '31',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/9.png',
    email: 'noah.carter@example.com',
  },
  {
    id: 16,
    name: 'Ava Perez',
    role: 'Manager',
    team: 'Sales',
    status: 'active',
    age: '29',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/9.png',
    email: 'ava.perez@example.com',
  },
  {
    id: 17,
    name: 'Liam Johnson',
    role: 'Data Analyst',
    team: 'Analysis',
    status: 'active',
    age: '28',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/11.png',
    email: 'liam.johnson@example.com',
  },
  {
    id: 18,
    name: 'Sophia Taylor',
    role: 'QA Analyst',
    team: 'Testing',
    status: 'active',
    age: '27',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/11.png',
    email: 'sophia.taylor@example.com',
  },
  {
    id: 19,
    name: 'Lucas Harris',
    role: 'Administrator',
    team: 'Information Technology',
    status: 'paused',
    age: '32',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/male/12.png',
    email: 'lucas.harris@example.com',
  },
  {
    id: 20,
    name: 'Mia Robinson',
    role: 'Coordinator',
    team: 'Operations',
    status: 'active',
    age: '26',
    avatar: 'https://d2u8k2ocievbld.cloudfront.net/memojis/female/12.png',
    email: 'mia.robinson@example.com',
  },
];
