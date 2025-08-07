'use client';

import { CalendarEvent, CalendarEventType } from '@api/db/types';
import { dateFormat } from '@components/Calendar/Calendar.helpers';
import { Stack } from '@components/Stack/Stack';
import dayjs from 'dayjs';
import Link from 'next/link';
import { Key, useMemo } from 'react';
import { BsSearch } from 'react-icons/bs';

interface AnalyticsWidgetProps {
  events: CalendarEvent[];
  eventType: CalendarEventType[];
  label: string;
}

export const AnalyticsWidget = (props: AnalyticsWidgetProps) => {
  const { events, eventType, label } = props;

  const tripGroups = useMemo(() => {
    // Filtruj tylko eventy typu TRIP
    const tripEvents = events.filter((e) => eventType.includes(e.type));

    if (tripEvents.length === 0) return [];

    // Grupuj po groupId wyjazdu
    const groups = new Map();

    tripEvents.forEach((event) => {
      const groupId = event.groupId;
      const tripName = event.name || 'Bez nazwy';

      if (!groups.has(groupId)) {
        groups.set(groupId, {
          groupId: groupId,
          name: tripName,
          events: [],
          startDate: event.date,
          endDate: event.date,
          color: event.style?.background || '#ccc',
        });
      }

      const group = groups.get(groupId);
      group.events.push(event);

      // Aktualizuj zakres dat
      if (dayjs(event.date).isBefore(group.startDate)) {
        group.startDate = event.date;
      }
      if (dayjs(event.date).isAfter(group.endDate)) {
        group.endDate = event.date;
      }
    });

    // Sortuj wg daty rozpoczęcia
    return Array.from(groups.values()).sort(
      (a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix()
    );
  }, [events]);

  if (tripGroups.length === 0) {
    return (
      <Stack contentAlignment='center' style={{ minHeight: '200px' }}>
        <p>Brak {label}</p>
      </Stack>
    );
  }

  return (
    <Stack gap={16} style={{ height: '100%', overflow: 'auto' }}>
      <div>
        <h3>
          {label} ({tripGroups.length})
        </h3>
        <small style={{ color: '#666' }}>Każdy kwadracik = dzień </small>
      </div>

      <Stack gap={12}>
        {tripGroups.map((trip) => (
          <div
            key={trip.groupId}
            style={{
              padding: '12px',
              backgroundColor: '#fafafa',
              borderRadius: '6px',
              border: '1px solid #eee',
            }}
          >
            <Stack gap={4}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px' }}>{trip.name}</h4>
                  <small style={{ color: '#666' }}>
                    {dayjs(trip.startDate).format('DD.MM.YYYY')} -{' '}
                    {dayjs(trip.endDate).format('DD.MM.YYYY')} (
                    {trip.events.length} dni)
                  </small>
                </div>

                <Link
                  href={(() => {
                    const startCalendarDate = dayjs(trip.startDate)
                      .startOf('month')
                      .format(dateFormat);
                    const endCalendarDate = dayjs(trip.startDate)
                      .startOf('month')
                      .add(11, 'month')
                      .endOf('month')
                      .format(dateFormat);
                    return `/?groupId=${trip.groupId}&startDate=${startCalendarDate}&endDate=${endCalendarDate}`;
                  })()}
                  style={{
                    background: 'none',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                  }}
                  title='Pokaż w kalendarzu'
                >
                  <BsSearch size={18} />
                </Link>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '2px',
                  flexWrap: 'wrap',
                }}
              >
                {trip.events
                  .sort(
                    (
                      a: { date: dayjs.ConfigType },
                      b: { date: dayjs.ConfigType }
                    ) => dayjs(a.date).unix() - dayjs(b.date).unix()
                  )
                  .map(
                    (event: {
                      date: dayjs.ConfigType;
                      id: Key | null | undefined;
                      description: string;
                    }) => {
                      const isToday = dayjs(event.date).isSame(dayjs(), 'day');
                      const isFuture = dayjs(event.date).isAfter(
                        dayjs(),
                        'day'
                      );

                      return (
                        <div
                          key={event.id}
                          style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: trip.color,
                            border: isToday
                              ? '2px solid #dc2626'
                              : '1px solid #ddd',
                            borderRadius: '2px',
                            opacity: isFuture ? 0.3 : 1,
                            cursor: 'pointer',
                          }}
                          title={`${dayjs(event.date).format('DD.MM.YYYY')}${event.description ? ': ' + event.description : ''}`}
                        />
                      );
                    }
                  )}
              </div>
            </Stack>
          </div>
        ))}
      </Stack>
    </Stack>
  );
};
