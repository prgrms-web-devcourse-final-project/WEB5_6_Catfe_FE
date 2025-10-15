import api from "@/utils/api";

type ApiEnvelope<T> = {
  code: string;
  message: string;
  data: T;
  success: boolean;
};

export async function updateMyAvatar(roomId: number, avatarId: number): Promise<string> {
  try {
    const res = await api.put<ApiEnvelope<null>>(`/api/rooms/${roomId}/avatars/me`, {
      avatarId,
    });

    if (!res.data.success) {
      throw new Error(res.data.message || "아바타 변경에 실패했어요.");
    }
    return res.data.message ?? "아바타가 변경되었습니다.";
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } }; message?: string };
    throw new Error(e?.response?.data?.message ?? e?.message ?? "아바타 변경에 실패했어요.");
  }
}
