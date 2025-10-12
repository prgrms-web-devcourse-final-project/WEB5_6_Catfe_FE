// 확인용 mock data. API 연결 후 삭제 예정

import type { RoomSnapshot } from '@/@types/rooms';

export const DUMMY_ROOMS: Record<string, RoomSnapshot> = {
  'room-001': {
    info: {
      id: 1,
      title: '내코살 연구소',
      description: '저희 진짜 행복해요.. 진짜',
      maxParticipants: 10,
      isPrivate: true,
      // password: "12341234!",
      coverPreviewUrl: null,
      // mediaEnabled: false,
      allowAudio: false,
      allowCamera: false,
      allowScreenShare: false,
      currentParticipants: 2,
      status: 'ACTIVE',
    },
    members: [
      { id: 11, name: '기은', role: 'HOST' },
      { id: 12, name: '주은', role: 'SUB_HOST' },
      { id: 13, name: '은진', role: 'SUB_HOST' },
      { id: 14, name: '유하', role: 'MEMBER' },
      { id: 15, name: '진강', role: 'MEMBER' },
      { id: 16, name: '선호', role: 'MEMBER' },
      { id: 17, name: '예원', role: 'MEMBER' },
      { id: 18, name: '민호', role: 'MEMBER' },
    ],
  },
  'room-002': {
    info: {
      id: 2,
      title: '내코살',
      description: '살려주세요 살려주세요',
      maxParticipants: 4,
      isPrivate: false,
      // password: null,
      coverPreviewUrl: null,
      // mediaEnabled: true,
      allowAudio: true,
      allowCamera: true,
      allowScreenShare: true,
      currentParticipants: 2,
      status: 'ACTIVE',
    },
    members: [
      { id: 21, name: '은진', role: 'HOST' },
      { id: 22, name: '진강', role: 'SUB_HOST' },
      { id: 23, name: '유하', role: 'MEMBER' },
    ],
  },
  'room-003': {
    info: {
      id: 3,
      title: '연구소',
      description: '재미있게 개발해요',
      maxParticipants: 8,
      isPrivate: false,
      // password: null,
      coverPreviewUrl: null,
      // mediaEnabled: false,
      allowAudio: false,
      allowCamera: false,
      allowScreenShare: false,
      currentParticipants: 5,
      status: 'ACTIVE',
    },
    members: [
      { id: 31, name: '주은', role: 'HOST' },
      { id: 32, name: '기은', role: 'SUB_HOST' },
      { id: 33, name: '예원', role: 'SUB_HOST' },
      { id: 34, name: '선호', role: 'MEMBER' },
      { id: 35, name: '민호', role: 'MEMBER' },
    ],
  },
};
