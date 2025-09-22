/**
 * 날짜 ISOstring을 받아서 상대 시간 또는 절대 시간으로 변환하는 함수
 * @param isoDate 변환 대상 날짜(ISOString)
 * @returns 현재 시점으로부터 1일 내: 분 / 시간 단위 (3분 전, 1시간 전 등)
 * @returns 현재 시점으로부터 일주일 내: 일 단위 (1일 전, 3일 전 등)
 * @returns 그 이상 : yyyy년 mm월 dd일 형태
 */
export function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (isNaN(date.getTime())) return '';

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // 1일 이내 -> 분 / 시간 단위
  if (diffDays < 1) {
    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    return `${diffHours}시간 전`;
  }

  // 7일 이내 -> 일 단위
  if (diffDays < 7) {
    return `${diffDays}일 전`;
  }

  // 그 외 -> 절대 시간
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}년 ${month}월 ${day}일`;
}
