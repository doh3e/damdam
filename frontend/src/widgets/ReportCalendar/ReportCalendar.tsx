'use client';
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/shared/ui/calendar';
// import { getReportDates } from '@/entities/report/model/api';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

interface ReportCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

// 임시로 보고 날짜 하이라이트 없이 동작하도록 변경
export function ReportCalendar({ selectedDate, onSelectDate }: ReportCalendarProps) {
  return (
    <div className="flex justify-center mb-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date: Date | undefined) => {
          if (date) onSelectDate(date);
        }}
        className="rounded border p-5"
      />
    </div>
  );
}
