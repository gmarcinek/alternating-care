'use client';

import { CalendarEvent, CalendarEventType } from '@api/db/types';
import { Calendar } from '@components/Calendar/Calendar';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import { UseQueryResult } from '@tanstack/react-query';
import { sortBy } from '@utils/array';
import { useAppSearchParams } from '@utils/useAppSearchParams';
import classNames from 'classnames';
import dayjs from 'dayjs';

import { useCallback, useMemo, useState } from 'react';
import { useLongPress } from 'use-long-press';
import { CalendarFormSection } from '../CalendarFormSection/CalendarFormSection';
import { CalendarGrid } from '../CalendarGrid/CalendarGrid';
import { CalendarSettingsSection } from '../CalendarSettingsSection/CalendarSettingsSection';
import { useRowSize } from './useRowSize';
import { useSelection } from './useSelection';

import { Stack } from '@components/Stack/Stack';
import { useBreakpoints } from '@utils/useBreakpoints';
import { useEventCounter } from '@utils/useEventCounter';
import styles from './Dashboard.module.scss';

interface DashboardProps {
  fetchEventsQuery: UseQueryResult<CalendarEvent[], Error>;
}

export const Dashboard = (props: DashboardProps) => {
  const { fetchEventsQuery } = props;

  const { groupId, startDate, endDate } = useAppSearchParams();
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
  const { is1280 } = useBreakpoints();
  const [isPlanVisible, setIsPlanVisible] = useState(false);
  const [isAlternatingVisible, setIsAlternatingVisible] = useState(true);
  const [isEventsVisible, setIsEventsVisible] = useState(true);
  const { countEvents } = useEventCounter({
    events: fetchEventsQuery.data,
  });

  const dashboardClasses = classNames(styles.dashboard, {
    [styles.isPlanVisible]: isPlanVisible,
  });

  const formClasses = classNames(
    styles.formContainer,
    'scrollSmall sticky t-20 z-10 h-1'
  );

  const widgetContainerClasses = classNames(
    styles.widgetContainer,
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

  const filteredEvents = useMemo(() => {
    const data = fetchEventsQuery.data || ([] as CalendarEvent[]);

    return !groupId
      ? fetchEventsQuery.data || ([] as CalendarEvent[])
      : data.filter(
          (item) =>
            item.groupId === groupId || item.groupId === groupId?.toUpperCase()
        );
  }, [fetchEventsQuery.data, groupId]);

  const sortedEvents = useMemo(() => {
    const data = filteredEvents;
    return sortBy(data, 'creationTime');
  }, [fetchEventsQuery.data, filteredEvents]);

  const { automaticRowSize } = useRowSize({
    isPlanVisible,
  });

  const startingDate = dayjs(startDate).format(dateFormat);

  const alternatingCount = countEvents({
    endDate,
    startDate,
    eventType: CalendarEventType.Alternating,
  });

  return (
    <div className={dashboardClasses} id='dashboard'>
      <div className={styles.calendarContainer}>
        <CalendarSettingsSection
          isPlanVisible={isPlanVisible}
          setIsPlanVisible={setIsPlanVisible}
          isAlternatingVisible={isAlternatingVisible}
          setIsAlternatingVisible={setIsAlternatingVisible}
          isEventsVisible={isEventsVisible}
          setIsEventsVisible={setIsEventsVisible}
        />

        {is1280 && (
          <Stack direction='horizontal' className='pb-4'>
            <h4>Widoczne dni {alternatingCount.days}</h4>-
            <h4>
              Opieka Moja {alternatingCount.days}/
              <strong>
                <small>{alternatingCount.eventCount} dni</small>
              </strong>
            </h4>
            -
            <h4>
              Drugi rodzic {alternatingCount.days}/
              <strong>
                <small>
                  {alternatingCount.days - alternatingCount.eventCount} dni
                </small>
              </strong>
            </h4>
          </Stack>
        )}

        <div {...bind()}>
          {!isPlanVisible && (
            <CalendarGrid
              data={sortedEvents}
              handlers={handlers}
              isAlternatingVisible={isAlternatingVisible}
              isMultiSelectionMode={isMultiSelectionMode}
              isEventsVisible={isEventsVisible}
              selection={selection}
            />
          )}

          {isPlanVisible && (
            <Calendar
              startDate={startingDate}
              rowSize={automaticRowSize}
              isTodayVisible
              isPlanVisible={isPlanVisible}
              isAlternatingVisible={isAlternatingVisible}
              isEventsVisible={false}
              displayStrategy={'continous'}
              events={sortedEvents}
              {...handlers}
              selection={Array.from(selection)}
              isMultiSelectionMode={isMultiSelectionMode}
            />
          )}
        </div>
      </div>

      <div className={formClasses}>
        <CalendarFormSection
          handleCancelMultiSelect={handleCancelMultiSelect}
          fetchEventsQuery={fetchEventsQuery}
          setIsMultiSelectionMode={setIsMultiSelectionMode}
          selection={selection}
          setSelection={setSelection}
        />
      </div>

      <div className={widgetContainerClasses}></div>
    </div>
  );
};
