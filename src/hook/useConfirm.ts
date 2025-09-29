import { ConfirmOptions } from '@/@types/type';
import { useConfirmStore } from '@/store/useConfirmStore';
import { useMemo } from 'react';

export function useConfirm() {
  return useMemo(() => {
    return (opts: ConfirmOptions) => useConfirmStore.getState().open(opts);
  }, []);
}
