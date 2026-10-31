"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function StorefrontProgress() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const enabled = pathname === "/" || pathname.startsWith("/ecommerce");
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    let pending = true;
    let committed = true;
    let completing = false;
    let tick: ReturnType<typeof setInterval> | undefined;
    let hide: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;
    let safety: ReturnType<typeof setTimeout> | undefined;
    const stopTimers = () => {
      clearInterval(tick);
      clearTimeout(hide);
      clearTimeout(safety);
    };
    const start = () => {
      stopTimers();
      pending = true;
      committed = false;
      completing = false;
      setVisible(true);
      setProgress(0);
      // Navigation has no byte total: estimate below 95%, finish on content commit.
      tick = setInterval(() => setProgress(value => Math.min(94, value + Math.max(0.25, (95 - value) * 0.08))), 180);
      // Cancelled/failed transitions must never leave a permanent overlay.
      safety = setTimeout(() => { stopTimers(); pending = false; setVisible(false); }, 60_000);
    };
    const inspect = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const loading = document.querySelector('[data-storefront-loading="route"]');
        if (loading) {
          if (!pending || completing) start();
          committed = true;
        } else if (pending && committed && !completing) {
          completing = true;
          clearInterval(tick);
          clearTimeout(safety);
          setProgress(100);
          clearTimeout(hide);
          hide = setTimeout(() => { pending = false; setVisible(false); }, 350);
        }
      });
    };
    const commit = () => { committed = true; inspect(); };
    let observedHeader: Element | null = null;
    const position = () => {
      const header = document.querySelector(".editorial-header-group");
      if (header !== observedHeader) {
        if (observedHeader) resize.unobserve(observedHeader);
        if (header) resize.observe(header);
        observedHeader = header;
      }
      const bottom = header?.getBoundingClientRect().bottom ?? 0;
      bar.current?.style.setProperty("--storefront-progress-top", `${Math.max(0, bottom)}px`);
    };
    const observer = new MutationObserver(records => {
      if (records.every(record => {
        const element = record.target instanceof Element ? record.target : record.target.parentElement;
        return element?.closest(".storefront-progress");
      })) return;
      position();
      inspect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const resize = new ResizeObserver(position);
    window.addEventListener("storefront:navigation-start", start);
    window.addEventListener("storefront:navigation-commit", commit);
    window.addEventListener("scroll", position, { passive: true });
    window.addEventListener("resize", position);
    start();
    committed = true;
    position();
    inspect();
    return () => {
      stopTimers();
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      window.removeEventListener("storefront:navigation-start", start);
      window.removeEventListener("storefront:navigation-commit", commit);
      window.removeEventListener("scroll", position);
      window.removeEventListener("resize", position);
    };
  }, [enabled]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("storefront:navigation-commit", { detail: pathname + (search ? `?${search}` : "") }));
  }, [pathname, search]);

  if (!enabled) return null;
  const percentage = Math.floor(progress);
  return <div ref={bar} className="storefront-progress" data-visible={visible} aria-hidden={!visible}>
    <div role="progressbar" aria-label="Loading page" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage} aria-valuetext={percentage === 100 ? "Page ready" : `Loading page, approximately ${percentage}%`}>
      <div className="storefront-progress-fill" style={{ transform: `scaleX(${progress / 100})` }} />
      <span className="storefront-progress-count">{percentage}%</span>
    </div>
  </div>;
}
