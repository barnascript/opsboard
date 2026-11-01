"use client";

import { useEffect, useState } from "react";

function now() {
  const d = new Date();
  const off = -d.getTimezoneOffset() / 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} GMT${off >= 0 ? "+" : ""}${off}`;
}

/** Rendered after mount so server and client HTML never disagree about the time. */
export function Clock() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    setTime(now());
    const t = setInterval(() => setTime(now()), 1000);
    return () => clearInterval(t);
  }, []);
  return <time suppressHydrationWarning>{time ?? "--:--:--"}</time>;
}
