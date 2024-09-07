'use client';

import { Stack } from '@components/Stack/Stack';
import { IncomingEventList } from '@modules/DashboardPage/IncomingEventList/IncomingEventList';
import { CalendarEvent } from '@modules/db/types';
import { UseQueryResult } from '@tanstack/react-query';
import { sortBy } from '@utils/array';
import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';
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

  const onAddEventSuccess = useCallback(() => {
    setIsMultiSelectionMode(false);
    handleCancelMultiSelect();
    fetchEventsQuery.refetch();
  }, [
    setIsMultiSelectionMode,
    handleCancelMultiSelect,
    fetchEventsQuery.refetch,
  ]);

  const sortedEvents = useMemo(() => {
    const data = fetchEventsQuery.data || ([] as CalendarEvent[]);
    return sortBy(data, 'creationTime');
  }, [fetchEventsQuery.data]);

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

      <IncomingEventList data={sortedEvents} selection={selection} />
    </Stack>
  );
};
