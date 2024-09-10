'use client';

import { useDeleteEventMutation } from '@api/db/events/useDeleteEventMutation';
import { CalendarEvent, CalendarEventType } from '@api/db/types';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import EventList, {
  CalendarEventListRenderProps,
} from '@components/EventList/EventList';
import { Stack } from '@components/Stack/Stack';
import { useDashboardPageContext } from '@modules/DashboardPage/DashboardPage.context';
import { Button } from '@nextui-org/react';
import { sortBy } from '@utils/array';
import { groupByDate } from '@utils/dates';
import { useScrollToId } from '@utils/useScrollTo';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { MdDeleteForever, MdFindInPage } from 'react-icons/md';

interface IncomingEventListProps {
  data: CalendarEvent[];
  selection: Set<string>;
}

export const IncomingEventList = (props: IncomingEventListProps) => {
  const { data, selection } = props;
  const startDate = dayjs().format(dateFormat);
  const { updateAllEvents } = useDashboardPageContext();
  const deleteMutation = useDeleteEventMutation({
    onSuccess() {
      updateAllEvents?.();
    },
  });

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

  const sideContent = ({ event }: CalendarEventListRenderProps) => {
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
          onClick={() => deleteMutation.mutate(event)}
        >
          <h3 style={{ color: 'white', margin: 0 }}>
            <MdDeleteForever size={26} />
          </h3>
        </Button>

        <Button
          isIconOnly
          variant='light'
          aria-label='notify'
          size='md'
          onClick={() => scrollToElement(`day-${event.date}`, 100, true)}
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
          <div>
            {sinceTodayEvents.length === 0 && (
              <Stack>
                <h3>Brak zaplanowanych wydarzeń</h3>
                <p>
                  Zacznij od kliknięcia w dzień kalendarza żeby go zaznaczyć.
                  <br />
                  Możesz zaznaczać wiele dni na raz używając skrótów
                  klawiaturowych z shift, alt i ctrl
                </p>
              </Stack>
            )}
            {sinceTodayEvents.length !== 0 && <>Nadchodzące wydarzenia</>}

            {sinceTodayEvents.map((dayGroup, indexGroup) => {
              return (
                <EventList
                  key={`dayGroup-${dayGroup.date}-${indexGroup}`}
                  date={dayGroup.date}
                  eventGroup={dayGroup}
                  sideEndContent={sideContent}
                />
              );
            })}
          </div>
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
                        <EventList
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
