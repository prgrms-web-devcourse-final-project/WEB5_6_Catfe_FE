import { Metadata } from 'next';
import MyPageClient from './page.client';

export const metadata: Metadata = {
  title: 'Catfé | My Page',
  description: '회원 정보, 활동 내역, 설정 변경 등 계정 맞춤 정보를 확인하세요.',
};

function MyPage() {
  return (
    <div>
      <MyPageClient />
    </div>
  );
}
export default MyPage;
