import Link from "next/link";
export default function NotFound() {
  return (
    <div className="notfound text-center p-[130px_20px_160px] [&_h1]:[font-family:var(--serif)] [&_h1]:[font-weight:var(--font-weight-normal,_400)] [&_h1]:[font-size:54px] [&_p]:[color:var(--muted)] [&_p]:mb-[30px]">
      <span className="eyebrow block [font-size:10px] tracking-[0.24em] [font-weight:var(--font-weight-bold,_700)] mb-[17px]">
        404 / PAGE NOT FOUND
      </span>
      <h1>Nothing here, yet.</h1>
      <p>The collection you are looking for may have moved.</p>
      <Link
        className="dark-button [background:#222321] [color:white] inline-flex items-center justify-center p-[16px_21px] [font-size:11px] [font-weight:var(--font-weight-bold,_700)] tracking-[0.09em] text-center [border:1px_solid_#222321] [transition:background_0.2s] [&:hover]:[background:#484b48]"
        href="/"
      >
        RETURN TO HOMEPAGE
      </Link>
    </div>
  );
}
