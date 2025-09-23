"use client";

import { useState } from "react";
import Toggle from "@/components/Toggle";


function SettingsNotice() {

  const [newNotice, setNewNotice] = useState(true);
  const [newMember, setNewMember] = useState(true);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-primary">새로운 공지</span>
        <Toggle checked={newNotice} onChange={setNewNotice} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-primary">새로운 멤버 입장</span>
        <Toggle checked={newMember} onChange={setNewMember} />
      </div>
    </div>
  )
}
export default SettingsNotice