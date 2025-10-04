"use client";

import Image from "next/image";
import Link from "next/link";

function Footer() {
  return (
    <footer className="w-full h-auto px-6 py-6 bg-background-base border-t border-primary-300 flex justify-center">
      
      <div className="w-[1200px] flex justify-between items-center">
        {/* 왼쪽: 로고 */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/image/logo-light.svg"
            alt="Catfé Logo"
            width={100}
            height={30}
            priority
          />
        </Link>

        {/* 오른쪽: 저작권 + 링크 */}
          <div className="flex flex-col items-end gap-2 text-xs text-text-secondary">
            <span>Copyright 2025 © Programmers DevCourse Team 5</span>
            <div className="flex gap-8">
              <Link
              href="https://github.com/prgrms-web-devcourse-final-project/WEB5_6_Catfe_FE"
              target="_blank"
              className="flex items-center gap-1 hover:text-primary-500"
              >
                <Image src="/socialIcon/git.svg" alt="깃헙 아이콘" width={20} height={20}/>
                FE GitHub
              </Link>
              <Link
              href="https://github.com/prgrms-web-devcourse-final-project/WEB6_8_Catfe_BE"
              target="_blank"
              className="flex items-center gap-1 hover:text-primary-500"
              >
                <Image src="/socialIcon/git.svg" alt="깃헙 아이콘" width={20} height={20}/>
                BE GitHub
              </Link>
            </div>
          </div>
        </div>
    </footer>
  );
}

export default Footer;