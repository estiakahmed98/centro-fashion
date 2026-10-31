"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const SupportChatWidget = dynamic(() => import("./SupportChatWidget"), { ssr: false });

export default function LazySupportChatWidget() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let idle: number | undefined;
    const defer = () => {
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(() => setReady(true), { timeout: 4000 });
      else setReady(true);
    };
    const timer = window.setTimeout(defer, 1500);
    return () => {
      clearTimeout(timer);
      if (idle !== undefined) window.cancelIdleCallback(idle);
    };
  }, []);
  return ready ? <SupportChatWidget /> : null;
}
