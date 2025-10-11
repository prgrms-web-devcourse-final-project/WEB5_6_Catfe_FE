'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import SignalingClient from '@/lib/signalingClient';
import type { WebRTCSignal } from '@/lib/types';
import type { RoomSnapshotUI } from '@/@types/room';
import { getRoomSnapshot } from '@/api/apiRooms';
import MediaRoomClient from './MediaRoomClient';

/* ---------- helpers ---------- */
const getAccessToken = () => {
  try { return localStorage.getItem('accessToken') ?? ''; } catch { return ''; }
};

const readUserSafely = () => {
  try {
    const raw = localStorage.getItem('user');
    const u = raw ? JSON.parse(raw) : {};
    const id =
      u?.userid ?? u?.userId ?? u?.UserId ?? u?.id ?? u?.user_id ?? u?.ID ?? null;
    const name =
      u?.username ?? u?.userName ?? u?.name ?? u?.nickname ?? u?.Nickname ?? null;
    return { userId: id as string | number | null, username: name as string | null };
  } catch {
    return { userId: null, username: null };
  }
};

type JsonLike = Record<string, unknown>;
const isRecord = (v: unknown): v is JsonLike =>
  !!v && typeof v === 'object' && !Array.isArray(v);

type JoinError = Error & { code?: string; payload?: unknown };

function buildJoinError(status: number, data: unknown): JoinError {
  const message =
    (isRecord(data) && typeof data.message === 'string' && data.message) ||
    `join failed (${status})`;
  const err: JoinError = new Error(message);
  if (isRecord(data) && typeof data.code === 'string') err.code = data.code;
  err.payload = data;
  return err;
}

async function apiJoinRoom(roomId: string | number) {
  const token = getAccessToken();
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
  const url = `${base}/api/rooms/${roomId}/join`;

  console.log('[join] POST', url);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });

  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) throw buildJoinError(res.status, data);

  console.log('[join] OK', data);
  return data;
}
/* ------------------------------------------ */

export default function RoomContent() {
  const params = useParams<{ id: string }>();
  const roomId = useMemo(() => String(params.id), [params.id]);

  // 클라이언트 마운트 플래그 (SSR-클라이언트 값 불일치 방지)
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // 로컬 사용자 정보
  const userFromLS = mounted ? readUserSafely() : { userId: null, username: null };
  const userId = mounted && userFromLS.userId != null ? String(userFromLS.userId) : '0';
  const username = mounted ? (userFromLS.username ?? '사용자') : '사용자';

  // WS / JOIN 상태
  const [wsReady, setWsReady] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // RoomSnapshot (JOIN 이후 로드 → MediaRoomClient에 전달)
  const [roomSnap, setRoomSnap] = useState<RoomSnapshotUI | null>(null);
  const [snapError, setSnapError] = useState<string | null>(null);

  // STOMP signaling client ref
  const signalingRef = useRef<SignalingClient | null>(null);

  // userId를 의존성에 넣지 않기 위한 안정 ref (로그/표시만 사용)
  const userIdRef = useRef(userId);
  useEffect(() => { userIdRef.current = userId; }, [userId]);

  /* 1) WS 먼저 연결 */
  useEffect(() => {
    if (!roomId || !mounted) return;

    console.log(`[room ${roomId}] [me ${userIdRef.current}] [ws] connecting...`);
    if (signalingRef.current?.ready) {
      setWsReady(true);
      return;
    }

    const client = new SignalingClient(
      roomId,
      userIdRef.current,
      handleSignal,
      () => {
        console.log(`[room ${roomId}] [me ${userIdRef.current}] [ws] connected`);
        setWsReady(true);
      }
    );
    signalingRef.current = client;

    return () => {
      client.disconnect();
      signalingRef.current = null;

      setWsReady(false);
      setJoined(false);
      setJoining(false);
      setJoinError(null);
      setRoomSnap(null);
      setSnapError(null);
    };
  }, [mounted, roomId]); // userId는 ref로 대체

  /* 2) WS ready 후 JOIN — StrictMode 이중 실행/재진입 가드 */
  const joiningOnceRef = useRef(false);

  useEffect(() => {
    if (!mounted || !wsReady || joined) return;
    if (joiningOnceRef.current) return; // 재진입 방지
    joiningOnceRef.current = true;

    let canceled = false;

    const run = async () => {
      console.log(`[room ${roomId}] [me ${userIdRef.current}] [join] start`);
      setJoining(true);
      setJoinError(null);

      const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

      try {
        for (let i = 1; i <= 5 && !canceled; i++) {
          try {
            console.log(`[room ${roomId}] [me ${userIdRef.current}] [join] attempt ${i}`);
            await apiJoinRoom(roomId);
            if (canceled) return;

            setJoined(true);
            setJoining(false);
            console.log('[join] state => joined:true, joining:false');
            return;
          } catch (e: unknown) {
            const err = e as JoinError;
            const code =
              err.code ??
              (isRecord(err.payload) && typeof err.payload.code === 'string'
                ? err.payload.code
                : undefined);

            console.warn('[join] ERR', code, err.message);
            if (code === 'WS_003' && i < 5) {
              await sleep(i < 3 ? 300 : 600);
              continue;
            }
            setJoinError(err.message || 'join failed');
            setJoining(false);
            return;
          }
        }

        if (!canceled && !joined) {
          setJoinError('WebSocket 세션 초기화 지연');
          setJoining(false);
        }
      } finally {
        joiningOnceRef.current = false;
      }
    };

    run();

    return () => {
      canceled = true;
      setJoining(false);
      joiningOnceRef.current = false;
    };
  }, [mounted, wsReady, joined, roomId]); // userId는 ref로 대체

  /* 3) JOIN 후 snapshot 로드 → isMe 보정 → MediaRoomClient에 전달 */
  useEffect(() => {
    if (!joined) return;

    let alive = true;
    (async () => {
      try {
        console.log(`[room ${roomId}] fetch snapshot...`);
        const snap = await getRoomSnapshot(roomId); // RoomSnapshotUI

        // isMe 보정
        const myUid =
          userFromLS.userId != null ? `u-${userFromLS.userId}` : null;
        const members = snap.members.map(m => ({ ...m, isMe: m.id === myUid }));
        const fixed: RoomSnapshotUI = { ...snap, members };

        if (alive) setRoomSnap(fixed);
        console.log('[snapshot]', fixed);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'snapshot load failed';
        console.error('[snapshot] error', err);
        if (alive) setSnapError(message);
      }
    })();

    return () => { alive = false; };
  }, [joined, roomId, userFromLS.userId]);

  /* 4) 수신 시그널 로깅 */
  function handleSignal(s: WebRTCSignal) {
    console.log('[signal <=]', s.type, 'from', s.fromUserId);
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="text-sm text-neutral-500">
        방 #{roomId} · <span suppressHydrationWarning>{username}</span> ·{' '}
        <span className={wsReady ? 'text-green-600' : 'text-orange-600'}>
          {wsReady ? 'WS 연결 완료' : 'WS 연결 중...'}
        </span>
        {' · '}
        {joined
          ? <span className="text-green-600">JOIN 완료</span>
          : joining
          ? <span className="text-orange-600">JOIN 시도 중...</span>
          : <span className="text-red-600">JOIN 대기</span>}
      </div>

      {joinError && (
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {joinError}
        </div>
      )}
      {snapError && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          {snapError}
        </div>
      )}

      {/* JOIN 완료 & snapshot 있으면 WebRTC 시작 */}
      {joined && roomSnap ? (
        <MediaRoomClient room={roomSnap} />
      ) : (
        <div className="h-[360px] rounded-xl border border-neutral-200 bg-neutral-50" />
      )}
    </div>
  );
}
