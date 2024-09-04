'use client';

import { CalendarItem } from '@components/Calendar/components/CalendarItem/CalendarItem';
import { Stack } from '@components/Stack/Stack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Divider } from '@nextui-org/react';
import { colorNeutralGray900, getTextColor } from '@utils/color';
import { GroupByDateType } from '@utils/dates';
import { capitalizeFirstLetter } from '@utils/string';
import { useScrollToId } from '@utils/useScrollTo';
import dayjs from 'dayjs';
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
    scrollToElement(`day-${date}`, 200, true);
  }, [scrollToElement]);

  return (
    <div onClick={handlePointerOver} id={`event-list-${date}`}>
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
                </Stack>
              </CalendarItem>
            );
          })}
      </Stack>
    </div>
  );
}
