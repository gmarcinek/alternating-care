'use client';

import { CalendarItem } from '@components/Calendar/components/CalendarItem/CalendarItem';
import { Stack } from '@components/Stack/Stack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Divider } from '@nextui-org/react';
import { colorNeutralGray900, getTextColor } from '@utils/color';
import { GroupByDateType } from '@utils/dates';
import { capitalizeFirstLetter } from '@utils/string';
import dayjs from 'dayjs';
import { PropsWithChildren } from 'react';
import style from './CalendarEventList.module.scss';

interface CalendarEventListProps extends PropsWithChildren {
  date: string;
  eventGroup: GroupByDateType;
}

export default function CalendarEventList(props: CalendarEventListProps) {
  const { date, eventGroup, children } = props;
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
              >
                <Stack direction='horizontal' contentAlignment='between'>
                  <Stack gap={0}>
                    <h4 style={{ color: getTextColor(item.style?.background) }}>
                      <strong>{item.name}</strong>
                    </h4>
                    <p style={{ color: getTextColor(item.style?.background) }}>
                      {item.description}
                    </p>
                  </Stack>
                  {children}
                </Stack>
              </CalendarItem>
            );
          })}
      </Stack>
    </div>
  );
}
