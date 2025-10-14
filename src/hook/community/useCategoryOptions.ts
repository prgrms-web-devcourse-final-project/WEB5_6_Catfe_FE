import { CategoryItem } from '@/@types/community';
import { useMemo } from 'react';

export function useCategoryOptions(categoryData: CategoryItem[]) {
  return useMemo(() => {
    const subject = categoryData.filter((c) => c.type === 'SUBJECT').map((c) => c.name);
    const demographic = categoryData.filter((c) => c.type === 'DEMOGRAPHIC').map((c) => c.name);
    const groupSize = categoryData.filter((c) => c.type === 'GROUP_SIZE').map((c) => c.name);

    const nameToId = categoryData.reduce(
      (acc, cat) => {
        acc[cat.name] = cat.id;
        return acc;
      },
      {} as Record<string, number>
    );

    return { subject, demographic, groupSize, nameToId };
  }, [categoryData]);
}
