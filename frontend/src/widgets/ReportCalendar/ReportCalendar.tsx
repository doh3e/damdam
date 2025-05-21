'use client';
import React from 'react';
import { Calendar } from '@/shared/ui/calendar';

interface ReportCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  type?: 'single' | 'range'; // 'single': 상담별 / 'range': 기간별
}

export function ReportCalendar({ selectedDate, onSelectDate, type = 'single' }: ReportCalendarProps) {
  const calendarClass =
    type === 'single'
      ? '' // 기본 스타일
      : 'calendar-small'; // 기간별 스타일

  return (
    <div className="flex justify-center mb-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date: Date | undefined) => {
          if (date) onSelectDate(date);
        }}
        className={calendarClass}
      />
    </div>
  );
}
