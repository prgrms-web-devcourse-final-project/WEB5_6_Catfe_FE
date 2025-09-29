import Image from "next/image";
import Button from "../Button";

function UserProfileModal() {
  return (
    <div className="w-60 p-5 rounded-xl border border-text-secondary bg-background-white flex flex-col justify-center gap-3 shadow-md">
      {/* 유저 프로필 */}
      <div className="w-10 h-10 rounded-full bg-gray-500 overflow-hidden">
        <Image
          src="/image/cat.png"
          alt="User Profile"
          width={40}
          height={40}
        />
      </div>
      <span className="font-semibold text-sm text-text-primary">[userName]</span>

      {/* 아바타 꾸미기 버튼 */}
      <Button
        size="sm"
        borderType="solid"
        color="secondary"
        hasIcon
        fullWidth
      >
        <Image src="/image/cat.png" alt="cat" width={16} height={16} />
        아바타 꾸미기
      </Button>
    </div>
  );
}
export default UserProfileModal