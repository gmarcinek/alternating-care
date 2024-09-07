'use client';

import { CalendarItem } from '@components/Calendar/components/CalendarItem/CalendarItem';
import { Stack } from '@components/Stack/Stack';
import { CalendarEventType } from '@modules/db/types';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Avatar } from '@mui/material';
import { Divider } from '@nextui-org/react';
import { colorNeutralGray900, getTextColor } from '@utils/color';
import { GroupByDateType } from '@utils/dates';
import { capitalizeFirstLetter } from '@utils/string';
import dayjs from 'dayjs';
import { PropsWithChildren } from 'react';
import { BiTrip } from 'react-icons/bi';
import { IoMdCalendar } from 'react-icons/io';
import { MdCake, MdLocalHospital } from 'react-icons/md';
import style from './CalendarEventList.module.scss';

export interface CalendarEventListRenderProps extends PropsWithChildren {
  date: string;
}

interface CalendarEventListProps extends PropsWithChildren {
  date: string;
  eventGroup: GroupByDateType;
  sideEndContent?: (props: CalendarEventListRenderProps) => React.ReactElement;
}

export default function CalendarEventList(props: CalendarEventListProps) {
  const { date, eventGroup, children, sideEndContent } = props;
  const currentDate = dayjs(date);

  return (
    <div id={`event-list-${date}`}>
      <Stack gap={0}>
        <div>
          <Divider className='my-2 mt-4' />
          <Stack direction='horizontal'>
            <CalendarMonthIcon
              style={{
                color: colorNeutralGray900,
              }}
            />
            <h3 className='mb-1'>
              <strong style={{ color: '#000000' }}>
                {capitalizeFirstLetter(currentDate.format('dddd'))}
              </strong>{' '}
              <span>
                {capitalizeFirstLetter(currentDate.format('D MMMM YYYY'))}
              </span>{' '}
            </h3>
          </Stack>
          <Divider className='mb-2 mt-1' />
        </div>

        {eventGroup.events.length > 0 &&
          eventGroup.events.map((item, index) => {
            return (
              <Stack
                direction='horizontal'
                itemsAlignment='center'
                key={`event-list-${item.name}-${index}`}
              >
                <Avatar
                  variant='circular'
                  style={{
                    width: '64px',
                    height: '64px',
                    background: `${item.style?.background}`,
                  }}
                >
                  {item.type === CalendarEventType.Trip && (
                    <BiTrip
                      color={getTextColor(item.style?.background)}
                      size={32}
                    />
                  )}
                  {item.type === CalendarEventType.Medical && (
                    <MdLocalHospital
                      color={getTextColor(item.style?.background)}
                      size={32}
                    />
                  )}
                  {item.type === CalendarEventType.Event && (
                    <IoMdCalendar
                      color={getTextColor(item.style?.background)}
                      size={32}
                    />
                  )}
                  {item.type === CalendarEventType.Birthday && (
                    <MdCake
                      color={getTextColor(item.style?.background)}
                      size={32}
                    />
                  )}
                </Avatar>

                <CalendarItem
                  mode='none'
                  key={`${item.date}-${index}`}
                  style={{
                    background: `${item.style?.background}`,
                    padding: '16px',
                    marginBottom: '8px',
                  }}
                  day={item}
                  className={style.eventItem}
                  sideEndContent={({ date }) => {
                    return <>{sideEndContent?.({ date })}</>;
                  }}
                >
                  <Stack direction='horizontal' contentAlignment='between'>
                    <Stack gap={0}>
                      <h4
                        style={{ color: getTextColor(item.style?.background) }}
                      >
                        <strong>{item.name}</strong>
                      </h4>
                      <p
                        style={{ color: getTextColor(item.style?.background) }}
                      >
                        {item.description}
                      </p>
                    </Stack>
                    {children}
                  </Stack>
                </CalendarItem>
              </Stack>
            );
          })}
      </Stack>
    </div>
  );
}
