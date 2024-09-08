'use client';

import { Calendar } from '@components/Calendar/Calendar';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import { CalendarEvent } from '@components/Calendar/Calendar.types';
import { UseQueryResult } from '@tanstack/react-query';
import { sortBy } from '@utils/array';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { useLongPress } from 'use-long-press';
import { CalendarEditForm } from '../CalendarEditForm/CalendarEditForm';
import { CalendarGrid } from '../CalendarGrid/CalendarGrid';
import { CalendarSettingsForm } from '../CalendarSettingsForm/CalendarSettingsForm';
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

  const sortedEvents = useMemo(() => {
    const data = fetchEventsQuery.data || ([] as CalendarEvent[]);
    return sortBy(data, 'creationTime');
  }, [fetchEventsQuery.data]);

  const { automaticRowSize } = useRowSize({
    isPlanVisible,
  });

  return (
    <div className={dashboardClasses} id='dashboard'>
      <div className={styles.calendarContainer}>
        <CalendarSettingsForm
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
        <CalendarEditForm
          handleCancelMultiSelect={handleCancelMultiSelect}
          fetchEventsQuery={fetchEventsQuery}
          isMultiSelectionMode={isMultiSelectionMode}
          setIsMultiSelectionMode={setIsMultiSelectionMode}
          selection={selection}
          setSelection={setSelection}
        />
      </div>

      <div className={widgetContainerClasses}></div>
    </div>
  );
};
