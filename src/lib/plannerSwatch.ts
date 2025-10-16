import { ColorEnum } from '@/@types/planner';

export const COLOR_ORDER: ColorEnum[] = [
  'RED',
  'ORANGE',
  'YELLOW',
  'GREEN',
  'BLUE',
  'PURPLE',
  'PINK',
];

// 색상 enum → 스와치 클래스 매핑
export const PLAN_SWATCH: Record<ColorEnum, { fill: string; border: string; text: string }> = {
  RED: { fill: 'bg-rose-200', border: 'border-rose-500/40', text: 'text-text-primary' },
  ORANGE: { fill: 'bg-orange-200', border: 'border-orange-500/40', text: 'text-text-primary' },
  YELLOW: { fill: 'bg-amber-200', border: 'border-amber-500/40', text: 'text-text-primary' },
  GREEN: { fill: 'bg-emerald-200', border: 'border-emerald-500/40', text: 'text-text-primary' },
  BLUE: { fill: 'bg-sky-200', border: 'border-sky-500/40', text: 'text-text-primary' },
  PURPLE: { fill: 'bg-violet-200', border: 'border-violet-500/40', text: 'text-text-primary' },
  PINK: { fill: 'bg-pink-200', border: 'border-pink-500/40', text: 'text-text-primary' },
};

export const RECORD_SWATCH: Record<ColorEnum, { fill: string; border: string; text: string }> = {
  RED: { fill: 'bg-rose-500/20', border: 'border-rose-500/50', text: 'text-rose-900' },
  ORANGE: { fill: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-900' },
  YELLOW: { fill: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-900' },
  GREEN: { fill: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-900' },
  BLUE: { fill: 'bg-sky-500/20', border: 'border-sky-500/50', text: 'text-sky-900' },
  PURPLE: { fill: 'bg-violet-500/20', border: 'border-violet-500/50', text: 'text-violet-900' },
  PINK: { fill: 'bg-pink-500/20', border: 'border-pink-500/50', text: 'text-pink-900' },
};
