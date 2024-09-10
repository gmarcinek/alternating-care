'use client';

import { CalendarEvent } from '@api/db/types';
import { Stack } from '@components/Stack/Stack';
import { UseQueryResult } from '@tanstack/react-query';
import { sortBy } from '@utils/array';
import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import { DashboardEventForm } from '../DashboardEventForm/DashboardEventForm';
import { IncomingEventList } from '../IncomingEventList/IncomingEventList';

interface CalendarFormSectionProps {
  fetchEventsQuery: UseQueryResult<CalendarEvent[], Error>;
  selection: Set<string>;
  setIsMultiSelectionMode: Dispatch<SetStateAction<boolean>>;
  handleCancelMultiSelect: () => void;
  setSelection: Dispatch<SetStateAction<Set<string>>>;
}

export const CalendarFormSection = (props: CalendarFormSectionProps) => {
  const {
    fetchEventsQuery,
    handleCancelMultiSelect,
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
          setIsMultiSelectionMode={setIsMultiSelectionMode}
        />
      </Stack>

      <IncomingEventList data={sortedEvents} selection={selection} />
    </Stack>
  );
};
