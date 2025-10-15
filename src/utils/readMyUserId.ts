export default function readMyUserId(): number | null {
  try {
    const token = localStorage.getItem("accessToken") ?? "";
    const base64 = (token.split(".")[1] ?? "").replace(/-/g, "+").replace(/_/g, "/");
    if (!base64) return null;
    const json = JSON.parse(decodeURIComponent(atob(base64).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")));
    const raw = (json.userId ?? json.sub ?? json.id) as unknown;
    const id = Number(raw);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}