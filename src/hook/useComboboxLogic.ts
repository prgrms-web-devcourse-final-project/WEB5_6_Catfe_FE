import { useMemo, useEffect, useRef, useState, useCallback } from 'react';

interface ComboboxConfig {
  options: string[];
  allowMultiSelect?: boolean;
  allowCustom?: boolean;
  maxOptions?: number;
}

interface ComboboxHookProps {
  value: string | string[];
  onChange: (v: string | string[]) => void;
  config: ComboboxConfig;
}

export function useComboboxLogic({ value, onChange, config }: ComboboxHookProps) {
  const { options, allowMultiSelect, allowCustom, maxOptions } = config;

  const vArr = useMemo(() => (Array.isArray(value) ? value : value ? [value] : []), [value]);

  const [keyword, setKeyword] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const ref = useRef<HTMLDivElement>(null);

  // 검색어에 따라 dropdown에 표시될 목록 필터링 & 정렬
  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    const base = k ? options.filter((o) => o.toLowerCase().includes(k)) : options;
    return base
      .slice()
      .sort((a, b) => {
        const aIndex = a.toLowerCase().indexOf(k);
        const bIndex = b.toLowerCase().indexOf(k);
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      })
      .slice(0, maxOptions);
  }, [keyword, options, maxOptions]);

  // 값 선택/토글
  const handleSelect = useCallback(
    (item: string) => {
      if (allowMultiSelect) {
        // 여러 개 선택 모드
        const hasItem = vArr.includes(item);
        const next = hasItem ? vArr.filter((x) => x !== item) : [...vArr, item];
        onChange(next);
        setKeyword('');
      } else {
        // 단일 선택 모드
        const isCurrentlySelected = vArr[0] === item;
        const next = isCurrentlySelected ? [] : [item];
        onChange(next.length > 0 ? next[0] : '');
        setKeyword(isCurrentlySelected ? '' : item);
      }
      setOpen(false);
      setActiveIndex(-1);
    },
    [vArr, onChange, allowMultiSelect]
  );

  // 키보드 핸들러
  const handleKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 엔터나 아래 화살표로 드롭박스 열기
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true);
      return;
    }

    // 화살표로 드롭박스 메뉴 이동
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      // 엔터 치면 선택
      e.preventDefault();
      if (activeIndex >= 0) {
        handleSelect(filtered[activeIndex]);
      } else if (keyword.trim() && allowCustom) {
        // 만약 이미 등록된 카테고리에 없는 걸 입력할 경우 추가
        handleSelect(keyword.trim());
      }
      // ESC 로 목록 닫개
    } else if (e.key === 'Escape') setOpen(false);
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // input에 표시될 실제 값 계산
  const inputValue = useMemo(() => {
    // multi select일 땐 입력한 값 표시
    if (allowMultiSelect) {
      return keyword;
    }

    // single select일 땐 dropdown 열려있으면 (검색중) 키워드, 아니면 선택값
    if (open || keyword) {
      return keyword;
    }
    return vArr[0] || '';
  }, [allowMultiSelect, keyword, open, vArr]);

  return {
    vArr,
    keyword,
    setKeyword,
    open,
    setOpen,
    activeIndex,
    setActiveIndex,
    ref,
    filtered,
    inputValue,
    handleSelect,
    handleKeydown,
  };
}
