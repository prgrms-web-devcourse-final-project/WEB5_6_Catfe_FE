import { Metadata } from 'next';
import PlannerClient from './page.client';

export const metadata: Metadata = {
  title: 'Catfé | Study Planner',
  description: '매일 공부 계획을 세우고 실천해보세요.',
};

function Page() {
  return (
    <div>
      <h2 className="font-extrabold text-2xl mb-8 ml-4">Study Planner</h2>
      <div className="w-full md:w-3/4 max-w=[920px] mx-auto flex flex-col gap-10">
        <PlannerClient />
      </div>
    </div>
  );
}
export default Page;
