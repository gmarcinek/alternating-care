'use client';

import { CalendarItem } from '@components/Calendar/components/CalendarItem/CalendarItem';
import { Stack } from '@components/Stack/Stack';

import { Divider } from '@nextui-org/react';
import { GroupByDateType } from '@utils/dates';
import dayjs from 'dayjs';

import { capitalizeFirstLetter } from '@utils/string';
import { useScrollToId } from '@utils/useScrollTo';
import { useCallback } from 'react';

interface CalendarEventListProps {
  date: string;
  eventGroup: GroupByDateType;
}

export default function CalendarEventList(props: CalendarEventListProps) {
  const { date, eventGroup } = props;
  const currentDate = dayjs(date);
  const { scrollToElement } = useScrollToId();
  const handlePointerOver = useCallback(() => {
    scrollToElement(`day-${date}`, 200);
  }, [scrollToElement]);

  return (
    <div onClick={handlePointerOver}>
      <Stack gap={0}>
        <div>
          <Divider className='my-2' />
          <h3>
            <strong style={{ color: '#000000' }}>
              {capitalizeFirstLetter(currentDate.format('dddd'))}
            </strong>{' '}
            <span>
              {capitalizeFirstLetter(currentDate.format('D MMMM YYYY'))}
            </span>{' '}
          </h3>
          <Divider className='mb-3' />
        </div>

        {eventGroup.events.length > 0 &&
          eventGroup.events.map((item, index) => {
            return (
              <CalendarItem
                mode='none'
                key={`${item.date}-${index}`}
                style={{
                  background: `${item.style?.background}44`,
                  padding: '16px',
                  marginBottom: '8px',
                }}
                day={item}
              >
                <h4>
                  <strong>{item.name}</strong>
                </h4>
                <p>{item.description}</p>
              </CalendarItem>
            );
          })}
      </Stack>
    </div>
  );
}
