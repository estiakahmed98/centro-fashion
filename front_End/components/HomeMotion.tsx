"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function HomeMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window)) return;

    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.visible = "true";
          revealObserver.unobserve(entry.target);
        }
      },
      { threshold: 0.12 },
    );

    for (const element of root.querySelectorAll<HTMLElement>("[data-reveal]")) {
      // Keep the first screen visible; animate sections as they scroll into view.
      if (element.getBoundingClientRect().top < window.innerHeight) {
        element.dataset.visible = "true";
      } else {
        revealObserver.observe(element);
      }
    }
    root.dataset.motionReady = "true";

    const video = root.querySelector<HTMLVideoElement>("[data-story-video]");
    let videoVisible = false;
    let disposed = false;

    function syncPlayback() {
      if (!video) return;
      if (!videoVisible || document.hidden || motionPreference.matches) {
        video.pause();
        return;
      }
      video.muted = true;
      void video.play().catch((error: unknown) => {
        // Browser autoplay restrictions still allow playback using native controls.
        if (
          !disposed &&
          error instanceof DOMException &&
          error.name !== "AbortError"
        ) {
          video.controls = true;
        }
      });
    }

    const videoObserver = new IntersectionObserver(
      ([entry]) => {
        if (!video || !entry) return;
        videoVisible = entry.isIntersecting && entry.intersectionRatio >= 0.18;
        if (videoVisible && !video.getAttribute("src") && video.dataset.src) {
          video.src = video.dataset.src;
        }
        syncPlayback();
      },
      { threshold: [0, 0.18] },
    );
    if (video) videoObserver.observe(video);
    document.addEventListener("visibilitychange", syncPlayback);
    motionPreference.addEventListener("change", syncPlayback);

    return () => {
      disposed = true;
      revealObserver.disconnect();
      videoObserver.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      motionPreference.removeEventListener("change", syncPlayback);
      video?.pause();
      delete root.dataset.motionReady;
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="editorial-home [--editorial-gap:3px] [&_[data-reveal]]:transition-[opacity,translate] [&_[data-reveal]]:duration-1000 [&_[data-reveal]]:ease-[cubic-bezier(0.22,1,0.36,1)] [&_[data-reveal='100']]:delay-100 [&_[data-reveal='200']]:delay-200 [&_[data-reveal='300']]:delay-300 [&_[data-reveal='400']]:delay-[400ms] [&[data-motion-ready=true]_[data-reveal]:not([data-visible=true])]:opacity-0 [&[data-motion-ready=true]_[data-reveal]:not([data-visible=true])]:translate-y-8 motion-reduce:[&_[data-reveal]]:transition-none! motion-reduce:[&_[data-reveal]]:opacity-100! motion-reduce:[&_[data-reveal]]:translate-y-0! [&_.editorial-button]:transition-[background,color,translate,box-shadow] [&_.editorial-button:hover]:-translate-y-1 [&_.editorial-button:hover]:shadow-lg [&_.editorial-button_svg]:transition-transform [&_.editorial-button:hover_svg]:translate-x-1 motion-reduce:[&_.editorial-button:hover]:translate-y-0 motion-reduce:[&_.editorial-button:hover_svg]:translate-x-0"
    >
      {children}
    </div>
  );
}
