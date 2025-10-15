import api from "@/utils/api";
import type { AllRoomsList, CreateRoomDto, CreateRoomRes, MyRoomsList, Role, RoomMemberDTO, UpdateRoomDto } from "@/@types/rooms";
import type { RoomSnapshotUI, RoomInfo, UsersListItem } from "@/@types/rooms";
import type { Role } from "@/@types/rooms"

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

export type InviteMeData = {
  inviteCode: string;
  inviteLink: string;
  roomId: number;
  roomTitle: string;
  createdByNickname: string;
  expiresAt: string;
  active: boolean;
  valid: boolean;
};

export type InviteEnterData = {
  roomId: number;
  userId: number;
  role: Role;
  joinedAt: string;
};

export type RoleChangeResponse = {
  userId: number;
  nickname: string;
  oldRole: Role;
  newRole: Role;
  message: string;
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
  thumbnailUrl?: string | null;
};

function toUIFromDetail(d: RoomDetailDTO): RoomSnapshotUI {
  const mediaEnabled = !!(d.allowCamera || d.allowAudio || d.allowScreenShare);

  const info: RoomInfo = {
    id: d.roomId,
    title: d.title,
    description: d.description ?? "",
    maxParticipants: d.maxParticipants,
    isPrivate: !!d.private,
    coverPreviewUrl: d.thumbnailUrl ?? null,
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
    avatarId: m.avatarId ?? null,
    avatarUrl: m.avatarImageUrl ?? m.profileImageUrl ?? null,
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

export async function updateRoom(
  roomId: number,
  dto: UpdateRoomDto,
  method: "put" | "patch" = "put"
): Promise<string> {
  try {
    const req = method === "put"
      ? api.put<ApiEnvelope<string>>(`/api/rooms/${roomId}`, dto)
      : api.patch<ApiEnvelope<string>>(`/api/rooms/${roomId}`, dto);

    const res = await req;
    if (!res.data.success) throw new Error(res.data.message || "방 설정 변경에 실패했어요.");
    return res.data.data;
  } catch (err: unknown) {
    throw new Error(safeErrorMessage(err, "방 설정 변경에 실패했어요."));
  }
}

export async function getMyInvite(roomId: number): Promise<InviteMeData> {
  const { data } = await api.get<ApiEnvelope<InviteMeData>>(`/api/rooms/${roomId}/invite/me`);
  if (!data.success) throw new Error(data.message || "초대 코드 발급에 실패했어요.");
  return data.data;
}

export async function enterByInviteCode(inviteCode: string): Promise<InviteEnterData> {
  try {
    const code = inviteCode.replace(/[\s-]/g, '').toUpperCase();
    const { data } = await api.post<ApiEnvelope<InviteEnterData>>(`/api/invite/${encodeURIComponent(code)}`);
    if (!data.success) throw new Error(data.message || "초대 코드 입장에 실패했어요.");
    return data.data;
  } catch (err: unknown) {
    throw new Error(safeErrorMessage(err, "초대 코드 입장에 실패했어요."));
  }
}


type ApiSuccess = { code?: string; message?: string; data?: null; success?: boolean };

function pickMessage(d: unknown, fallback: string): string {
  if (typeof d === "object" && d !== null && "message" in d) {
    const msg = (d as { message?: unknown }).message;
    if (typeof msg === "string" && msg.trim().length > 0) return msg;
  }
  return fallback;
}

/** 방 비밀번호 변경: 백엔드가 PATCH 미지원 → POST 고정 */
export async function changeRoomPassword(
  roomId: number,
  currentPassword: string,
  newPassword: string
): Promise<string> {
  if (!Number.isFinite(roomId) || roomId <= 0) {
    throw new Error("유효하지 않은 roomId 입니다.");
  }

  try {
    const { data } = await api.post<ApiSuccess>(`/api/rooms/${roomId}/password`, {
      currentPassword,
      newPassword,
    }, {
      headers: { "Content-Type": "application/json" },
    });

    const msg = pickMessage(data, "비밀번호가 변경되었어요.");
    if (data.code && data.code !== "200") throw new Error(msg);
    if (data.success === false) throw new Error(msg);
    return msg;
  } catch (error) {
    // 서버 메시지 우선 노출
    const serverMsg =
      (typeof error === "object" && error && "response" in error
        ? (error as { response?: { data?: unknown } }).response?.data
        : undefined);
    const msg = pickMessage(serverMsg, error instanceof Error ? error.message : "비밀번호 변경에 실패했어요.");
    throw new Error(msg);
  }
}

export async function deleteRoomPassword(roomId: number): Promise<string> {
  if (!Number.isFinite(roomId) || roomId <= 0) throw new Error("유효하지 않은 roomId 입니다.");
  try {
    const { data } = await api.delete<ApiSuccess>(`/api/rooms/${roomId}/password`, {
      headers: { "Content-Type": "application/json" },
    });
    const msg = pickMessage(data, "비밀번호가 제거되었어요.");
    if (data.code && data.code !== "200") throw new Error(msg);
    if (data.success === false) throw new Error(msg);
    return msg;
  } catch (error) {
    const serverMsg =
      (typeof error === "object" && error && "response" in error
        ? (error as { response?: { data?: unknown } }).response?.data
        : undefined);
    const msg = pickMessage(serverMsg, error instanceof Error ? error.message : "비밀번호 제거에 실패했어요.");
    throw new Error(msg);
  }
}


/** 단일 멤버 역할 변경 (PUT /api/rooms/{roomId}/members/{userId}/role) */
export async function changeMemberRole(
  roomId: number,
  userId: number,
  newRole: Exclude<Role, "HOST"> // HOST로의 변경이 가능하다면 Exclude 제거
): Promise<RoleChangeResponse> {
  try {
    const { data } = await api.put<ApiEnvelope<RoleChangeResponse>>(
      `/api/rooms/${roomId}/members/${userId}/role`,
      { newRole },
      { headers: { "Content-Type": "application/json" } }
    );
    if (!data?.success) throw new Error(data?.message || "역할 변경에 실패했어요.");
    return data.data;
  } catch (err) {
    throw new Error(safeErrorMessage(err, "역할 변경에 실패했어요."));
  }
}

/** 여러 명 배치 저장 유틸 (순차 호출; 실패/성공 결과 반환) */
export type RoleUpdateItem = { userId: number; newRole: Exclude<Role, "HOST"> };

export type BatchRoleResult = {
  succeeded: Array<{ userId: number; newRole: Role; resp: RoleChangeResponse }>;
  failed: Array<{ userId: number; newRole: Role; error: string }>;
};

export async function applyRoleUpdatesBatch(
  roomId: number,
  updates: RoleUpdateItem[]
): Promise<BatchRoleResult> {
  const succeeded: BatchRoleResult["succeeded"] = [];
  const failed: BatchRoleResult["failed"] = [];

  for (const u of updates) {
    try {
      const resp = await changeMemberRole(roomId, u.userId, u.newRole);
      succeeded.push({ userId: u.userId, newRole: u.newRole, resp });
    } catch (e) {
      failed.push({
        userId: u.userId,
        newRole: u.newRole,
        error: e instanceof Error ? e.message : "알 수 없는 오류",
      });
    }
  }
  return { succeeded, failed };
}