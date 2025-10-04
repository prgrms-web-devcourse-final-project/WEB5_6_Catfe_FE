'use client';

import { formatToYMD } from '@/lib/datetime';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

function parseYMD(s?: string | null) {
  if (!s) return new Date();
  const date = new Date(s);
  return isNaN(date.getTime()) ? new Date() : date;
}

export function useSelectedDate() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParam = useSearchParams();

  const date = useMemo(() => parseYMD(searchParam.get('date')), [searchParam]);
  const setDate = (next: Date | string) => {
    const ymd = typeof next === 'string' ? next : formatToYMD(next);
    const params = new URLSearchParams(searchParam.toString());
    params.set('date', ymd);
    router.replace(`${pathname}?${params.toString()}`, { scroll: true });
  };

  return { date, setDate, ymd: formatToYMD(date) };
}
