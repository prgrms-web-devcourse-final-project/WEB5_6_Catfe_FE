'use client';

import tw from '@/utils/tw';

interface ToggleButtonProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  className?: string;
}

function ToggleButton({ checked, onChange, disabled = false, className = '' }: ToggleButtonProps) {
  const handleKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    } else if (e.key === 'ArrowLeft') {
      onChange(false);
    } else if (e.key === 'ArrowRight') {
      onChange(true);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={checked ? '끄기' : '켜기'}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      onKeyDown={handleKey}
      className={tw(
        [
          'relative inline-flex items-center rounded-full transition-colors duration-150 h-6 w-11',
          checked ? 'bg-primary-500' : 'bg-gray-400',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        ].join(' '),
        className
      )}
    >
      <span
        aria-hidden
        className={tw(
          'absolute top-1 bottom-1 aspect-square rounded-full bg-background-white shadow transition-all duration-150',
          checked ? 'right-1' : 'left-1'
        )}
      ></span>
    </button>
  );
}
export default ToggleButton;
