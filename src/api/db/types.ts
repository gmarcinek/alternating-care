export interface AppUser {
  id: string;
  name: string;
}

export enum CalendarEventType {
  Offset = 'OFFSET',
  Alternating = 'ALTERNATING',
  Event = 'EVENT',
  Trip = 'TRIP',
  Birthday = 'BIRTHDAY',
  Medical = 'MEDICAL',
  School = 'SCHOOL',
  Camp = 'CAMP',
}

export interface CalendarEvent {
  id: string;
  groupId: string;
  date: string;
  type: CalendarEventType;
  issuer: string;
  creationTime: number;
  name?: string;
  startTime?: number;
  endTime?: number;
  duration?: number;
  description?: string;
  style?: {
    background: string;
    color: string;
  };
}
