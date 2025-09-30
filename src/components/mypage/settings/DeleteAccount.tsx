import Button from '@/components/Button';

function DeleteAccount() {
  // !! 임시 UI만 : 회원탈퇴 api 만들어지면 기능 붙일 것 !!
  return (
    <section className="flex flex-col gap-5 w-full">
      <h3>회원 탈퇴</h3>
      <hr />
      <Button type="submit" size="md" className="rounded-full mx-auto">
        CATFE 떠나기
      </Button>
    </section>
  );
}
export default DeleteAccount;
