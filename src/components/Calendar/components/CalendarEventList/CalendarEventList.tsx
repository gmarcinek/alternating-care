'use client';

import { Stack } from '@components/Stack/Stack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Divider } from '@nextui-org/react';
import { colorNeutralGray900 } from '@utils/color';
import { GroupByDateType } from '@utils/dates';
import { capitalizeFirstLetter } from '@utils/string';
import dayjs from 'dayjs';
import { PropsWithChildren } from 'react';
import CalendarEventListItem from '../CalendarEventListItem/CalendarEventListItem';

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
      <Stack gap={4}>
        <div>
          <Divider className='my-2 mt-4' />
          <Stack direction='horizontal' gap={8}>
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
              <CalendarEventListItem
                key={`event-list-${item.name}-${index}`}
                event={item}
                sideEndContent={({ date }) => {
                  return <>{sideEndContent?.({ date })}</>;
                }}
              />
            );
          })}
      </Stack>
    </div>
  );
}
