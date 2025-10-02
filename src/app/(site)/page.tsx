import HomeClient from "@/components/home/HomeClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catfé | 온라인 스터디 카페",
  description: "고양이와 함께하는 온라인 스터디 공간! 다양한 기능을 공부에 활용해보세요!",
};

export default function Page() {
  return <HomeClient />;
}