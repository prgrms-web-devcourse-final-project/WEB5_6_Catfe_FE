import ChangePassword from '@/components/mypage/settings/ChangePassword';
import SettingNotification from '@/components/mypage/settings/SettingNotification';
import SettingProfile from '@/components/mypage/settings/SettingProfile';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catfé | Settings',
  description: '프로필 및 알림 설정 페이지입니다.',
};

function Page() {
  return (
    <div>
      <h2 className="font-extrabold text-2xl mb-8 ml-4">Settings</h2>
      <div className="w-full md:w-3/4 max-w=[920px] mx-auto flex flex-col gap-10">
        <SettingProfile />
        <SettingNotification />
        <ChangePassword />
      </div>
    </div>
  );
}
export default Page;
