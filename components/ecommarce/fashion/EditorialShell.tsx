"use client";

import { useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { EditorialHeader, type MenuProduct } from "./EditorialHeader";
import { EditorialFooter } from "./EditorialFooter";
import "./editorial.css";

const EditorialBag = dynamic(() => import("./EditorialBag").then(module => module.EditorialBag), { ssr: false });

export function EditorialShell({ children, highlights = [], socials = [], fontClassName = "" }: { children: ReactNode; highlights?: MenuProduct[]; socials?: Array<{ name: string; href: string }>; fontClassName?: string }) {
  const [bagOpen, setBagOpen] = useState(false);
  return <div className={`editorial-store ${fontClassName}`}>
    <a href="#store-content" className="editorial-skip">Skip to content</a>
    <EditorialHeader highlights={highlights} onOpenBag={() => setBagOpen(true)} />
    <div id="store-content">{children}</div>
    {bagOpen ? <EditorialBag open onClose={() => setBagOpen(false)} /> : null}
    <EditorialFooter socials={socials} />
  </div>;
}
