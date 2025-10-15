'use client';

import { useEffect, useRef } from 'react';

const getAccessToken = () => {
  try { return localStorage.getItem('accessToken') ?? ''; } catch { return ''; }
};

type Options = {
  enabled?: boolean;
  userId?: number | string | null;
};

export function useAutoLeaveRoom(roomId: number | string, { enabled = true, userId = null }: Options = {}) {
  const leftRef = useRef(false);
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

  const leaveOnce = (reason: string) => {
    if (leftRef.current || !enabled) return;
    leftRef.current = true;

    const token = getAccessToken();

    try {
      fetch(`${base}/api/rooms/${roomId}/leave`, {
        method: 'POST',
        keepalive: true,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reason, userId }),
      }).catch(() => {});
    } catch {}
  };

  useEffect(() => {
    if (!enabled) return;

    const onBeforeUnload = () => leaveOnce('beforeunload');
    const onPageHide = () => leaveOnce('pagehide');
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') leaveOnce('visibilitychange');
    };

    const onUnmount = () => leaveOnce('unmount');

    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('pagehide', onPageHide);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      onUnmount();
    };
  }, [enabled, roomId]); // eslint-disable-line react-hooks/exhaustive-deps
}
