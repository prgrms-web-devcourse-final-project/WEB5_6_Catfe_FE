import api from "@/utils/api";
import type { AllRoomsList, CreateRoomDto, CreateRoomRes, MyRoomsList } from "@/@types/rooms";
import type { RoomSnapshotUI, RoomInfo, UsersListItem } from "@/@types/rooms";

export type PageResponse<T> = {
  content: T[];
  totalPages: number;
  number: number;
  totalElements?: number;
  size?: number;
};

type ApiEnvelope<T> = {
  code: string;
  message: string;
  data: T;
  success: boolean;
};

type RoomsPayload<T> = {
  rooms: T[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
};

function safeErrorMessage(err: unknown, fallback: string) {
  const e = err as { response?: { data?: { message?: string } }; message?: string } | undefined;
  return e?.response?.data?.message ?? e?.message ?? fallback;
}

async function fetchRooms<T extends MyRoomsList | AllRoomsList>(
  url: string,
  page: number,
  size: number,
  fallbackMsg: string
): Promise<PageResponse<T>> {
  try {
    const res = await api.get<ApiEnvelope<RoomsPayload<T>>>(url, { params: { page, size } });
    const d = res.data.data;
    return {
      content: d.rooms,
      totalPages: d.totalPages,
      number: d.page,
      size: d.size,
      totalElements: d.totalElements,
    };
  } catch (err: unknown) {
    throw new Error(safeErrorMessage(err, fallbackMsg));
  }
}

export async function getMyRooms(page: number, size: number): Promise<PageResponse<MyRoomsList>> {
  try {
    const res = await api.get<ApiEnvelope<MyRoomsList[] | PageResponse<MyRoomsList>>>(
      "/api/rooms/my",
      { params: { page, size } }
    );
    const payload = res.data.data;

    if (Array.isArray(payload)) {
      const totalElements = payload.length;
      const totalPages = Math.max(1, Math.ceil(totalElements / size));
      const start = page * size;
      const end = start + size;
      return {
        content: payload.slice(start, end),
        totalPages,
        number: page,
        size,
        totalElements,
      };
    }

    return {
      content: payload.content ?? [],
      totalPages: payload.totalPages ?? 1,
      number: payload.number ?? page,
      size: payload.size ?? size,
      totalElements: payload.totalElements ?? payload.content?.length ?? 0,
    };
  } catch (err: unknown) {
    throw new Error(safeErrorMessage(err, "내가 참여 중인 캣페 목록을 불러오지 못했어요."));
  }
}

export const getMyHostingRooms = (page: number, size: number) =>
  fetchRooms<MyRoomsList>("/api/rooms/my/hosting", page, size, "내가 만든 캣페 목록을 불러오지 못했어요.");

export const getAllRooms = (page: number, size: number) =>
  fetchRooms<AllRoomsList>("/api/rooms/all", page, size, "전체 스터디룸 목록을 불러오지 못했어요.");

export const getPopularRooms = (page: number, size: number) =>
  fetchRooms<AllRoomsList>("/api/rooms/popular", page, size, "인기 스터디룸 목록을 불러오지 못했어요.");

export const getEnterRooms = (page: number, size: number) =>
  fetchRooms<AllRoomsList>("/api/rooms", page, size, "입장 가능한 공개 스터디룸 목록을 불러오지 못했어요.");

export const getPublicRooms = (page: number, size: number) =>
  fetchRooms<AllRoomsList>("/api/rooms/public", page, size, "공개 스터디룸 목록을 불러오지 못했어요.");

export async function createRoom(dto: CreateRoomDto): Promise<CreateRoomRes> {
  const res = await api.post<ApiEnvelope<CreateRoomRes>>("/api/rooms", dto);
  return res.data.data;
}

export type RoomMemberDTO = {
  userId: number;
  nickname: string;
  role: "HOST" | "SUB_HOST" | "MEMBER" | "VISITOR";
  joinedAt: string | null;
  promotedAt: string | null;
  profileImageUrl?: string | null;
};

export type RoomDetailDTO = {
  roomId: number;
  title: string;
  description: string;
  maxParticipants: number;
  currentParticipants: number;
  status: "WAITING" | "ACTIVE" | "PAUSED";
  allowCamera: boolean;
  allowAudio: boolean;
  allowScreenShare: boolean;
  createdBy: string;
  createdAt: string;
  private: boolean;
  members: RoomMemberDTO[];
};

function toUIFromDetail(d: RoomDetailDTO): RoomSnapshotUI {
  const mediaEnabled = !!(d.allowCamera || d.allowAudio || d.allowScreenShare);

  const info: RoomInfo = {
    id: d.roomId,
    title: d.title,
    description: d.description ?? "",
    maxParticipants: d.maxParticipants,
    isPrivate: !!d.private,
    coverPreviewUrl: null,
    currentParticipants: d.currentParticipants ?? 0,
    status: d.status,
    allowCamera: !!d.allowCamera,
    allowAudio: !!d.allowAudio,
    allowScreenShare: !!d.allowScreenShare,
    mediaEnabled,
  };

  const members: UsersListItem[] = (d.members ?? []).map((m) => ({
    id: m.userId,
    name: m.nickname ?? `u-${m.userId}`,
    role: m.role,
    email: "",
    avatarUrl: m.profileImageUrl ?? null,
    isMe: false,
    media: { camOn: false, screenOn: false },
    joinedAt: m.joinedAt ?? null,
  }));

  return { info, members };
}

export async function getRoomSnapshot(roomId: string): Promise<RoomSnapshotUI> {
  const { data } = await api.get<ApiEnvelope<RoomDetailDTO>>(`/api/rooms/${roomId}`);
  if (!data.success) throw new Error(data.message || "room detail 실패");
  return toUIFromDetail(data.data);
}

export async function leaveRoom(roomId: number): Promise<void> {
  try {
    const res = await api.post<ApiEnvelope<null>>(`/api/rooms/${roomId}/leave`);
    if (!res.data?.success) {
      throw new Error(res.data?.message || "방 퇴장에 실패했어요.");
    }
  } catch (err: unknown) {
    throw new Error(safeErrorMessage(err, "방 퇴장에 실패했어요."));
  }
}