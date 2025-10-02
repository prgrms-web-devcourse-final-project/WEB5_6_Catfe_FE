"use client";
import { useEffect, useState } from "react";

export default function usePortal(id = "app-portal") {
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    let portal = document.getElementById(id);
    if (!portal) {
      portal = document.createElement("div");
      portal.id = id;
      document.body.appendChild(portal);
    }
    setEl(portal);
  }, [id]);
  return el;
}