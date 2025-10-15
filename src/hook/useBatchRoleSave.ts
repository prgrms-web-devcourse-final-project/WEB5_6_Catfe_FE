"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { applyRoleUpdatesBatch, type RoleUpdateItem, type BatchRoleResult } from "@/api/apiRooms";
import { roomMembersQk } from "@/hook/useRoomMembers";

type Options = {
  invalidate?: boolean;
  invalidateRoomDetail?: boolean;
};

export function useBatchRoleSave(roomId: number, opts: Options = { invalidate: true, invalidateRoomDetail: false }) {
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const save = useCallback(async (updates: RoleUpdateItem[]) => {
    setSaving(true);
    try {
      const result: BatchRoleResult = await applyRoleUpdatesBatch(roomId, updates);

      if (opts.invalidate !== false && result.succeeded.length > 0) {
        await queryClient.invalidateQueries({ queryKey: roomMembersQk.list(roomId), exact: true });
      }

      if (opts.invalidateRoomDetail) {
        await queryClient.invalidateQueries({ queryKey: ["roomInfo", roomId], exact: true });
      }

      return result;
    } finally {
      setSaving(false);
    }
  }, [roomId, opts.invalidate, opts.invalidateRoomDetail, queryClient]);

  return { save, saving };
}
