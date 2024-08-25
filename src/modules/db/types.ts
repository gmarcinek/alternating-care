export interface AppUser {
  id: string;
  name: string;
  startDate: string;
  countingRange: string;
}

export enum CalendarEventType {
  Alternating = 'ALTERNATING',
  Event = 'EVENT',
  Select = 'SELECT',
}

export interface CalendarEvent {
  id: string;
  date: string;
  type: CalendarEventType;
  issuer: string;
}

export interface CalendarDayType {
  date: string;
  isOffset?: boolean;
}
