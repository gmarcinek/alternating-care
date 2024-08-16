import { DBSchema } from 'idb';
import {
  AppUser,
  CalendarDay,
  CalendarEvent,
  CalendarEventType,
} from './types';

export interface AlternatingCareDBSchema extends DBSchema {
  users: {
    key: string;
    value: AppUser;
    indexes: {
      'by-id': string;
      'by-name': string;
      'by-startDate': string;
      'by-countingRange': string;
    };
  };
  events: {
    value: CalendarEvent;
    key: string;
    indexes: {
      'by-id': string;
      'by-date': string;
      'by-type': CalendarEventType;
      'by-issuer': string;
    };
  };
  days: {
    value: CalendarDay;
    key: string;
    indexes: {
      'by-id': string;
      'by-date': string;
      'by-weekday': number;
    };
  };
}
