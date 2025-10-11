import api from "@/utils/api";
import type { CreateRoomDto, CreateRoomRes, MyRoomsList } from "@/@types/rooms";
import type { RoomSnapshotUI, RoomInfo, UsersListItem } from "@/@types/room";

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

function safeErrorMessage(err: unknown, fallback = "요청 처리 중 오류가 발생했어요.") {
  const e = err as { response?: { data?: { message?: string } }; message?: string } | undefined;
  return e?.response?.data?.message ?? e?.message ?? fallback;
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
      totalPages: typeof payload.totalPages === "number" ? payload.totalPages : 1,
      number: typeof payload.number === "number" ? payload.number : page,
      size: typeof payload.size === "number" ? payload.size : size,
      totalElements:
        typeof payload.totalElements === "number"
          ? payload.totalElements
          : payload.content?.length ?? 0,
    };
  } catch (err: unknown) {
    throw new Error(safeErrorMessage(err, "내가 참여 중인 캣페 목록을 불러오지 못했어요."));
  }
}

type HostingRoomsPayload = {
  rooms: MyRoomsList[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
};

export async function getMyHostingRooms(
  page: number,
  size: number
): Promise<PageResponse<MyRoomsList>> {
  try {
    const res = await api.get<ApiEnvelope<HostingRoomsPayload>>(
      "/api/rooms/my/hosting",
      { params: { page, size } }
    );
    const d = res.data.data;
    return {
      content: d.rooms,
      totalPages: d.totalPages,
      number: d.page,
      size: d.size,
      totalElements: d.totalElements,
    };
  } catch (err: unknown) {
    throw new Error(safeErrorMessage(err, "내가 만든 캣페 목록을 불러오지 못했어요."));
  }
}

export async function createRoom(dto: CreateRoomDto): Promise<CreateRoomRes> {
  try {
    const res = await api.post<ApiEnvelope<CreateRoomRes>>("/api/rooms", dto);
    return res.data.data;
  } catch (err: unknown) {
    throw new Error(safeErrorMessage(err, "스터디룸 생성에 실패했어요."));
  }
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
    id: String(d.roomId),
    title: d.title,
    description: d.description ?? null,
    maxMember: d.maxParticipants,
    isPrivate: !!d.private,
    password: null,
    coverPreviewUrl: null,
    mediaEnabled,
  };

  const members: UsersListItem[] = (d.members ?? []).map((m) => ({
    id: `u-${m.userId}`,
    name: m.nickname ?? `u-${m.userId}`,
    role: m.role === "HOST" ? "owner" : "member",
    email: "",
    avatarUrl: m.profileImageUrl ?? null,
    isMe: false, 
    media: { camOn: false, screenOn: false },
  }));

  return { info, members };
}

export async function getRoomSnapshot(roomId: string): Promise<RoomSnapshotUI> {
  const { data } = await api.get<ApiEnvelope<RoomDetailDTO>>(`/api/rooms/${roomId}`);
  if (!data.success) throw new Error(data.message || "room detail 실패");
  return toUIFromDetail(data.data);
}
