import { useComboboxLogic } from '@/hook/community/useComboboxLogic';
import tw from '@/utils/tw';
import Image from 'next/image';
import { useMemo } from 'react';

interface SubjectProps {
  label?: string;
  placeholder?: string;
  value: string | string[];
  onChange: (v: string | string[]) => void;
  options?: string[];
  allowMultiSelect?: boolean;
  allowCustom?: boolean;
  disabled?: boolean;
  maxOptions?: number;
  required?: boolean;
  className?: string;
}

function SubjectCombobox({
  label = '과목/주제',
  placeholder = '입력해서 검색...',
  value,
  onChange,
  options = [],
  allowMultiSelect = false,
  allowCustom = true,
  disabled = false,
  maxOptions = 10,
  required = false,
  className = '',
}: SubjectProps) {
  const config = useMemo(
    () => ({
      options,
      allowMultiSelect,
      allowCustom,
      maxOptions,
    }),
    [options, allowMultiSelect, allowCustom, maxOptions]
  );

  const {
    vArr,
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
  } = useComboboxLogic({ value, onChange, config });

  const handleOnBlur = () => {
    setOpen(false);
    // 커스텀 입력 허용 시, 입력값(inputValue)이 있고 기존 값과 다르면 선택 처리
    if (allowCustom && inputValue && inputValue !== value) {
      handleSelect(inputValue);
      // 입력값이 없고 (빈 상태), 멀티 셀렉트 모드가 아닐 때
    } else if (!inputValue && !allowMultiSelect) {
      if (value) {
        // value가 있지만 inputValue가 없다면, 단일 선택 모드에서 값을 지운 것으로 간주하고 초기화
        handleSelect('');
      }
    }
  };

  return (
    <div ref={ref} className={['relative', className].join(' ')}>
      <label htmlFor="subject-select" className="flex flex-col gap-2">
        <span className="text-xs tex-gray-500">{label}</span>
        {allowMultiSelect && vArr.length > 0 && (
          <div className="mb-1 flex flex-wrap gap-2">
            {vArr.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleSelect(chip)}
                className="rounded-full bg-secondary-200 px-3 py-1 text-xs hover:bg-secondary-300 cursor-pointer"
                title="클릭하면 제거"
              >
                {chip} x
              </button>
            ))}
          </div>
        )}

        <div
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls="subject-listbox"
          className="relative"
        >
          <input
            id="subject-select"
            disabled={disabled}
            value={inputValue}
            required={required}
            onChange={(e) => {
              setKeyword(e.target.value);
              setOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeydown}
            onBlur={handleOnBlur}
            placeholder={placeholder}
            autoComplete="off"
            className="w-full rounded-md border border-gray-300 bg-background-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary-400"
          />
          <button
            type="button"
            aria-label={open ? '목록 닫기' : '목록 열기'}
            onClick={() => setOpen((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
          >
            <Image
              src="/icon/angle-small-down.svg"
              alt=""
              width={16}
              height={16}
              unoptimized
              priority={false}
            />
          </button>
        </div>
      </label>
      {/* dropdown list */}
      {open && filtered.length > 0 && (
        <ul
          id="subject-listbox"
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border bg-background-white shadow"
        >
          {filtered.map((opt, idx) => {
            const active = idx === activeIndex;
            const selected = vArr.includes(opt);
            return (
              <li
                role="option"
                aria-selected={selected}
                key={opt}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(opt);
                }}
                className={tw(
                  'cursor-pointer px-3 py-2 text-sm',
                  active ? 'bg-slate-100' : '',
                  selected ? 'font-semibold' : ''
                )}
              >
                {opt}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
export default SubjectCombobox;
