'use client';

import { HeadingLevel } from '@/hook/useToolbarSnapshot';

interface HeadingSelectProps {
  value: HeadingLevel;
  onChange: (lv: HeadingLevel) => void;
  allowedLevels?: ReadonlyArray<Exclude<HeadingLevel, 0>>;
  labelOffset?: number;
  className?: string;
}

function HeadingSelect({
  value,
  onChange,
  allowedLevels = [2, 3, 4],
  labelOffset = 0,
  className = '',
}: HeadingSelectProps) {
  const safeValue: HeadingLevel =
    value !== 0 && allowedLevels.includes(value as 2 | 3 | 4) ? value : 0;

  return (
    <select
      aria-label="제목 태그 선택"
      className={['h-8 rounded border-gray-300 bg-white px-2 text-xs border', className].join(' ')}
      value={String(safeValue)}
      onChange={(e) => onChange(Number(e.target.value) as HeadingLevel)}
    >
      {allowedLevels.map((lv) => (
        <option key={lv} value={String(lv)}>
          H{lv - labelOffset}
          {/* h1 태그 사용 안하고 싶은데.. 그럼 h2부터 시작해야하는데.. select가 2부터 시작하는게 어색해서 이름만 하나씩 뺌.. */}
        </option>
      ))}
      <option key={0} value="0">
        본문
      </option>
    </select>
  );
}
export default HeadingSelect;
