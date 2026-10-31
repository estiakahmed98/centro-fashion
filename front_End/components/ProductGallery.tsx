"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icons";

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = selected !== null;

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus();
    };
  }, [open]);

  function move(direction: number) {
    setSelected((index) =>
      index === null
        ? null
        : (index + direction + images.length) % images.length,
    );
  }

  return (
    <>
      <div className="product-gallery grid grid-cols-[1fr_1fr] gap-[5px] [align-self:start] [&_img]:w-[100%] [&_img]:h-[100%] [&_img]:object-cover max-[800.01px]:gap-[3px] max-[520.01px]:grid-cols-[1fr_1fr] [&_.gallery-image-button_>_img]:w-[100%] [&_.gallery-image-button_>_img]:h-[auto] [&_.gallery-image-button_>_img]:block [&_.gallery-image-button_>_img]:[transform-origin:var(--zoom-x,_50%)_var(--zoom-y,_50%)] [&_.gallery-image-button_>_img]:[transition:transform_0.45s_ease] motion-reduce:[&_.gallery-image-button_>_img]:[transition:none]">
        {images.length ? (
          images.map((image, index) => (
            <button
              type="button"
              className={`gallery-image-button relative block w-[100%] min-w-[0] p-[0] overflow-hidden cursor-zoom-in [&:focus-visible_.gallery-zoom-icon]:opacity-[1] [&:focus-visible_.gallery-zoom-icon]:[transform:none] [@media(hover:_hover)]:[&:hover_>_img]:[transform:scale(1.3)] [@media(hover:_hover)]:[&:hover_.gallery-zoom-icon]:opacity-[1] [@media(hover:_hover)]:[&:hover_.gallery-zoom-icon]:[transform:none] ${index === 0 ? "product-gallery-primary col-span-2 [background:#e5e4e0]" : "product-gallery-secondary [background:#e5e4e0]"}`}
              key={image}
              aria-label={`Enlarge ${name}, image ${index + 1}`}
              aria-haspopup="dialog"
              onClick={() => setSelected(index)}
              onPointerMove={(event) => {
                if (event.pointerType !== "mouse") return;
                const bounds = event.currentTarget.getBoundingClientRect();
                event.currentTarget.style.setProperty(
                  "--zoom-x",
                  `${((event.clientX - bounds.left) / bounds.width) * 100}%`,
                );
                event.currentTarget.style.setProperty(
                  "--zoom-y",
                  `${((event.clientY - bounds.top) / bounds.height) * 100}%`,
                );
              }}
              onPointerLeave={(event) => {
                event.currentTarget.style.removeProperty("--zoom-x");
                event.currentTarget.style.removeProperty("--zoom-y");
              }}
            >
              <img
                src={image}
                alt={`${name}, view ${index + 1}`}
                loading={index === 0 ? "eager" : "lazy"}
              />
              <span
                className="gallery-zoom-icon absolute top-[15px] right-[15px] w-[38px] h-[38px] grid [place-items:center] [background:#ffffffed] [color:#33362e] rounded-[50%] opacity-[0] [transform:translateY(-4px)] [transition:opacity_0.2s,_transform_0.2s] [pointer-events:none] [@media(hover:_none)]:opacity-[1] [@media(hover:_none)]:[transform:none] [@media(hover:_none)]:w-[32px] [@media(hover:_none)]:h-[32px] [@media(hover:_none)]:top-[10px] [@media(hover:_none)]:right-[10px] motion-reduce:[transition:none]"
                aria-hidden="true"
              >
                <Icon name="zoom-in" size={20} />
              </span>
            </button>
          ))
        ) : (
          <div className="image-unavailable flex items-center justify-center min-h-[240px] h-[100%] [background:#eeeae4] [color:#83796a] [font-size:13px] tracking-[0.05em]">
            Product images coming soon
          </div>
        )}
      </div>
      <dialog
        ref={dialogRef}
        className="gallery-lightbox w-[min(1400px,_calc(100%_-_48px))] h-[calc(100dvh_-_48px)] max-w-[none] max-h-[none] p-[0] [border:0] [background:#fafaf7] [color:#272c24] overflow-hidden [box-shadow:0_16px_90px_#0004] [&::backdrop]:[background:#151914cc] [&::backdrop]:[backdrop-filter:blur(5px)] max-[700.01px]:w-[100%] max-[700.01px]:h-[100dvh] max-[700.01px]:m-[0]"
        aria-label={`${name} image gallery`}
        onCancel={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setSelected(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            move(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            move(-1);
          }
        }}
      >
        {selected !== null && (
          <div className="gallery-lightbox-content h-[100%] flex flex-col">
            <header className="gallery-lightbox-header flex items-center justify-between gap-[20px] p-[15px_25px] min-h-[64px] [&_>_span]:[font-size:11px] [&_>_span]:tracking-[0.025em] [&_>_span]:[color:#767c70] [&_button]:w-[38px] [&_button]:h-[38px] [&_button]:grid [&_button]:[place-items:center] [&_button]:[flex-shrink:0] max-[700.01px]:p-[12px_16px] max-[700.01px]:[&_>_span]:[font-size:10px] max-[700.01px]:[&_>_span]:leading-[1.6]">
              <span>{name}</span>
              <button
                type="button"
                aria-label="Close image gallery"
                onClick={() => setSelected(null)}
                autoFocus
              >
                <Icon name="close" size={24} />
              </button>
            </header>
            <div className="gallery-lightbox-stage relative flex items-center justify-center [flex:1] min-h-[0] m-[0_70px] [background:#f1f1eb] [&_>_button]:absolute [&_>_button]:top-[calc(50%_-_24px)] [&_>_button]:w-[46px] [&_>_button]:h-[46px] [&_>_button]:rounded-[50%] [&_>_button]:[background:#fff] [&_>_button]:[border:1px_solid_#e5e8de] [&_>_button]:grid [&_>_button]:[place-items:center] [&_>_button]:z-[1] [&_>_button:hover]:[background:#e5e8de] max-[700.01px]:m-[0_10px] max-[700.01px]:[&_>_button]:w-[38px] max-[700.01px]:[&_>_button]:h-[38px] max-[700.01px]:[&_>_button]:top-[calc(50%_-_19px)] max-[700.01px]:[&_>_button]:[background:#fffffff0]">
              {images.length > 1 && (
                <button
                  type="button"
                  className="gallery-lightbox-previous left-[-57px] max-[700.01px]:left-[6px]"
                  aria-label="Previous image"
                  onClick={() => move(-1)}
                >
                  <Icon name="arrow-left" size={25} />
                </button>
              )}
              <img
                className="gallery-lightbox-image w-[100%] h-[100%] min-h-[0] object-contain"
                src={images[selected]}
                alt={`${name}, view ${selected + 1} of ${images.length}`}
              />
              {images.length > 1 && (
                <button
                  type="button"
                  className="gallery-lightbox-next right-[-57px] max-[700.01px]:right-[6px]"
                  aria-label="Next image"
                  onClick={() => move(1)}
                >
                  <Icon name="arrow-right" size={25} />
                </button>
              )}
            </div>
            <div className="gallery-lightbox-bottom p-[12px_25px_16px] text-center [&_>_p]:[font-size:10px] [&_>_p]:tracking-[0.15em] [&_>_p]:[color:#8c9284] [&_>_p]:m-[0_0_10px] max-[700.01px]:p-[12px]">
              <p role="status" aria-live="polite">
                {selected + 1} / {images.length}
              </p>
              <div
                className="gallery-lightbox-thumbnails flex items-center gap-[7px] max-w-[100%] w-[max-content] [overflow-x:auto] m-[0_auto] p-[3px] [&_button]:w-[44px] [&_button]:h-[58px] [&_button]:p-[2px] [&_button]:[border:1px_solid_transparent] [&_button]:[flex-shrink:0] [&_button]:opacity-[0.5] [&_button[aria-pressed='true']]:[border-color:#626b55] [&_button[aria-pressed='true']]:opacity-[1] [&_button:hover]:opacity-[1] [&_img]:w-[100%] [&_img]:h-[100%] [&_img]:object-cover"
                aria-label="Choose a product image"
              >
                {images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    aria-label={`View image ${index + 1}`}
                    aria-pressed={selected === index}
                    onClick={() => setSelected(index)}
                  >
                    <img src={image} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
