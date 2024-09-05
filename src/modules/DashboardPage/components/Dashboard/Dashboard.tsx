'use client';

import { Calendar } from '@components/Calendar/Calendar';
import CalendarEventList from '@components/Calendar/components/CalendarEventList/CalendarEventList';
import { Stack } from '@components/Stack/Stack';
import { CalendarEvent } from '@modules/db/types';
import { Divider } from '@nextui-org/divider';
import { UseQueryResult } from '@tanstack/react-query';
import { sortBy } from '@utils/array';
import { dateFormat, groupByDate } from '@utils/dates';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { useLongPress } from 'use-long-press';
import { CalendarSettingsForm } from '../CalendarSettingsForm/CalendarSettingsForm';
import { DashboardEventForm } from '../DashboardEventForm/DashboardEventForm';
import styles from './Dashboard.module.scss';
import { useRowSize } from './useRowSize';
import { useSelection } from './useSelection';

interface DashboardProps {
  fetchEventsQuery: UseQueryResult<CalendarEvent[], Error>;
}

export const Dashboard = (props: DashboardProps) => {
  const { fetchEventsQuery } = props;

  const startDate = dayjs().format(dateFormat);

  const {
    selection,
    handlers,
    isMultiSelectionMode,
    setIsMultiSelectionMode,
    handleCancelMultiSelect,
    setSelection,
  } = useSelection({
    isMultiSelectionAvailable: true,
  });

  const [isPlanVisible, setIsPlanVisible] = useState(false);
  const [isAlternatingVisible, setIsAlternatingVisible] = useState(true);

  const onAddEventSuccess = useCallback(() => {
    setIsMultiSelectionMode(false);
    handleCancelMultiSelect();
    fetchEventsQuery.refetch();
  }, [
    setIsMultiSelectionMode,
    handleCancelMultiSelect,
    fetchEventsQuery.refetch,
  ]);

  const dashboardClasses = classNames(styles.dashboard, {
    [styles.isPlanVisible]: isPlanVisible,
  });

  const formClasses = classNames(
    styles.formContainer,
    'scrollSmall sticky t-20 z-10 h-1'
  );

  const eventListClasses = classNames(
    styles.eventListContainer,
    'scrollSmall sticky t-20 z-10 h-1'
  );

  const handleLongPress = useCallback(() => {
    setIsMultiSelectionMode(true);
  }, []);

  const bind = useLongPress(handleLongPress, {
    filterEvents: (event) => true,
    threshold: 500,
    captureEvent: true,
    cancelOnMovement: 25,
    cancelOutsideElement: true,
  });

  const sortedEvents = useMemo(() => {
    const data = fetchEventsQuery.data || ([] as CalendarEvent[]);
    return sortBy(data, 'creationTime');
  }, [fetchEventsQuery.data]);

  const detailDates = useMemo(() => {
    return (sortedEvents ?? [])
      .filter((item) => {
        return (
          dayjs(item.date).isAfter(dayjs(startDate).subtract(2, 'day')) &&
          item.type !== 'ALTERNATING'
        );
      })
      .sort((itemA, itemB) => {
        return dayjs(itemA.date).isAfter(itemB.date) ? 1 : -1;
      });
  }, [sortedEvents, startDate]);

  const detailDataGrouped = useMemo(() => {
    return groupByDate(detailDates);
  }, [detailDates]);

  const rowSize = useRowSize({
    isPlanVisible,
  });

  return (
    <div className={dashboardClasses} id='dashboard'>
      <div className={styles.calendarContainer}>
        <div {...bind()}>
          {rowSize === 30 && (
            <Stack>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((m, index) => {
                return (
                  <Calendar
                    key={`month-plan-view-${index}`}
                    startDate={dayjs(startDate)
                      .add(index, 'month')
                      .startOf('month')
                      .format(dateFormat)}
                    endDate={dayjs(startDate)
                      .add(index, 'month')
                      .endOf('month')
                      .add(1, 'day')
                      .format(dateFormat)}
                    rowSize={30}
                    isTodayVisible
                    isPlanVisible
                    isWeekendsVisible
                    isAlternatingVisible
                    displayStrategy='continous'
                    events={sortedEvents ?? []}
                    {...handlers}
                    selection={Array.from(selection)}
                    isMultiSelectionMode={false}
                  />
                );
              })}
            </Stack>
          )}
          {rowSize !== 30 && (
            <Calendar
              startDate={startDate}
              rowSize={rowSize}
              isTodayVisible
              isPlanVisible={isPlanVisible}
              isAlternatingVisible={isAlternatingVisible}
              displayStrategy={isPlanVisible ? 'continous' : 'separateMonths'}
              events={sortedEvents}
              {...handlers}
              selection={Array.from(selection)}
              isMultiSelectionMode={isMultiSelectionMode}
            />
          )}
        </div>
      </div>

      <div className={formClasses}>
        <Stack gap={0}>
          <Stack className={styles.calendarDetails}>
            <Stack gap={12} direction='horizontal'>
              <CalendarSettingsForm
                isPlanVisible={isPlanVisible}
                setIsPlanVisible={setIsPlanVisible}
                isAlternatingVisible={isAlternatingVisible}
                setIsAlternatingVisible={setIsAlternatingVisible}
                sliderValue={7}
              />
            </Stack>

            <Divider className='mb-2 mt-4' />

            <Stack gap={8}>
              <DashboardEventForm
                selection={Array.from(selection)}
                setSelection={setSelection}
                onSuccess={onAddEventSuccess}
                isMultiSelectionMode={isMultiSelectionMode}
                setIsMultiSelectionMode={setIsMultiSelectionMode}
              />
            </Stack>
          </Stack>

          <Stack className='mt-4'>
            <Stack gap={0}>
              {selection.size === 0 && (
                <>
                  <h3>
                    {detailDataGrouped.length === 0
                      ? 'Brak wydarzeń - dodaj'
                      : 'Nadchodzące wydarzenia'}
                  </h3>
                  {detailDataGrouped.map((dayGroup, indexGroup) => {
                    return (
                      <CalendarEventList
                        key={`dayGroup-${dayGroup.date}-${indexGroup}`}
                        date={dayGroup.date}
                        eventGroup={dayGroup}
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
                        {detailDataGrouped
                          .filter((group) => {
                            return selectedItem.includes(group.date);
                          })
                          .map((dayGroup, indexGroup) => {
                            return (
                              <CalendarEventList
                                key={`dayGroup-${dayGroup.date}-${indexGroup}`}
                                date={dayGroup.date}
                                eventGroup={dayGroup}
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
      </div>

      <div className={eventListClasses}></div>
    </div>
  );
};
