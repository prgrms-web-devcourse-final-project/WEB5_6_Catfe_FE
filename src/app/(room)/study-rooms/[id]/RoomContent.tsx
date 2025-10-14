'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import SignalingClient from '@/lib/signalingClient';
import * as UITypes from '@/@types/rooms';
import { getRoomSnapshot } from '@/api/apiRooms';
import MediaRoomClient from './MediaRoomClient';

/* ---------- helpers ---------- */
const getAccessToken = () => {
  try { return localStorage.getItem('accessToken') ?? ''; } catch { return ''; }
};

function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

const readUserSafely = () => {
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const u = JSON.parse(raw);
      const id = u?.userId ?? u?.userid ?? u?.UserId ?? u?.user_id ?? u?.id ?? u?.ID ?? null;
      const name = u?.username ?? u?.userName ?? u?.name ?? u?.nickname ?? u?.Nickname ?? null;
      if (id) {
        return { userId: id as string | number, username: name as string | null };
      }
    }
    const token = getAccessToken();
    if (token) {
      const payload = decodeJWT(token);
      if (payload) {
        const id = payload.userId ?? payload.userid ?? payload.sub ?? payload.id ?? null;
        const name = payload.username ?? payload.name ?? payload.sub ?? null;
        if (id) {
          return { userId: id as string | number, username: name as string | null };
        }
      }
    }
    console.warn('[user] 로그인 정보를 찾을 수 없습니다');
    return { userId: null, username: null };
  } catch (e) {
    console.error('[user] parse error:', e);
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
  const url = `${base}api/rooms/${roomId}/join`;

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

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const { userId: rawUserId, username } = useMemo(() => {
    if (!mounted) return { userId: null, username: null };
    return readUserSafely();
  }, [mounted]);

  const userId = useMemo(() => {
    if (!rawUserId) return null;
    const numId = typeof rawUserId === 'string' ? Number(rawUserId) : rawUserId;
    return Number.isFinite(numId) && numId > 0 ? String(numId) : null;
  }, [rawUserId]);

  const [wsReady, setWsReady] = useState(false);
  // [REMOVED] 'joining' state is removed to simplify the logic
  // const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const [roomSnap, setRoomSnap] = useState<UITypes.RoomSnapshotUI | null>(null);
  const [snapError, setSnapError] = useState<string | null>(null);

  const signalingRef = useRef<SignalingClient | null>(null);

  useEffect(() => {
    if (!roomId || !mounted || !userId) {
      if (mounted && !userId) console.warn('[ws] skip connect - userId 없음');
      return;
    }

    if (signalingRef.current) {
      console.log(`[ws] already connected or connecting`);
      return;
    }

    console.log(`[ws] connecting... (room: ${roomId}, user: ${userId})`);

    const client = new SignalingClient(
      roomId,
      userId,
      () => {
        console.log(`[ws] connected (room: ${roomId}, user: ${userId})`);
        setWsReady(true);
      }
    );
    signalingRef.current = client;

    return () => {
      console.log(`[ws] cleanup`);
      client.disconnect();
      signalingRef.current = null;
      setWsReady(false);
      setJoined(false);
    };
  }, [mounted, roomId, userId]);

  // [MODIFIED] Simplified join logic
  useEffect(() => {
    // Only run when WebSocket is ready and we haven't joined yet.
    if (!wsReady || joined) return;

    let canceled = false;
    const run = async () => {
      setJoinError(null);
      console.log(`[join] Attempting to join room via API...`);

      try {
        await apiJoinRoom(roomId);
        if (canceled) return;
        
        console.log(`[join] API call successful. Room joined.`);
        setJoined(true); // This will trigger the next useEffect to fetch snapshot
      } catch (e: unknown) {
        if (canceled) return;
        const err = e as JoinError;
        console.warn('[join] ERR', err.message);
        setJoinError(err.message || 'Failed to join the room.');
      }
    };
    
    run();

    return () => { canceled = true; };
  }, [wsReady, joined, roomId]); // Removed 'joining' from dependencies

  useEffect(() => {
    // Added more detailed logging for debugging
    console.log(`[snapshot effect check] joined: ${joined}, userId: ${userId}`);
    if (!joined || !userId) return;

    let alive = true;
    (async () => {
      try {
        console.log(`[snapshot] fetch...`);
        const snap: UITypes.RoomSnapshotUI = await getRoomSnapshot(roomId);
        const myUserIdNum = Number(userId);

        const membersWithMeFlag = snap.members.map(member => ({
          ...member,
          // isMe: member.id === `u-${myUserIdNum}`,
          isMe: member.id === myUserIdNum,
        }));

        const fixed: UITypes.RoomSnapshotUI = {
          ...snap,
          members: membersWithMeFlag,
        };
        
        console.log('[snapshot] Fetched and processed:', fixed);
        if (alive) {
          setRoomSnap(fixed);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'snapshot load failed';
        console.error('[snapshot] error', err);
        if (alive) {
          setSnapError(message);
        }
      }
    })();
    return () => { alive = false; };
  }, [joined, roomId, userId]);

  if (mounted && !userId) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          <p className="font-semibold">로그인 정보를 찾을 수 없습니다</p>
          <p className="mt-1 text-xs">다시 로그인하거나 페이지를 새로고침해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="text-sm text-neutral-500">
        방 #{roomId} · <span suppressHydrationWarning>{username ?? '사용자'}</span> ·
        <span suppressHydrationWarning> ID: {userId ?? '?'}</span> · {' '}
        <span className={wsReady ? 'text-green-600' : 'text-orange-600'}>
          {wsReady ? 'WS 연결 완료' : 'WS 연결 중...'}
        </span>
        {' · '}
        {joined
          ? <span className="text-green-600">JOIN 완료</span>
          // [REMOVED] 'joining' state display is removed
          : <span className="text-orange-600">JOIN 시도 중...</span>}
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

      {joined && roomSnap && userId && signalingRef.current ? (
        <MediaRoomClient
          room={roomSnap}
          meId={userId}
          signalingClient={signalingRef.current}
        />
      ) : (
        <div className="h-[360px] rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-center">
          <p className="text-neutral-400">
            {wsReady && joined ? '방 정보를 불러오는 중...' : '미디어 세션을 준비 중입니다...'}
          </p>
        </div>
      )}
    </div>
  );
}
