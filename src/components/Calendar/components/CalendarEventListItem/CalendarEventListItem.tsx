'use client';

import { CalendarEvent } from '@api/db/types';
import { CalendarItem } from '@components/Calendar/components/CalendarItem/CalendarItem';
import { Stack } from '@components/Stack/Stack';
import { getTextColor } from '@utils/color';
import { PropsWithChildren } from 'react';
import CalendarEventAvatar from '../CalendarEventAvatar/CalendarEventAvatar';
import style from './CalendarEventListItem.module.scss';

export interface CalendarEventListItemRenderProps extends PropsWithChildren {
  date: string;
}

interface CalendarEventListItemProps extends PropsWithChildren {
  event: CalendarEvent;
  paragraphClassName?: string;
  titleClassName?: string;
  className?: string;
  sideEndContent?: (
    props: CalendarEventListItemRenderProps
  ) => React.ReactElement;
}

export default function CalendarEventListItem(
  props: CalendarEventListItemProps
) {
  const {
    children,
    sideEndContent,
    event,
    paragraphClassName,
    titleClassName,
    className,
  } = props;

  return (
    <Stack
      direction='horizontal'
      itemsAlignment='center'
      gap={12}
      className={className}
    >
      <div className={style.avatar}>
        <CalendarEventAvatar event={event} />
      </div>

      <CalendarItem
        mode='none'
        className={style.calendarEventListItem}
        style={{
          background: `${event.style?.background}`,
        }}
        day={event}
        sideEndContent={({ date }) => {
          return <>{sideEndContent?.({ date })}</>;
        }}
      >
        <div>
          <h4
            className={titleClassName}
            style={{ color: getTextColor(event.style?.background) }}
          >
            <strong>{event.name}</strong>
          </h4>
          <p
            className={paragraphClassName}
            style={{ color: getTextColor(event.style?.background) }}
          >
            {event.description}
          </p>
        </div>
        <div>{children}</div>
      </CalendarItem>
    </Stack>
  );
}
