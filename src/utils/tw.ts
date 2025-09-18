import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function tw(...args: unknown[]) {
  return twMerge(clsx(args));
}
