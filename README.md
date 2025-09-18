> 프로그래머스 프론트엔드 데브코스 5기 6회차 4차 프로젝트 - 5팀 Catfe

<div align="center">

# 🐱 Catfé 🐱

**온라인에서 함께 공부할 수 있는 스터디룸 플랫폼**
WebRTC 중심의 화상 채팅으로 소통하며 공부하고,
공부시간을 기록해 그룹원들과 함께 성장을 확인할 수 있는 서비스입니다.
</div>


## 📑 목차
1. [🚀 프로젝트 개요](#-프로젝트-개요)
2. [🎨 프로젝트 디자인](#-프로젝트-디자인)
3. [🛠️ 기술 스택](#️-기술-스택)
4. [📂 폴더 구조](#-폴더-구조)
5. [🌱 개발 컨벤션](#-개발-컨벤션)

---

## 🚀 프로젝트 개요

- **프로젝트명** : Catfé
- **목적** : 원격 환경에서도 실시간 소통과 집중 학습을 돕는 온라인 스터디룸 플랫폼 개발
- **주요 기능** :
  - 🏠 홈 화면 : 게스트(서비스 소개), 유저(최근 참여 스터디룸)
  - 🔐 회원 관리 : 로그인, 회원가입, 계정 찾기/삭제
  - 🎥 스터디룸(WebRTC) : 채팅, 마이크/화면공유/캠, 참여/생성/나가기
  - ⏱️ 스터디 타이머 : 공부 시간 기록 및 그룹 관리
  - 🗓️ 스터디 플래너 : 학습 일정/목표 관리
  - 💬 커뮤니티 : 스터디 그룹원 모집글 작성/검색/필터링
  - 🧑‍💻 마이페이지 : 내 활동 내역, 알림

---

## 🛠️ 기술 스택

| 영역 | 기술 |
|------|------|
| **Framework** | Next.js (App Router) + React + TypeScript |
| **Styling** | TailwindCSS |
| **State Management** | TanStack Query, Zustand |
| **Lint / Format** | ESLint + Prettier |
| **Animation** | GSAP |
| **Database & Auth** | MySQL (AWS RDS) |
| **Rich Text & UI** | Tiptap, React Toastify |
| **Deployment** | AWS EC2 |
---

## 📂 폴더 구조

```bash
public
 ├── icons
 └── images

src
 ├── app/           # App Router 기반 라우트
 ├── components/    # 공통 컴포넌트
 ├── hooks/         # 커스텀 훅
 ├── store/         # Zustand 전역 상태
 ├── lib/           # 외부 라이브러리 설정 (query client 등)
 ├── @types/        # 타입 관리
 ├── styles/        # 전역 스타일
 └── utils/         # 유틸 함수 (formatDate.ts, className.ts 등)

```

---

 ## 🌱 개발 컨벤션

### 🔹 Git 전략
- **브랜치 구조** : `main` → `dev` → `feature/bug`
- **Merge 규칙** : 
  - 기본 UI/단위 기능 → dev로 merge
  - 큰 기능/bug fix 단위 → main으로 merge
- **Review 규칙** : 최소 1명 승인 후 merge

### 🔹 Branch 네이밍
- 규칙 : `[feature] ComponentName_Nickname`
  - 예시 : `[feature] Header_EJ`
- 브랜치 태그 종류 :
  - ✨ **feat** : 기능 개발
  - 🐛 **fix** : 버그 수정
  - 🔧 **chore** : 배포, 라이브러리 작업 등
  - 📄 **docs** : 문서 작업 (README 등)
  - 🎨 **style** : CSS 수정, 코드 포맷 변경
  - 💬 **comment** : 주석 추가/수정

### 🔹 Commit 규칙
- 브랜치 prefix와 동일한 태그 사용
  - 예시 : feat: Header UI 구현

### 🔹 PR 규칙
- Issue 단위로 PR 생성
- PR 올리기 전 반드시 dev 최신본 pull → 충돌 해결 후 merge
- 최소 1명 승인 필요

### 🔹 네이밍 규칙
- className → camelCase
- Component → PascalCase