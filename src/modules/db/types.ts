export interface AppUser {
  id: string;
  name: string;
  startDate: string;
  countingRange: string;
}

export enum CalendarEventType {
  Alternating = 'ALTERNATING',
  Event = 'EVENT',
}

export interface CalendarEvent {
  id: string;
  date: string;
  type: CalendarEventType;
  issuer: string;
  name?: string;
  description?: string;
  style?: {
    background: string;
    color: string;
  };
}

export interface CalendarDayType {
  date: string;
  isOffset?: boolean;
}
