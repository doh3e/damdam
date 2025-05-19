'use client';
import React from 'react';
import { Report } from '@/entities/report/model/types';
import Link from 'next/link';

interface ReportListProps {
  reports: Report[];
  isLoading: boolean;
}

export function ReportList({ reports, isLoading }: ReportListProps) {
  if (isLoading) {
    return <div className="text-center py-8 text-gray-400">불러오는 중...</div>;
  }

  if (reports.length === 0) {
    return <div className="text-sm text-gray-400">상담 내역이 없습니다.</div>;
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Link href={`/reports/${report.id}`} key={report.id}>
          <div className="bg-orange-50 border-l-4 border-orange-400 rounded p-3 cursor-pointer hover:shadow-md transition">
            <div className="flex gap-2 mb-1">
              {report.keywords.map((keyword) => (
                <span key={keyword} className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
                  {keyword}
                </span>
              ))}
            </div>
            <div className="text-sm text-gray-800">{report.summary}</div>
            <div className="text-xs text-gray-400 mt-1">{report.time}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
