'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import SignalingClient, { RoomEvent } from '@/lib/signalingClient';
import * as UITypes from '@/@types/rooms';
import { getRoomSnapshot } from '@/api/apiRooms';
import MediaRoomClient from './MediaRoomClient';
import NonMediaRoomClient from './NonMediaRoomClient';

const getAccessToken = () => {
  try { return localStorage.getItem('accessToken') ?? ''; } catch { return ''; }
};
function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const base64 = (token.split('.')[1] ?? '').replace(/-/g, '+').replace(/_/g, '/');
    if (!base64) return null;
    const json = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(json);
  } catch { return null; }
}
const readUserSafely = () => {
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const u = JSON.parse(raw);
      const id = u?.userId ?? u?.userid ?? u?.UserId ?? u?.user_id ?? u?.id ?? u?.ID ?? null;
      const name = u?.username ?? u?.userName ?? u?.name ?? u?.nickname ?? u?.Nickname ?? null;
      if (id) return { userId: id as string | number, username: name as string | null };
    }
    const token = getAccessToken();
    if (token) {
      const p = decodeJWT(token);
      const id = p?.userId ?? p?.userid ?? p?.sub ?? p?.id ?? null;
      const name = (p?.username ?? p?.name ?? p?.sub) as string | null;
      if (id) return { userId: id as string | number, username: name };
    }
    return { userId: null, username: null };
  } catch { return { userId: null, username: null }; }
};

type JsonLike = Record<string, unknown>;
const isRecord = (v: unknown): v is JsonLike => !!v && typeof v === 'object' && !Array.isArray(v);
type JoinError = Error & { code?: string; payload?: unknown };
function buildJoinError(status: number, data: unknown): JoinError {
  const msg = (isRecord(data) && typeof data.message === 'string' && data.message) || `join failed (${status})`;
  const err: JoinError = new Error(msg);
  if (isRecord(data) && typeof data.code === 'string') err.code = data.code;
  err.payload = data;
  return err;
}
async function apiJoinRoom(roomId: string | number) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
  const res = await fetch(`${base}/api/rooms/${roomId}/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
    },
    credentials: 'include',
  });
  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) throw buildJoinError(res.status, data);
  return data;
}

export default function RoomContent() {
  const params = useParams<{ id: string }>();
  const roomId = useMemo(() => String(params.id), [params.id]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const { userId: rawUserId } = useMemo(
    () => (mounted ? readUserSafely() : { userId: null, username: null }),
    [mounted]
  );
  const userId = useMemo(() => {
    if (!rawUserId) return null;
    const n = typeof rawUserId === 'string' ? Number(rawUserId) : rawUserId;
    return Number.isFinite(n) && n > 0 ? String(n) : null;
  }, [rawUserId]);

  const [wsReady, setWsReady] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [roomSnap, setRoomSnap] = useState<UITypes.RoomSnapshotUI | null>(null);
  const [snapError, setSnapError] = useState<string | null>(null);
  const signalingRef = useRef<SignalingClient | null>(null);

  useEffect(() => {
    if (!roomId || !mounted || !userId) return;
    if (signalingRef.current) return;

    const client = new SignalingClient(roomId, userId, () => setWsReady(true));
    const handleRoomEvent = (e: RoomEvent) => {
      setRoomSnap(prev => {
        if (!prev) return prev;
        if (e.type === 'USER_JOINED') {
          const p = e.payload;
          if (prev.members.some(m => m.id === p.userId)) return prev;
          const newMember: UITypes.UsersListItem = {
            id: p.userId,
            name: p.nickname,
            role: 'MEMBER',
            email: '',
            avatarUrl: p.profileImageUrl,
            isMe: Number(userId) === p.userId,
            media: { camOn: true, screenOn: false },
          };
          return { ...prev, members: [...prev.members, newMember] };
        }
        if (e.type === 'USER_LEFT') {
          return { ...prev, members: prev.members.filter(m => m.id !== e.payload.userId) };
        }
        return prev;
      });
    };
    client.addRoomEventListener(handleRoomEvent);
    signalingRef.current = client;

    return () => {
      client.removeRoomEventListener(handleRoomEvent);
      client.disconnect();
      signalingRef.current = null;
      setWsReady(false);
      setJoined(false);
    };
  }, [mounted, roomId, userId]);

  useEffect(() => {
    if (!wsReady || joined) return;
    let canceled = false;
    (async () => {
      try {
        setJoinError(null);
        await apiJoinRoom(roomId);
        if (!canceled) setJoined(true);
      } catch (e) {
        if (!canceled) setJoinError((e as Error).message || 'Failed to join the room.');
      }
    })();
    return () => { canceled = true; };
  }, [wsReady, joined, roomId]);

  useEffect(() => {
    if (!joined || !userId) return;
    let alive = true;
    (async () => {
      try {
        const snap = await getRoomSnapshot(roomId);
        const myId = Number(userId);
        const fixed: UITypes.RoomSnapshotUI = {
          ...snap,
          members: snap.members.map(m => ({ ...m, isMe: m.id === myId })),
        };
        if (alive) setRoomSnap(fixed);
      } catch (err) {
        if (alive) setSnapError(err instanceof Error ? err.message : 'snapshot load failed');
      }
    })();
    return () => { alive = false; };
  }, [joined, roomId, userId]);

  if (mounted && !userId) {
    return (
      <div className="flex items-center justify-center min-h-[360px]">
        <p className="text-sm text-neutral-500">로그인이 필요합니다.</p>
      </div>
    );
  }

  if (joined && roomSnap && userId) {
    const mediaEnabled = !!roomSnap.info.mediaEnabled;
    if (mediaEnabled && signalingRef.current) {
      return (
        <MediaRoomClient
          room={roomSnap}
          meId={userId}
          signalingClient={signalingRef.current}
        />
      );
    }
    return <NonMediaRoomClient room={roomSnap} meId={userId} />;
  }

  return (
    <div className="flex items-center justify-center min-h-[360px]">
      {joinError || snapError ? (
        <p className="text-sm text-red-600">{joinError ?? snapError}</p>
      ) : (
        <p className="text-neutral-400">미디어 세션 준비 중…</p>
      )}
    </div>
  );
}
