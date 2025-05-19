'use client';
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/shared/ui/calendar';
import { getReportDates } from '@/entities/report/model/api';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

interface ReportCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function ReportCalendar({ selectedDate, onSelectDate }: ReportCalendarProps) {
  const month = format(selectedDate, 'yyyy-MM');

  const { data: reportDates = [] } = useQuery({
    queryKey: ['reportDates', month],
    queryFn: () => getReportDates(month),
  });

  return (
    <div className="flex justify-center mb-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date: Date | undefined) => {
          if (date) onSelectDate(date);
        }}
        modifiers={{
          hasReport: reportDates.map((d) => new Date(d)),
        }}
        modifiersStyles={{
          hasReport: {
            backgroundColor: '#FAE9DE',
            color: '#DC5F53',
            fontWeight: 'bold',
            borderRadius: '50%',
          },
        }}
        className="rounded border p-5"
      />
    </div>
  );
}
