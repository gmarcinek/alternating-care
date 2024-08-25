'use client';

import { CalendarDayType } from '@modules/db/types';
import styles from './CalendarPlanSection.module.scss';

interface CalendarPlanSectionProps {
  week: CalendarDayType[];
}

export function CalendarPlanSection(props: CalendarPlanSectionProps) {
  return <div className={styles.calendarPlanSection}>Plan tygodnia</div>;
}
