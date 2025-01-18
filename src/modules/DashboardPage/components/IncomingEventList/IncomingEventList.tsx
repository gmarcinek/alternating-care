'use client';

import { useDeleteEventMutation } from '@api/db/events/useDeleteEventMutation';
import { CalendarEvent, CalendarEventType } from '@api/db/types';
import { useAppContext } from '@app/AppContext';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import EventList, {
  CalendarEventListRenderProps,
} from '@components/EventList/EventList';
import { Stack } from '@components/Stack/Stack';
import { useDashboardPageContext } from '@modules/DashboardPage/DashboardPage.context';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from '@nextui-org/react';
import { sortBy } from '@utils/array';
import { groupByDate } from '@utils/dates';
import { useScrollToId } from '@utils/useScrollTo';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { BsCalendar3, BsFilterCircle, BsSearch } from 'react-icons/bs';
import { MdDeleteForever, MdMoreVert } from 'react-icons/md';
import { incomingEventListI18n } from './incomingEventList.i18n';

interface IncomingEventListProps {
  data: CalendarEvent[];
  selection: Set<string>;
}

export const IncomingEventList = (props: IncomingEventListProps) => {
  const { data, selection } = props;

  const { language } = useAppContext();
  const i18n = incomingEventListI18n[language];

  const todayDate = dayjs().format(dateFormat);

  const { updateAllEvents } = useDashboardPageContext();
  const router = useRouter();

  const deleteMutation = useDeleteEventMutation({
    onSuccess() {
      updateAllEvents?.();
    },
  });

  const sortedEvents = useMemo(() => {
    return sortBy(data, 'creationTime');
  }, [data]);

  const nonAlternatingEvents = useMemo(() => {
    return (sortedEvents ?? [])
      .filter((item) => {
        return item.type !== CalendarEventType.Alternating;
      })
      .sort((itemA, itemB) => {
        return dayjs(itemA.date).isAfter(itemB.date) ? 1 : -1;
      });
  }, [sortedEvents, todayDate]);

  const sinceThisMonthGroupedEvents = useMemo(() => {
    return groupByDate(nonAlternatingEvents);
  }, [nonAlternatingEvents]);

  const sinceTodayEvents = useMemo(() => {
    return sinceThisMonthGroupedEvents.filter((item) =>
      dayjs(item.date).isAfter(dayjs(todayDate).subtract(1, 'day'))
    );
  }, [sinceThisMonthGroupedEvents, todayDate]);

  const sideContent = ({ event }: CalendarEventListRenderProps) => {
    const { scrollToElement } = useScrollToId();
    const handleOnEditClick = useCallback(() => {
      const startDate = dayjs(event.date)
        .subtract(1, 'month')
        .startOf('month')
        .format(dateFormat);

      const endDate = dayjs(startDate)
        .add(11, 'month')
        .endOf('month')
        .format(dateFormat);

      router.push(
        `/edit?groupId=${event.groupId}&startDate=${startDate}&endDate=${endDate}`
      );
    }, [event.date, event.groupId]);

    return (
      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly variant='light' aria-label='notify' size='md'>
            <h3 style={{ color: 'white', margin: 0 }}>
              <MdMoreVert size={26} />
            </h3>
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          variant='faded'
          aria-label='Dropdown menu with description'
        >
          <DropdownSection title='Akcje' showDivider>
            <DropdownItem
              key='filter'
              description={i18n.showAllOccurrencesDescription}
              startContent={
                <h3 style={{ margin: 0 }}>
                  <BsFilterCircle size={26} />
                </h3>
              }
              onClick={() => {
                router.push(`/?groupId=${event.groupId}`);
              }}
            >
              {i18n.showAllOccurrences}
            </DropdownItem>

            <DropdownItem
              key='edit'
              description={i18n.editDescription}
              startContent={
                <h3 style={{ margin: 0 }}>
                  <BsCalendar3 size={26} />
                </h3>
              }
              onClick={handleOnEditClick}
            >
              {i18n.edit}
            </DropdownItem>

            <DropdownItem
              key='find'
              description={i18n.findTheDayDescription}
              onClick={() => {
                scrollToElement(`day-${event.date}`, 0, true);
              }}
              startContent={
                <h3 style={{ margin: 0 }}>
                  <BsSearch size={26} />
                </h3>
              }
            >
              {i18n.findTheDay}
            </DropdownItem>
          </DropdownSection>

          <DropdownSection title={i18n.dangerZone}>
            <DropdownItem
              key='delete'
              className='text-danger'
              color='danger'
              description={i18n.deleteDescription}
              onClick={() => deleteMutation.mutate(event)}
              startContent={
                <h3 style={{ color: 'red', margin: 0 }}>
                  <MdDeleteForever size={26} />
                </h3>
              }
            >
              {i18n.delete}
            </DropdownItem>
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    );
  };

  return (
    <Stack className='mt-0'>
      <Stack gap={8}>
        {selection.size === 0 && (
          <div>
            {sinceTodayEvents.length === 0 && <Stack>{i18n.emptyInfo}</Stack>}
            {sinceTodayEvents.length !== 0 && <h3>{i18n.approachingEvents}</h3>}

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
          <div className='mt-8'>
            <h3>
              <strong>{i18n.selectedDayRangeEvents}</strong>
            </h3>
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
          </div>
        )}
      </Stack>
    </Stack>
  );
};
