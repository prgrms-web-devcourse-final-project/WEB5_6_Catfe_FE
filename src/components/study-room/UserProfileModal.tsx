import Image from "next/image";
import Button from "../Button";

function UserProfileModal() {
  return (
    <div className="w-70 p-6 rounded-xl border border-text-secondary bg-background-white flex flex-col justify-center gap-3 shadow-md">
      {/* 유저 프로필 */}
      <div className="w-15 h-15 rounded-full bg-gray-500 overflow-hidden">
        <Image
          src="/image/cat.png"
          alt="User Profile"
          width={60}
          height={60}
        />
      </div>
      <span className="font-semibold text-text-primary">[userName]</span>

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