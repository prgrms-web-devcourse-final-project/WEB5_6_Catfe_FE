// 확인용 mock data. API 연결 후 삭제 예정

import type { RoomSnapshot } from "@/@types/room";

export const DUMMY_ROOMS: Record<string, RoomSnapshot> = {
  "room-001": {
    info: {
      id: "room-001",
      title: "내코살 연구소",
      description: "저희 진짜 행복해요.. 진짜",
      maxMember: 10,
      isPrivate: true,
      password: "12341234!",
      coverPreviewUrl: null,
      mediaEnabled: false,
    },
    members: [
      { id: "u11", name: "기은", role: "owner", email: "namgieun@gmail.com" },
      { id: "u12", name: "주은", role: "staff", email: "jueunk617@gmail.com" },
      { id: "u13", name: "은진", role: "staff", email: "eafiseemn@gmail.com" },
      { id: "u14", name: "유하", role: "member", email: "yooha922@gmail.com" },
      { id: "u15", name: "진강", role: "member", email: "jingangbak@gmail.com" },
      { id: "u16", name: "선호", role: "member", email: "seon__ho@gmail.com" },
      { id: "u17", name: "예원", role: "member", email: "joyeweon@gmail.com" },
      { id: "u18", name: "민호", role: "member", email: "mi_noko@gmail.com" },
    ],
  },
  "room-002": {
    info: {
      id: "room-002",
      title: "내코살",
      description: "살려주세요 살려주세요",
      maxMember: 4,
      isPrivate: false,
      password: null,
      coverPreviewUrl: null,
      mediaEnabled: true,
    },
    members: [
      { id: "u21", name: "은진", role: "owner", email: "eafiseemn@gmail.com" },
      { id: "u22", name: "진강", role: "staff", email: "jingangbak@gmail.com" },
      { id: "u23", name: "유하", role: "member", email: "yooha922@gmail.com" },
    ],
  },
  "room-003": {
    info: {
      id: "room-003",
      title: "연구소",
      description: "재미있게 개발해요",
      maxMember: 8,
      isPrivate: false,
      password: null,
      coverPreviewUrl: null,
      mediaEnabled: false,
    },
    members: [
      { id: "u31", name: "주은", role: "owner", email: "jueunk617@gmail.com" },
      { id: "u32", name: "기은", role: "staff", email: "namgieun@gmail.com" },
      { id: "u33", name: "예원", role: "staff", email: "joyeweon@gmail.com" },
      { id: "u34", name: "선호", role: "member", email: "seon__ho@gmail.com" },
      { id: "u35", name: "민호", role: "member", email: "mi_noko@gmail.com" },
    ],
  },
};