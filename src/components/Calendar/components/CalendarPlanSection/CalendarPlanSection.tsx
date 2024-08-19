'use client';

import { CalendarDay } from '@/src/modules/db/types';
import styles from './CalendarPlanSection.module.scss';

interface CalendarPlanSectionProps {
  week: CalendarDay[];
}

export function CalendarPlanSection(props: CalendarPlanSectionProps) {
  return <div className={styles.calendarPlanSection}>Plan tygodnia</div>;
}
