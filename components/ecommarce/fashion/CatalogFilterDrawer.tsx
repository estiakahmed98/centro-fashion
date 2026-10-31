"use client";

import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { SlidersHorizontal, X } from "lucide-react";

export const CatalogFilterClose = Dialog.Close;

export function CatalogFilterDrawer({ children }: { children: ReactNode }) {
  return (
    <Dialog.Root>
      <div className="editorial-filter-toolbar">
        <Dialog.Trigger asChild>
          <button type="button" className="editorial-filter-trigger">
            <SlidersHorizontal size={16} aria-hidden="true" /> FILTER &amp; SORT
          </button>
        </Dialog.Trigger>
      </div>
      <Dialog.Portal>
        <Dialog.Overlay className="editorial-filter-overlay" />
        <Dialog.Content className="editorial-filter-panel">
          <div className="editorial-filter-heading">
            <div>
              <Dialog.Title>Filter &amp; sort</Dialog.Title>
              <Dialog.Description>
                Find your everyday refinement.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="editorial-filter-close"
                aria-label="Close filters"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>
          <div className="editorial-filter-scroll">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
