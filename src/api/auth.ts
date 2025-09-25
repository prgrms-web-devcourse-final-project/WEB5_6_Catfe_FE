import api from "@/utils/api";

interface LoginRequest {
  username: string;
  password: string;
}

export async function login(data: LoginRequest) {
  const res = await api.post("/auth/login", data);

  const accessToken = res.headers["authorization"];
  if (accessToken) {
    const token = accessToken.replace("Bearer ", "");
    localStorage.setItem("accessToken", token);
  }

  return res.data; // data 안에 user 정보 있음
}
