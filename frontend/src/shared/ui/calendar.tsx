'use client';

import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { ko } from 'date-fns/locale';

export function Calendar(props: any) {
  return <DayPicker locale={ko} showOutsideDays {...props} />;
}
