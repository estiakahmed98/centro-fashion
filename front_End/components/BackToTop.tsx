"use client";

import { useEffect, useState } from "react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 300);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      className="back-to-top fixed right-[24px] bottom-[calc(24px_+_env(safe-area-inset-bottom,_0px))] z-[50] grid [place-items:center] w-[46px] h-[46px] [border:1px_solid_#ffffff50] rounded-[50%] [background:var(--ink)] [color:#fff] [box-shadow:0_4px_18px_#0002] cursor-pointer [&:hover]:[background:#45483f] [&:focus-visible]:[outline:2px_solid_var(--ink)] [&:focus-visible]:[outline-offset:4px]"
      aria-label="Back to top"
      title="Back to top"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
        })
      }
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 20V4m-6 6 6-6 6 6" />
      </svg>
    </button>
  );
}
