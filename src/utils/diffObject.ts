export function isSame<T>(a: T, b: T) {
  return a === b;
}

export function diffObject<T extends Record<string, unknown>>(prev: T, next: T): Partial<T> {
  const out: Partial<T> = {};
  for (const key in next) {
    const k = key as keyof T;
    if (!isSame(prev[k], next[k])) out[k] = next[k];
  }
  return out;
}