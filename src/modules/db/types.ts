export interface AppUser {
  id: string;
  name: string;
}

export enum CalendarEventType {
  Alternating = 'ALTERNATING',
  Event = 'EVENT',
  Trip = 'TRIP',
  Offset = 'OFFSET',
}

export interface CalendarEvent {
  id: string;
  groupId: string;
  date: string;
  type: CalendarEventType;
  issuer: string;
  creationTime: number;
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
