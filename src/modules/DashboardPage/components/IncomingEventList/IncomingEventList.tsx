'use client';

import { useDeleteEventMutation } from '@api/db/events/useDeleteEventMutation';
import { CalendarEvent, CalendarEventType } from '@api/db/types';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import CalendarEventList, {
  CalendarEventListRenderProps,
} from '@components/Calendar/components/CalendarEventList/CalendarEventList';
import { Stack } from '@components/Stack/Stack';
import { Button } from '@nextui-org/react';
import { sortBy } from '@utils/array';
import { groupByDate } from '@utils/dates';
import { useScrollToId } from '@utils/useScrollTo';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { MdFindInPage } from 'react-icons/md';

interface IncomingEventListProps {
  data: CalendarEvent[];
  selection: Set<string>;
}

export const IncomingEventList = (props: IncomingEventListProps) => {
  const { data, selection } = props;
  const startDate = dayjs().format(dateFormat);
  const deleteMutation = useDeleteEventMutation();

  const sortedEvents = useMemo(() => {
    return sortBy(data, 'creationTime');
  }, [data]);

  const sinceThisMonthDates = useMemo(() => {
    return (sortedEvents ?? [])
      .filter((item) => {
        return (
          dayjs(item.date).isAfter(dayjs(startDate).startOf('month')) &&
          item.type !== CalendarEventType.Alternating
        );
      })
      .sort((itemA, itemB) => {
        return dayjs(itemA.date).isAfter(itemB.date) ? 1 : -1;
      });
  }, [sortedEvents, startDate]);

  const sinceThisMonthGroupedEvents = useMemo(() => {
    return groupByDate(sinceThisMonthDates);
  }, [sinceThisMonthDates]);

  const sinceTodayEvents = useMemo(() => {
    return sinceThisMonthGroupedEvents.filter((item) =>
      dayjs(item.date).isAfter(dayjs(startDate).subtract(1, 'day'))
    );
  }, [sinceThisMonthGroupedEvents, startDate]);

  const sideContent = ({ date }: CalendarEventListRenderProps) => {
    const { scrollToElement } = useScrollToId();
    return (
      <Stack
        direction='horizontal'
        contentAlignment='end'
        itemsAlignment='center'
        gap={2}
      >
        <Button
          isIconOnly
          variant='light'
          aria-label='notify'
          size='md'
          // onClick={() => deleteMutation.mutate(data)}
        >
          <b style={{ color: 'white', margin: 0 }}>Usuń</b>
        </Button>
        <Button
          isIconOnly
          variant='light'
          aria-label='notify'
          size='md'
          onClick={() => scrollToElement(`day-${date}`, 100, true)}
        >
          <h3 style={{ color: 'white', margin: 0 }}>
            <MdFindInPage size={26} />
          </h3>
        </Button>
      </Stack>
    );
  };

  return (
    <Stack className='mt-4'>
      <Stack gap={0}>
        {selection.size === 0 && (
          <>
            <h3>
              {sinceTodayEvents.length === 0
                ? 'Brak wydarzeń - dodaj'
                : 'Nadchodzące wydarzenia'}
            </h3>
            {sinceTodayEvents.map((dayGroup, indexGroup) => {
              return (
                <CalendarEventList
                  key={`dayGroup-${dayGroup.date}-${indexGroup}`}
                  date={dayGroup.date}
                  eventGroup={dayGroup}
                  sideEndContent={sideContent}
                />
              );
            })}
          </>
        )}

        {selection.size !== 0 && (
          <>
            <h3>Wydarzenia w zaznaczonych dniach</h3>
            {Array.from(selection).map((selectedItem, index) => {
              return (
                <div key={`dayselect-${selectedItem}-${index}`}>
                  {sinceThisMonthGroupedEvents
                    .filter((group) => {
                      return selectedItem.includes(group.date);
                    })
                    .map((dayGroup, indexGroup) => {
                      return (
                        <CalendarEventList
                          key={`dayGroup-${dayGroup.date}-${indexGroup}`}
                          date={dayGroup.date}
                          eventGroup={dayGroup}
                          sideEndContent={sideContent}
                        />
                      );
                    })}
                </div>
              );
            })}
          </>
        )}
      </Stack>
    </Stack>
  );
};
