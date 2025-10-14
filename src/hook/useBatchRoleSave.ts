"use client";

import { useState, useCallback } from "react";
import { applyRoleUpdatesBatch, type RoleUpdateItem, type BatchRoleResult } from "@/api/apiRooms";

export function useBatchRoleSave(roomId: number) {
  const [saving, setSaving] = useState(false);

  const save = useCallback(async (updates: RoleUpdateItem[]) => {
    setSaving(true);
    try {
      const result: BatchRoleResult = await applyRoleUpdatesBatch(roomId, updates);
      return result;
    } finally {
      setSaving(false);
    }
  }, [roomId]);

  return { save, saving };
}