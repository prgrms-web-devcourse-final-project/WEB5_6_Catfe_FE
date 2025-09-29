"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

function Header() {
  const { user, logout, isHydrated } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const HEADER_HEIGHT = 56;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // 스크롤을 내리는 중 헤더 숨김
        setHidden(true);
      } else {
        setHidden(false);
      }

      lastScrollY = currentScrollY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY < 50) {
        setHidden(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);
      // 깜빡임 방지
  if (!isHydrated) {
    return null;
  }
console.log("[Header] 렌더링됨, user:", user, "isHydrated:", isHydrated);
  return (
    <>
    <header className={`fixed top-0 left-0 w-full h-[56px] flex items-center justify-between px-10 border-b border-[var(--color-primary-500)] bg-[var(--color-background-base)] transition-transform duration-300 ${
    hidden ? "-translate-y-full" : "translate-y-0"
  } z-[9999]`}>
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/image/logo-light.svg"
          alt="Catfé Logo"
          width={145}
          height={35}
          priority
        />
      </Link>
      <div className="flex items-center gap-5 relative">
        <nav className="flex gap-5 text-gray-700 text-sm">
          <Link href="/" className="hover:font-semibold">
            Home
          </Link>
          <Link href="/study-rooms" className="hover:font-semibold">
            Study Room
          </Link>
          <Link href="/community" className="hover:font-semibold">
            Community
          </Link>
          <Link href="/mypage" className="hover:font-semibold">
            My Page
          </Link>
        </nav>
        {user ? (
          <div className="relative" ref={dropdownRef}>
            {/* 프로필 이미지 */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center"
              aria-label="사용자 메뉴 열기"
            >
              <Image
                src={user.profileImage || "/image/cat-default.svg"}
                alt="profile"
                width={36}
                height={36}
                className="rounded-full border border-gray-300"
              />
            </button>
            {/* 드롭다운 (로그아웃) */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-md">
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="px-4 py-[7px] text-sm rounded-md font-medium border border-[var(--color-primary-600)] bg-[var(--color-secondary-400)]"
          >
            Log In
          </Link>
        )}
      </div>
    </header>
    <div style={{ height: HEADER_HEIGHT }} />
    </>
  );
}



export default Header