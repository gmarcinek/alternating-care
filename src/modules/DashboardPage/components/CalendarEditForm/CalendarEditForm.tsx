'use client';

import CalendarEventList, {
  CalendarEventListRenderProps,
} from '@components/Calendar/components/CalendarEventList/CalendarEventList';
import { Stack } from '@components/Stack/Stack';
import { CalendarEvent, CalendarEventType } from '@modules/db/types';
import { Button } from '@nextui-org/react';
import { UseQueryResult } from '@tanstack/react-query';
import { sortBy } from '@utils/array';
import { dateFormat, groupByDate } from '@utils/dates';
import { useScrollToId } from '@utils/useScrollTo';
import dayjs from 'dayjs';
import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import { MdDelete, MdFindInPage, MdTune } from 'react-icons/md';
import { DashboardEventForm } from '../DashboardEventForm/DashboardEventForm';

interface CalendarEditFormProps {
  fetchEventsQuery: UseQueryResult<CalendarEvent[], Error>;
  selection: Set<string>;
  isMultiSelectionMode: boolean;
  setIsMultiSelectionMode: Dispatch<SetStateAction<boolean>>;
  handleCancelMultiSelect: () => void;
  setSelection: Dispatch<SetStateAction<Set<string>>>;
}

export const CalendarEditForm = (props: CalendarEditFormProps) => {
  const {
    fetchEventsQuery,
    handleCancelMultiSelect,
    isMultiSelectionMode,
    selection,
    setIsMultiSelectionMode,
    setSelection,
  } = props;

  const startDate = dayjs().format(dateFormat);

  const onAddEventSuccess = useCallback(() => {
    setIsMultiSelectionMode(false);
    handleCancelMultiSelect();
    fetchEventsQuery.refetch();
  }, [
    setIsMultiSelectionMode,
    handleCancelMultiSelect,
    fetchEventsQuery.refetch,
  ]);
  const { scrollToElement } = useScrollToId();

  const sortedEvents = useMemo(() => {
    const data = fetchEventsQuery.data || ([] as CalendarEvent[]);
    return sortBy(data, 'creationTime');
  }, [fetchEventsQuery.data]);

  const detailDates = useMemo(() => {
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

  const detailDataGrouped = useMemo(() => {
    return groupByDate(detailDates);
  }, [detailDates]);

  const incommingEventsFilteredPast = useMemo(() => {
    return detailDataGrouped.filter((item) =>
      dayjs(item.date).isAfter(dayjs(startDate).subtract(1, 'day'))
    );
  }, [detailDataGrouped, startDate]);

  const sideContent = ({ date }: CalendarEventListRenderProps) => {
    const { scrollToElement } = useScrollToId();
    return (
      <Stack
        direction='horizontal'
        contentAlignment='end'
        itemsAlignment='center'
        gap={8}
      >
        <Button
          isIconOnly
          variant='light'
          aria-label='edit'
          size='md'
          onClick={() => console.log('edit', date)}
        >
          <h3 style={{ color: 'white', margin: 0 }}>
            <MdTune size={26} />
          </h3>
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

        <Button
          isIconOnly
          variant='light'
          aria-label='delete'
          size='md'
          onClick={() => console.log('delete', date)}
        >
          <h3 style={{ color: 'white', margin: 0 }}>
            <MdDelete size={26} />
          </h3>
        </Button>
      </Stack>
    );
  };

  return (
    <Stack gap={0}>
      <Stack gap={8}>
        <DashboardEventForm
          selection={Array.from(selection)}
          setSelection={setSelection}
          onSuccess={onAddEventSuccess}
          isMultiSelectionMode={isMultiSelectionMode}
          setIsMultiSelectionMode={setIsMultiSelectionMode}
        />
      </Stack>

      <Stack className='mt-4'>
        <Stack gap={0}>
          {selection.size === 0 && (
            <>
              <h3>
                {incommingEventsFilteredPast.length === 0
                  ? 'Brak wydarzeń - dodaj'
                  : 'Nadchodzące wydarzenia'}
              </h3>
              {incommingEventsFilteredPast.map((dayGroup, indexGroup) => {
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
                    {incommingEventsFilteredPast
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
    </Stack>
  );
};
