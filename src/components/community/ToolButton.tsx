'use client';

import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

function ToolButton({
  children,
  active = false,
  disabled = false,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      className={[
        'px-2 py-1 min-w-8 rounded cursor-pointer inline-flex items-center justify-center',
        'hover:bg-secondary-200',
        active ? 'bg-secondary-400' : '',
        disabled ? 'opacity-40 cursor-not-allowed' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}
export default React.memo(ToolButton);
