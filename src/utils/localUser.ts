export type LocalUser = {
  userId: number;
  username?: string;
  nickname?: string;
  email?: string;
  role?: string;
  status?: string;
};

export function getLocalUser(): LocalUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LocalUser;
    if (typeof parsed?.userId !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getMeIdFromLocal(): string | null {
  const u = getLocalUser();
  if (!u) return null;
  return `u-${u.userId}`;
}
