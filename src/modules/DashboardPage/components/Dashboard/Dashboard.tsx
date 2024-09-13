'use client';

import { CalendarEvent } from '@api/db/types';
import { Calendar } from '@components/Calendar/Calendar';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import { useDashboardPageContext } from '@modules/DashboardPage/DashboardPage.context';
import { UseQueryResult } from '@tanstack/react-query';
import { sortBy } from '@utils/array';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { useLongPress } from 'use-long-press';
import { CalendarFormSection } from '../CalendarFormSection/CalendarFormSection';
import { CalendarGrid } from '../CalendarGrid/CalendarGrid';
import { CalendarSettingsSection } from '../CalendarSettingsSection/CalendarSettingsSection';
import styles from './Dashboard.module.scss';
import { useRowSize } from './useRowSize';
import { useSelection } from './useSelection';

interface DashboardProps {
  fetchEventsQuery: UseQueryResult<CalendarEvent[], Error>;
}

export const Dashboard = (props: DashboardProps) => {
  const { fetchEventsQuery } = props;
  const { groupId, mode, range } = useDashboardPageContext();
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
  const [isEventsVisible, setIsEventsVisible] = useState(true);

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
              startDate={startDate}
              rowSize={automaticRowSize}
              isTodayVisible
              isPlanVisible={isPlanVisible}
              isAlternatingVisible={isAlternatingVisible}
              isEventsVisible={false}
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
