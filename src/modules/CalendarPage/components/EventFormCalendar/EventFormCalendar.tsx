'use client';

import { useAppContext } from '@app/AppContext';
import { Calendar } from '@components/Calendar/Calendar';
import CalendarEventList from '@components/Calendar/components/CalendarEventList/CalendarEventList';
import { Stack } from '@components/Stack/Stack';
import { CalendarEvent } from '@modules/db/types';
import AddIcon from '@mui/icons-material/Add';
import { Divider } from '@nextui-org/divider';
import { UseMutationResult } from '@tanstack/react-query';
import { sortBy } from '@utils/array';
import { dateFormat, groupByDate } from '@utils/dates';
import { useBreakpoints } from '@utils/useBreakpoints';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { useLongPress } from 'use-long-press';
import { CalendarEventForm } from '../CalendarEventForm/CalendarEventForm';
import { CalendarSettingsForm } from '../CalendarSettingsForm/CalendarSettingsForm';
import { eventFormCalendarI18n } from './eventFormCalendar.i18n';
import styles from './EventFormCalendar.module.scss';
import { useSelection } from './useSelection';

interface EventFormCalendarProps {
  fetchEventsMutation: UseMutationResult<
    CalendarEvent[],
    unknown,
    void,
    unknown
  >;
}

export const EventFormCalendar = (props: EventFormCalendarProps) => {
  const { fetchEventsMutation } = props;
  const { isTablet } = useBreakpoints();
  const { language } = useAppContext();
  const startDate = dayjs().format(dateFormat);

  const i18n = eventFormCalendarI18n[language];

  const [isTodayVisible, setIsTodayVisible] = useState(true);
  const [isPlanVisible, setIsPlanVisible] = useState(false);
  const [isAlternatingVisible, setIsAlternatingVisible] = useState(true);

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

  const onAddEventSuccess = useCallback(() => {
    setIsMultiSelectionMode(false);
    handleCancelMultiSelect();
    fetchEventsMutation.mutate();
  }, [
    setIsMultiSelectionMode,
    handleCancelMultiSelect,
    fetchEventsMutation.mutate,
  ]);

  const formClasses = classNames(
    styles.formContainer,
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
    const data = fetchEventsMutation.data || ([] as CalendarEvent[]);
    return sortBy(data, 'creationTime');
  }, [fetchEventsMutation.data]);

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

  return (
    <Stack gap={0} className={styles.eventFormCalendar}>
      {isTablet && (
        <>
          <Stack>
            <h3>{i18n.editSection.title}</h3>
            <Stack gap={8} direction='horizontal' className='mb-4'>
              <CalendarSettingsForm
                isPlanVisible={isPlanVisible}
                setIsPlanVisible={setIsPlanVisible}
                isAlternatingVisible={isAlternatingVisible}
                setIsAlternatingVisible={setIsAlternatingVisible}
                sliderValue={7}
              />
            </Stack>
          </Stack>
        </>
      )}

      <Stack direction='horizontal' gap={24}>
        <div className={styles.calendarContainer} {...bind()}>
          <Calendar
            startDate={startDate}
            rowSize={7}
            isTodayVisible={isTodayVisible}
            isPlanVisible={isPlanVisible}
            isAlternatingVisible={isAlternatingVisible}
            displayStrategy={isPlanVisible ? 'continous' : 'separateMonths'}
            events={sortedEvents}
            {...handlers}
            selection={Array.from(selection)}
            isMultiSelectionMode={isMultiSelectionMode}
          />
        </div>

        <div className={formClasses}>
          <div>
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
                  <Stack direction='horizontal' gap={8}>
                    <AddIcon />
                    <h3 className='mt-0'>{i18n.editSection.newPlanTitle}</h3>
                  </Stack>

                  <CalendarEventForm
                    selection={Array.from(selection)}
                    setSelection={setSelection}
                    onSuccess={onAddEventSuccess}
                  />
                </Stack>
              </Stack>

              <Divider className='mb-4 mt-8' />

              <Stack className='mt-8'>
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
        </div>
      </Stack>
    </Stack>
  );
};
