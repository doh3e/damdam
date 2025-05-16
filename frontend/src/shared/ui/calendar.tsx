// src/shared/ui/calendar.tsx
'use client';

import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export function Calendar(props: any) {
  return <DayPicker {...props} />;
}
