"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function HomeMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window)) return;

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

    return () => {
      revealObserver.disconnect();
      delete root.dataset.motionReady;
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="editorial-home [--editorial-gap:3px] [&_[data-reveal]]:transition-[opacity,translate] [&_[data-reveal]]:duration-1000 [&_[data-reveal]]:[transition-timing-function:cubic-bezier(0.22,1,0.36,1)] [&_[data-reveal='100']]:delay-100 [&_[data-reveal='200']]:delay-200 [&_[data-reveal='300']]:delay-300 [&_[data-reveal='400']]:[transition-delay:400ms] [&[data-motion-ready=true]_[data-reveal]:not([data-visible=true])]:opacity-0 [&[data-motion-ready=true]_[data-reveal]:not([data-visible=true])]:translate-y-8 motion-reduce:[&_[data-reveal]]:!transition-none motion-reduce:[&_[data-reveal]]:!opacity-100 motion-reduce:[&_[data-reveal]]:!translate-y-0 [&_.editorial-button]:transition-[background,color,translate,box-shadow] [&_.editorial-button:hover]:-translate-y-1 [&_.editorial-button:hover]:shadow-lg [&_.editorial-button_svg]:transition-transform [&_.editorial-button:hover_svg]:translate-x-1 motion-reduce:[&_.editorial-button:hover]:translate-y-0 motion-reduce:[&_.editorial-button:hover_svg]:translate-x-0"
    >
      {children}
    </div>
  );
}
