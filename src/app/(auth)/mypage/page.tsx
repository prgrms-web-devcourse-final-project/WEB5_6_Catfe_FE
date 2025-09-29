'use client';

import NotificationDrawer from '@/components/notification/NotificationDrawer';
import { useState } from 'react';

function MyPage() {
  const [open, setOpen] = useState(true);
  return (
    <div>
      MyPage
      <NotificationDrawer open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
export default MyPage;
