'use client';

import NotificationDrawer from '@/components/notification/NotificationDrawer';
import TimerPanel from '@/components/study-room/timer/TimerPanel';
import { useState } from 'react';

function MyPage() {
  const [open, setOpen] = useState(true);
  return (
    <div>
      MyPage
      <TimerPanel />
      <NotificationDrawer open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
export default MyPage;
