import type { SVGProps } from 'react';

export type IconName = 'search' | 'bookmark' | 'bag' | 'user' | 'menu' | 'close' | 'arrow-right' | 'arrow-left' | 'chevron-down' | 'sliders' | 'grid-four' | 'grid-two' | 'grid-one' | 'plus' | 'minus' | 'check' | 'instagram' | 'facebook' | 'truck' | 'shield' | 'rotate' | 'map-pin' | 'youtube' | 'tiktok' | 'x' | 'pinterest' | 'zoom-in';

export function Icon({ name, size = 19, strokeWidth = 1.5, ...rest }: { name: IconName; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  let content;
  switch (name) {
    case 'zoom-in': content = <><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6M7 10h6M10 7v6"/></>; break;
    case 'search': content = <><circle cx="11" cy="11" r="7"/><path d="m16.4 16.4 4.1 4.1"/></>; break;
    case 'bookmark': content = <path d="M6 3.5h12v17l-6-4-6 4z"/>; break;
    case 'bag': content = <><path d="M4 8h16l-1 13H5L4 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></>; break;
    case 'user': content = <><circle cx="12" cy="8" r="4"/><path d="M4.5 21c.6-4.3 3.1-6.5 7.5-6.5s6.9 2.2 7.5 6.5"/></>; break;
    case 'menu': content = <><path d="M3 6h18M3 12h18M3 18h18"/></>; break;
    case 'close': content = <path d="M5 5l14 14M19 5 5 19"/>; break;
    case 'arrow-right': content = <><path d="M4 12h16M14 6l6 6-6 6"/></>; break;
    case 'arrow-left': content = <><path d="M20 12H4m6-6-6 6 6 6"/></>; break;
    case 'chevron-down': content = <path d="m6 9 6 6 6-6"/>; break;
    case 'sliders': content = <><path d="M3 7h18M3 17h18"/><circle cx="9" cy="7" r="2" fill="white"/><circle cx="16" cy="17" r="2" fill="white"/></>; break;
    case 'grid-four': content = <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>; break;
    case 'grid-two': content = <><rect x="4" y="3" width="7" height="18"/><rect x="13" y="3" width="7" height="18"/></>; break;
    case 'grid-one': content = <rect x="4" y="3" width="16" height="18"/>; break;
    case 'plus': content = <path d="M12 4v16M4 12h16"/>; break;
    case 'minus': content = <path d="M4 12h16"/>; break;
    case 'check': content = <path d="m4 12 5 5L20 6"/>; break;
    case 'instagram': content = <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" stroke="none"/></>; break;
    case 'facebook': content = <path d="M17 3h-3a5 5 0 0 0-5 5v3H6v4h3v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1h3V3Z"/>; break;
    case 'youtube': content = <><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 6 3-6 3z" fill="currentColor"/></>; break;
    case 'tiktok': content = <><path d="M14 3v12a4 4 0 1 1-4-4M14 3c1 4 3 5 6 5M14 3h3"/></>; break;
    case 'x': content = <><path d="M4 3h4l12 18h-4zM20 3 4 21"/></>; break;
    case 'pinterest': content = <><circle cx="12" cy="10" r="8"/><path d="m8 22 4-15M11 13c4 5 8-5 3-6-3-1-5 2-4 5"/></>; break;
    case 'truck': content = <><path d="M2 6h12v11H2zM14 10h4l4 4v3h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>; break;
    case 'shield': content = <><path d="m12 2 8 4v6c0 5-3.4 8-8 10-4.6-2-8-5-8-10V6z"/><path d="m8 12 3 3 5-6"/></>; break;
    case 'rotate': content = <><path d="M4 8a8 8 0 1 1-1 6"/><path d="M4 3v5h5"/></>; break;
    case 'map-pin': content = <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>; break;
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...common} {...rest}>{content}</svg>;
}
