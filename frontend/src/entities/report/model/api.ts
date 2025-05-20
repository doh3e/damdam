import type { SessionReport, PeriodReport } from './types';

interface GetReportsParams {
  category: 'session' | 'period';
  start?: string;
  end?: string;
  keyword?: string;
}

export async function getReports({ category, start, end, keyword }: GetReportsParams) {
  const searchParams = new URLSearchParams({
    category,
    ...(start ? { start } : {}),
    ...(end ? { end } : {}),
    ...(keyword ? { keyword } : {}),
  });

  const res = await fetch(`/api/reports?${searchParams.toString()}`);
  if (!res.ok) throw new Error('레포트 불러오기 실패');

  return res.json() as Promise<SessionReport[] | PeriodReport[]>;
}
