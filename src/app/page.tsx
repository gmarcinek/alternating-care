'use client';

import { Calendar } from '@components/Calendar/Calendar';
import { Stack } from '@components/Stack/Stack';

import { Divider } from '@nextui-org/react';
import { dateFormat, groupByDate } from '@utils/dates';
import { useBreakpoints } from '@utils/useBreakpoints';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

import CalendarEventList from '@components/Calendar/components/CalendarEventList/CalendarEventList';
import PageContainer from '@components/PageContainer/PageContainer';
import { CalendarSettingsForm } from '@modules/CalendarPage/components/CalendarSettingsForm/CalendarSettingsForm';
import { CalendarSizeSlider } from '@modules/CalendarPage/components/CalendarSizeSlider/CalendarSizeSlider';
import { useSelection } from '@modules/CalendarPage/components/EventFormCalendar/useSelection';
import { useGetAllEventsMutation } from '@modules/db/events/useGetAllEventsMutation';
import { CalendarEvent } from '@modules/db/types';
import { TodayButton } from '@modules/TodayButton/TodayButton';
import { sortBy } from '@utils/array';
import styles from './page.module.scss';

export default function Page() {
  const startDate = dayjs().format(dateFormat);
  const { isTablet } = useBreakpoints();

  const [sliderValue, setSliderValue] = useState(7);
  const [isTodayVisible, setIsTodayVisible] = useState(true);
  const [isPlanVisible, setIsPlanVisible] = useState(false);
  const [isWeekendsVisible, setIsWeekendsVisible] = useState(true);
  const [isAlternatingVisible, setIsAlternatingVisible] = useState(true);

  const { selection, handlers } = useSelection({});

  const formClasses = classNames(
    styles.formContainer,
    'scrollSmall sticky t-20 z-10 h-1 '
  );
  const { mutation } = useGetAllEventsMutation();

  const sortedEvents = useMemo(() => {
    const data = mutation.data || ([] as CalendarEvent[]);
    return sortBy(data, 'creationTime');
  }, [mutation.data]);

  useEffect(() => {
    void mutation.mutate();
  }, []);

  const detailDates = useMemo(() => {
    return (sortedEvents ?? [])
      .filter((item) => {
        return (
          dayjs(item.date).isAfter(dayjs(startDate).subtract(1, 'day')) &&
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
    <PageContainer>
      <Stack gap={0} className={styles.eventFormCalendar}>
        {isTablet && (
          <>
            <Stack>
              <h3>Przegląd</h3>
              <Stack gap={8} direction='horizontal'>
                <CalendarSettingsForm
                  isPlanVisible={isPlanVisible}
                  setIsPlanVisible={setIsPlanVisible}
                  isAlternatingVisible={isAlternatingVisible}
                  setIsAlternatingVisible={setIsAlternatingVisible}
                  sliderValue={sliderValue}
                />
              </Stack>
            </Stack>

            <div className='sticky top-[64px] z-10 h-12 bg-gray-100 pt-3'>
              <CalendarSizeSlider
                step={1}
                showMarks={false}
                onChange={setSliderValue}
              />
            </div>
          </>
        )}

        <Stack direction='horizontal' gap={24}>
          <div className={styles.calendarContainer}>
            <Calendar
              startDate={startDate}
              rowSize={sliderValue}
              isTodayVisible={isTodayVisible}
              isPlanVisible={isPlanVisible}
              isAlternatingVisible={isAlternatingVisible}
              displayStrategy={isPlanVisible ? 'continous' : 'separateMonths'}
              events={sortedEvents ?? []}
              {...handlers}
              selection={Array.from(selection)}
              isMultiSelectionMode={false}
            />
          </div>

          <div className={formClasses} id={'calendar-event-list-container'}>
            <Stack className={styles.calendarDetails}>
              <h3>Przegląd</h3>
              {!isTablet && (
                <CalendarSizeSlider
                  showMarks
                  step={1}
                  onChange={setSliderValue}
                />
              )}

              <div>
                <Stack gap={12} direction='horizontal'>
                  <CalendarSettingsForm
                    isPlanVisible={isPlanVisible}
                    setIsPlanVisible={setIsPlanVisible}
                    isAlternatingVisible={isAlternatingVisible}
                    setIsAlternatingVisible={setIsAlternatingVisible}
                    sliderValue={sliderValue}
                  />
                </Stack>

                <Divider className='my-8' />

                <Stack>
                  {selection.size === 0 && (
                    <>
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
                </Stack>
              </div>
            </Stack>
          </div>
        </Stack>
      </Stack>
      <TodayButton />
    </PageContainer>
  );
}
