import dayjs from '@/lib/dayjs';

/**
 * 날짜 ISOstring을 받아서 상대 시간 또는 절대 시간으로 변환하는 함수 (Day.js로 변환)
 * @param isoDate 변환 대상 날짜(ISOString)
 * @returns 현재 시점으로부터 1일 내: 분 / 시간 단위 (3분 전, 1시간 전 등)
 * @returns 현재 시점으로부터 30일 내: 일 단위 (1일 전, 3일 전 등)
 * @returns 그 이상 : yyyy년 mm월 dd일 형태
 */
export function formatRelativeDate(isoDate: string): string {
  const d = dayjs.utc(isoDate).local();
  if (!d.isValid()) return '';

  const now = dayjs();
  const diffDays = now.diff(d, 'day');
  if (diffDays < 1) {
    const diffMinutes = now.diff(d, 'minute');
    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    const diffHours = now.diff(d, 'hour');
    return `${diffHours}시간 전`;
  }
  if (diffDays < 30) return `${diffDays}일 전`;
  return d.format('YYYY년 MM월 DD일');
}
