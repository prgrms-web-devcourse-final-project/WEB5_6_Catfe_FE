'use client';

import Button from '@/components/Button';
import { useDeleteUser } from '@/hook/useAuthActions';
import { useConfirm } from '@/hook/useConfirm';
import showToast from '@/utils/showToast';
import Image from 'next/image';

function DeleteAccount() {
  const confirm = useConfirm();
  const { mutateAsync: deleteUser, isPending: isDeleting } = useDeleteUser();

  const handleDeleteAccount = async () => {
    const confirmOk = await confirm({
      title: '정말 탈퇴하시겠습니까?',
      description: (
        <div className="flex gap-4 items-center mt-4 w-full">
          <p className="text-gray-700 flex-1">
            Catfé에 대한 피드백을 주시면 <br />
            저희가 열심히 반영해볼게요.. <br />
            가지 마세요... 🥺
          </p>
          <div className="relative size-16">
            <Image src={'/image/crying-cat.svg'} alt="울고 있는 고양이" fill />
          </div>
        </div>
      ),
      confirmText: '미련 없이 탈퇴하기',
      cancelText: '조금 더 생각해보기',
      tone: 'danger',
    });
    if (!confirmOk) return;

    try {
      await deleteUser();
      showToast('success', 'Catfé를 떠나셨습니다. 언젠가 다시 만나요!👋');
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (error) {
      console.error('회원 탈퇴 오류:', error);
      showToast('error', '탈퇴 처리에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };
  return (
    <section className="flex flex-col gap-5 w-full">
      <h3>회원 탈퇴</h3>
      <hr />
      <Button
        type="submit"
        size="md"
        className="rounded-full mx-auto"
        onClick={handleDeleteAccount}
        disabled={isDeleting}
      >
        CATFE 떠나기
      </Button>
    </section>
  );
}
export default DeleteAccount;
