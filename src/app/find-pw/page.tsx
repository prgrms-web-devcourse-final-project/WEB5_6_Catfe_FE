
import { Metadata } from "next";
import ResetPasswordPage from "./ResetPasswordPage";

export const metadata: Metadata = {
  title: "Catfé | 비밀번호 재설정",
  description: "비밀번호 재설정 페이지 - Catfé에서 새로운 비밀번호를 입력하세요.",
};


export default function Page() {
  return <ResetPasswordPage />;
}