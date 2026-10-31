"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

function QuestionsSkeleton() {
  return <div role="status" aria-label="Loading questions and answers" className="space-y-4"><div className="skeleton-block h-6 w-56" /><div className="skeleton-block h-56" /></div>;
}

const ProductQuestions = dynamic(() => import("./ProductQuestions"), { loading: QuestionsSkeleton, ssr: false });

export default function DeferredProductQuestions({ productId }: { productId: number }) {
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: "500px" });
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={container} className="min-h-72">{visible ? <ProductQuestions key={productId} productId={productId} /> : <QuestionsSkeleton />}</div>;
}
