import { NotificationPage } from '@/@types/notification';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

async function fetchNotifications(cursor?: string): Promise<NotificationPage> {
  const url = new URL(
    'api/notifications',
    typeof window === 'undefined' ? 'http://localhost' : window.location.origin
  );
  if (cursor) url.searchParams.set('cursor', cursor);
  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch Notifications');
  return res.json();
}

export function useNotifications() {
  const qc = useQueryClient();
  const listQuery = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam }) => fetchNotifications(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 15_000,
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('markRead Failed');
      return { id };
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['notifications'] });
      const prev = qc.getQueryData(['notifications']);
      qc.setQueryData<{
        pageParams: string | undefined;
        pages: NotificationPage[];
      }>(['notifications'], (data) => {
        if (!data) return data;
        return {
          ...data,
          pages: data.pages.map((p: NotificationPage) => ({
            ...p,
            items: p.items.map((it: NotificationPage['items'][number]) =>
              it.id === Number(id)
                ? {
                    ...it,
                    unread: false,
                  }
                : it
            ),
          })),
        };
      });
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['notifications'], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const res = await fetch('api/notifications/mark-all-read', { method: 'POST' });
      if (!res.ok) throw new Error('markAllRead failed');
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ['notifications'] });
      const prev = qc.getQueryData(['notifications']);
      qc.setQueryData<{
        pageParams: string | undefined;
        pages: NotificationPage[];
      }>(
        ['notifications'],
        (
          data:
            | {
                pageParams: string | undefined;
                pages: NotificationPage[];
              }
            | undefined
        ) => {
          if (!data) return data;
          return {
            ...data,
            pages: data.pages.map((p: NotificationPage) => ({
              ...p,
              items: p.items.map((it: NotificationPage['items'][number]) => ({
                ...it,
                unread: false,
              })),
            })),
          };
        }
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['notifications'], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
  return { listQuery, markRead, markAllRead };
}
