import { Metadata } from 'next';
import Image from 'next/image';
import RegisterForm from './RegisterForm';

export const metadata: Metadata = {
  title: 'Catfé | Register',
  description: '회원가입 페이지 - Catfé에서 새로운 계정을 만들어보세요.',
};

function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-5xl mx-auto flex-col md:flex-row items-center gap-10 md:gap-20">
        <div className="w-full max-w-[600px]">
          <Image
            src="/catmodum/catmakase_02.png"
            alt="고양모둠"
            width={600}
            height={600}
            className="w-full h-auto object-contain"
            priority
          />
        </div>
        <div className="w-full max-w-[403px] flex flex-col gap-6">
          <h2 className="text-[48px] md:text-[64px] font-semibold text-secondary-900 mb-5 text-center md:text-left">
            Register
          </h2>
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}

export default RegisterPage;
