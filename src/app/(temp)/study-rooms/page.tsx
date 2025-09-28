import TimerPanel from '@/components/study-room/timer/TimerPanel';
import ChatRoomContainer from './ChatRoomContainer';

function Page() {
  return (
    <div className="w-screen min-h-screen flex flex-col justify-start items-center py-4 gap-7">
      Study Room Page
      <TimerPanel />
      <ChatRoomContainer />
    </div>
  );
}
export default Page;
