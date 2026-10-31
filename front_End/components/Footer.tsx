"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Icon, type IconName } from "./Icons";
import { AccountDialog } from "./AccountDialog";

type FooterItem = { label: string; href?: string };
const columns: { title: string; links: FooterItem[] }[] = [
  {
    title: "CLOTHING",
    links: [
      { label: "Jackets", href: "/collections/jackets" },
      { label: "Suits", href: "/collections/suits" },
      { label: "Trousers", href: "/collections/trousers" },
      { label: "Classic Shirts", href: "/collections/shirts" },
      { label: "Casual Shirts", href: "/collections/shirts" },
      { label: "Outerwear", href: "/collections/jackets" },
      { label: "Tuxedo / Eveningwear", href: "/collections/suits" },
      { label: "Swimwear / Beach Towels", href: "/collections/summer" },
      { label: "Knitwear", href: "/collections/knitwear" },
      { label: "Waistcoats", href: "/collections/jackets" },
    ],
  },
  {
    title: "ACCESSORIES",
    links: [
      { label: "Shoes", href: "/collections/shoes" },
      ...[
        "Ties",
        "Pocket Squares",
        "Socks",
        "Leather goods",
        "Hats & Beanies",
        "Gloves",
        "Cufflinks",
        "Sunglasses",
        "Cozy at home",
      ].map((label) => ({ label, href: "/collections/accessories" })),
    ],
  },
  {
    title: "CUSTOMER SERVICE",
    links: [
      "Shipping & Returns",
      "Make a Return",
      "Exercise Your Right of Withdrawal",
      "Account",
      "WhatsApp",
      "Made to Measure",
      "F.A.Q.",
      "Contact Us",
    ].map((label) => ({ label })),
  },
  {
    title: "COMPANY",
    links: [
      { label: "About us", href: "/#our-story" },
      ...[
        "Blog",
        "Careers",
        "Wholesale / Franchising",
        "Terms & Conditions",
        "Privacy Policy",
      ].map((label) => ({ label })),
    ],
  },
];
const socials: { label: string; icon: IconName; href: string }[] = [
  { label: "Facebook", icon: "facebook", href: "https://www.facebook.com/" },
  { label: "Instagram", icon: "instagram", href: "https://www.instagram.com/" },
  { label: "YouTube", icon: "youtube", href: "https://www.youtube.com/" },
  { label: "TikTok", icon: "tiktok", href: "https://www.tiktok.com/" },
  { label: "X", icon: "x", href: "https://x.com/" },
  { label: "Pinterest", icon: "pinterest", href: "https://www.pinterest.com/" },
];
const payments = [
  "SSLCOMMERZ",
  "bKash",
  "Nagad",
  "EPS",
  "AMEX",
  "Apple Pay",
  "Google Pay",
  "Mastercard",
  "PayPal",
  "Shop Pay",
  "VISA",
];

const paymentStyles: Record<string, string> = {
  amex: "payment-amex [&]:[background:#0878c9] [&]:[color:white] [&]:[font-size:9px]",
  sslcommerz:
    "payment-sslcommerz [&]:[color:#245a9c] [&]:[font-size:9px] [&]:[letter-spacing:-.03em]",
  bkash: "payment-bkash [&]:[color:#d12053]",
  nagad: "payment-nagad [&]:[color:#ec522b]",
  eps: "payment-eps [&]:[color:#167c49] [&]:[letter-spacing:.04em]",
  visa: "payment-visa [&]:[background:#163cce] [&]:[color:#fff] [&]:[font-style:italic]",
  paypal: "payment-paypal [&]:[color:#174c8d]",
  "shop-pay": "payment-shop-pay [&]:[background:#6335ec] [&]:[color:#fff]",
  "google-pay": "payment-google-pay [&]:[font-weight:500]",
  mastercard:
    "payment-mastercard [&_i]:[border-radius:50%] [&_i]:[width:16px] [&_i]:[height:16px] [&_i]:[background:#e92930] [&_i_+_i]:[background:#f5a600] [&_i_+_i]:[margin-left:-6px] [&_i_+_i]:[opacity:0.9]",
};

export function Footer() {
  const [email, setEmail] = useState("");
  const [signed, setSigned] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [information, setInformation] = useState("");
  const [region, setRegion] = useState("BD");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [analytics, setAnalytics] = useState(false);
  useEffect(() => {
    if (information) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [information]);
  function openInformation(label: string) {
    if (label === "Account") {
      setAccountOpen(true);
      return;
    }
    if (label === "Consent choices") {
      try {
        setAnalytics(localStorage.getItem("aura-analytics-consent") === "true");
      } catch {
        setAnalytics(false);
      }
    }
    setInformation(label);
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSigned(true);
    setEmail("");
  }
  return (
    <footer className="site-footer [background:#f4f4f2] [&_.service-strip]:p-[80px_30px_55px] [&_.service-strip]:[border:0] [&_.service-strip_strong]:[font-size:10px] [&_.service-strip_strong]:tracking-[0.2em] [&_.service-strip_span]:[font-size:12px] [&_.service-strip_span]:[color:#94948c] max-[700.01px]:[&_.service-strip]:grid-cols-[1fr] max-[700.01px]:[&_.service-strip]:gap-[35px] max-[700.01px]:[&_.service-strip]:p-[50px_20px_35px] max-[700.01px]:[&_.service-strip_strong]:[font-size:9px] [&_.footer-expanded]:grid-cols-[minmax(0,_1fr)_minmax(320px,_430px)] [&_.footer-expanded]:gap-[10%] [&_.footer-expanded]:p-[38px_36px_95px] [&_.footer-legal]:grid [&_.footer-legal]:grid-cols-[1fr_auto_1.6fr] [&_.footer-legal]:gap-[20px] [&_.footer-legal]:[align-items:end] [&_.footer-legal]:[border:0] [&_.footer-legal]:p-[10px_36px_30px] max-[1200.01px]:[&_.footer-expanded]:grid-cols-[minmax(0,_1fr)_330px] max-[1200.01px]:[&_.footer-expanded]:gap-[5%] max-[1200.01px]:[&_.footer-expanded]:pl-[25px] max-[1200.01px]:[&_.footer-expanded]:pr-[25px] max-[950.01px]:[&_.footer-expanded]:grid-cols-[1fr] max-[950.01px]:[&_.footer-expanded]:gap-[60px] max-[950.01px]:[&_.footer-expanded]:pb-[55px] max-[950.01px]:[&_.footer-legal]:grid-cols-[1fr_auto] max-[550.01px]:[&_.footer-expanded]:p-[30px_22px_40px] max-[550.01px]:[&_.footer-legal]:p-[15px_22px_25px] max-[550.01px]:[&_.footer-legal]:gap-[12px]">
      <div
        className="service-strip grid grid-cols-[repeat(3,_1fr)] gap-[15px] p-[65px_25px] [border-top:1px_solid_#eee] [border-bottom:1px_solid_#e8e8e8] [&_>_div]:flex [&_>_div]:items-center [&_>_div]:flex-col [&_>_div]:text-center [&_>_div]:gap-[9px] [&_strong]:[font-size:11px] [&_strong]:tracking-[0.11em] [&_strong]:mt-[9px] [&_span]:[color:#8b8885] [&_span]:[font-size:12px] max-[800.01px]:p-[44px_18px] max-[800.01px]:gap-[15px] max-[800.01px]:[&_strong]:[font-size:9px] max-[800.01px]:[&_span]:[font-size:11px] max-[520.01px]:grid-cols-[1fr] max-[520.01px]:gap-[33px] max-[520.01px]:p-[48px_20px]"
        id="service"
      >
        <div>
          <strong>100% MADE IN ITALY QUALITY</strong>
          <span>All our garments are 100% made in Italy</span>
        </div>
        <div>
          <strong>WORLDWIDE DHL SHIPPING</strong>
          <span>Fast, reliable and secured shipping</span>
        </div>
        <div>
          <strong>FREE RETURNS & EXCHANGES</strong>
          <span>Within 30 days. 1 free return per order.</span>
        </div>
      </div>
      <div
        className="footer-watermark [font-family:var(--serif)] [font-size:clamp(80px,_16vw,_330px)] [font-weight:var(--font-weight-semibold,_600)] tracking-[-0.065em] [color:#deded9] leading-[1.1] text-center whitespace-nowrap p-[5px_18px_25px] overflow-hidden max-[700.01px]:[font-size:17vw] max-[700.01px]:p-[15px_12px]"
        aria-label="Aura BOED"
      >
        AURA BOED
      </div>
      <div className="footer-main grid grid-cols-[minmax(0,_1fr)_305px] gap-[8%] p-[70px_36px_90px] max-[1150.01px]:grid-cols-[1fr] max-[1150.01px]:gap-[50px] max-[800.01px]:p-[50px_22px_65px] footer-expanded [&_.footer-links]:grid-cols-[1fr_0.8fr_1.3fr_1fr] [&_.footer-links]:gap-[28px] [&_.footer-links_h3]:[font-size:10px] [&_.footer-links_h3]:[font-weight:var(--font-weight-medium,_500)] [&_.footer-links_h3]:tracking-[0.12em] [&_.footer-links_h3]:m-[0_0_25px] [&_.footer-signup_h3]:[font-size:10px] [&_.footer-signup_h3]:[font-weight:var(--font-weight-medium,_500)] [&_.footer-signup_h3]:tracking-[0.12em] [&_.footer-signup_h3]:m-[0_0_25px] [&_.footer-signup_h3]:mb-[47px] [&_.footer-links_a]:block [&_.footer-links_a]:p-[0] [&_.footer-links_a]:m-[0_0_8px] [&_.footer-links_a]:text-left [&_.footer-links_a]:[color:#90918b] [&_.footer-links_a]:[font-size:11px] [&_.footer-links_a]:[font-weight:var(--font-weight-normal,_400)] [&_.footer-links_a]:leading-[1.4] [&_.footer-links_button]:block [&_.footer-links_button]:p-[0] [&_.footer-links_button]:m-[0_0_8px] [&_.footer-links_button]:text-left [&_.footer-links_button]:[color:#90918b] [&_.footer-links_button]:[font-size:11px] [&_.footer-links_button]:[font-weight:var(--font-weight-normal,_400)] [&_.footer-links_button]:leading-[1.4] [&_.footer-links_a:hover]:[color:#262821] [&_.footer-links_a:hover]:[text-decoration:underline] [&_.footer-links_a:hover]:[text-underline-offset:3px] [&_.footer-links_button:hover]:[color:#262821] [&_.footer-links_button:hover]:[text-decoration:underline] [&_.footer-links_button:hover]:[text-underline-offset:3px] [&_.footer-signup]:max-w-[none] [&_.footer-signup]:text-center [&_.footer-signup_h4]:[font-size:17px] [&_.footer-signup_h4]:[font-weight:var(--font-weight-normal,_400)] [&_.footer-signup_h4]:m-[0_0_15px] [&_.footer-signup_p]:[color:#45473e] [&_.footer-signup_p]:[font-size:15px] [&_.footer-signup_p]:leading-[1.7] [&_.footer-signup_.newsletter-intro]:m-[0_0_20px] [&_.footer-signup_form]:flex [&_.footer-signup_form]:items-stretch [&_.footer-signup_form]:[border:0] [&_.footer-signup_form]:gap-[15px] [&_.footer-signup_form]:m-[0_0_13px] [&_.footer-signup_input]:[background:#fff] [&_.footer-signup_input]:[border:1px_solid_#aaa] [&_.footer-signup_input]:rounded-[3px] [&_.footer-signup_input]:p-[16px] [&_.footer-signup_input]:h-[54px] [&_.footer-signup_input]:[font-size:13px] [&_.footer-signup_form_button]:[background:#151613] [&_.footer-signup_form_button]:[color:#fff] [&_.footer-signup_form_button]:[font-size:11px] [&_.footer-signup_form_button]:p-[0_15px] [&_.footer-signup_form_button:hover]:[background:#41453b] [&_.newsletter-consent]:m-[0] [&_.footer-signup_.newsletter-privacy]:text-left [&_.footer-signup_.newsletter-privacy]:[font-size:10px] [&_.footer-signup_.newsletter-privacy]:leading-[1.5] [&_.footer-signup_.newsletter-privacy]:[font-weight:var(--font-weight-medium,_500)] [&_.footer-signup_.newsletter-privacy]:m-[38px_0_0] [&_.footer-signup_.newsletter-privacy]:[color:#33372d] max-[1200.01px]:[&_.footer-links]:gap-[15px] max-[1200.01px]:[&_.footer-links_a]:[font-size:10px] max-[1200.01px]:[&_.footer-links_button]:[font-size:10px] max-[950.01px]:[&_.footer-signup]:max-w-[500px] max-[950.01px]:[&_.footer-signup]:[justify-self:center] max-[950.01px]:[&_.footer-signup_h3]:mb-[30px] max-[550.01px]:[&_.footer-links]:grid-cols-[1fr_1fr] max-[550.01px]:[&_.footer-links]:gap-[28px_20px] max-[550.01px]:[&_.footer-links_h3]:[font-size:9px] max-[550.01px]:[&_.footer-links_h3]:mb-[18px] max-[550.01px]:[&_.footer-links_a]:[font-size:11px] max-[550.01px]:[&_.footer-links_a]:mb-[10px] max-[550.01px]:[&_.footer-links_button]:[font-size:11px] max-[550.01px]:[&_.footer-links_button]:mb-[10px] max-[550.01px]:[&_.footer-signup_h3]:[font-size:10px] max-[550.01px]:[&_.footer-signup_p]:[font-size:13px] max-[550.01px]:[&_.footer-signup_form]:gap-[9px] max-[550.01px]:[&_.footer-signup_form_button]:[font-size:10px] max-[550.01px]:[&_.footer-signup_form_button]:p-[0_10px] max-[550.01px]:[&_.footer-signup_.newsletter-privacy]:mt-[25px]">
        <nav
          className="footer-links grid grid-cols-[repeat(4,_minmax(0,_1fr))] gap-[22px] [&_h3]:[font-size:11px] [&_h3]:tracking-[0.14em] [&_h3]:mb-[24px] [&_a]:block [&_a]:mb-[13px] [&_a]:[color:#75726e] [&_a]:[font-size:12px] [&_a:hover]:[text-decoration:underline] max-[800.01px]:grid-cols-[repeat(2,_1fr)] max-[800.01px]:[row-gap:28px] max-[520.01px]:gap-[15px] max-[520.01px]:[&_h3]:[font-size:10px] max-[520.01px]:[&_a]:[font-size:11px]"
          aria-label="Footer navigation"
        >
          {columns.map((column) => (
            <div key={column.title}>
              <h3>{column.title}</h3>
              {column.links.map((item) =>
                item.href ? (
                  <Link key={item.label} href={item.href}>
                    {item.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    key={item.label}
                    onClick={() => openInformation(item.label)}
                  >
                    {item.label}
                  </button>
                ),
              )}
            </div>
          ))}
        </nav>
        <section
          className="footer-signup [&_h3]:[font-size:11px] [&_h3]:tracking-[0.14em] [&_h3]:mb-[24px] [&_p]:[font-size:12px] [&_p]:leading-[1.8] [&_p]:[color:#777] [&_form]:[border-bottom:1px_solid_#747474] [&_form]:flex [&_form]:items-center [&_form]:mt-[27px] [&_input]:[flex:1] [&_input]:min-w-[0] [&_input]:[border:0] [&_input]:[outline:0] [&_input]:p-[13px_0] [&_input]:[color:#333] [&_form_button]:p-[7px] max-[1150.01px]:max-w-[420px] max-[520.01px]:[&_h3]:[font-size:10px]"
          aria-labelledby="footer-newsletter-title"
        >
          <h3>STAY INFORMED WITH AURA BOED</h3>
          <h4 id="footer-newsletter-title">Newsletter</h4>
          <p className="newsletter-intro">
            Join our newsletter to be the first informed about new arrivals,
            restocks, promotions and more.
          </p>
          {signed ? (
            <p className="signup-success [color:#3b6b44]!" role="status">
              Thank you! This is a newsletter preview. Your email has not been
              saved or sent.
            </p>
          ) : (
            <form onSubmit={submit}>
              <input
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                placeholder="Email"
                aria-label="Newsletter email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button type="submit">SUBSCRIBE</button>
            </form>
          )}
          <p className="newsletter-consent [&_button]:p-[0] [&_button]:[text-decoration:underline] [&_button]:[text-underline-offset:3px]">
            By signing up, you agree to receive our emails (new arrivals,
            personalised selections, offers). You can unsubscribe at any time.
            See our{" "}
            <button
              type="button"
              onClick={() => openInformation("Privacy Policy")}
            >
              privacy policy
            </button>
            .
          </p>
          <p className="newsletter-privacy">
            We respect your privacy. This newsletter is a design preview; your
            email stays in this form until submission and is then cleared. No
            email is stored or sent.
          </p>
        </section>
      </div>
      <div className="footer-utility flex justify-between items-start p-[25px_36px_34px] gap-[35px] max-[550.01px]:flex-col max-[550.01px]:items-stretch max-[550.01px]:gap-[35px] max-[550.01px]:p-[20px_22px_25px]">
        <div
          className="footer-socials flex gap-[16px] items-center [&_a]:flex [&_a]:items-center [&_a]:justify-center [&_a]:min-h-[25px] [&_a:hover]:opacity-[0.55] max-[550.01px]:justify-center max-[550.01px]:gap-[23px]"
          aria-label="Social media"
        >
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              aria-label={social.label}
              title={social.label}
              target="_blank"
              rel="noreferrer"
            >
              <Icon name={social.icon} size={18} />
            </a>
          ))}
        </div>
        <div className="footer-region flex items-center gap-[7px] [flex-wrap:wrap] justify-end w-[350px] [border-bottom:1px_solid_#5e6158] p-[0_0_7px] [color:#8a8e83] [&_label]:[font-size:11px] [&_select]:[color:#747b6c] [&_select]:[background:transparent] [&_select]:[border:0] [&_select]:[flex:1] [&_select]:min-w-[0] [&_select]:[font-size:11px] [&_select]:p-[3px_0] [&_small]:w-[100%] [&_small]:[font-size:9px] [&_small]:text-right max-[550.01px]:w-[100%]">
          <label htmlFor="footer-region">Delivery in</label>
          <select
            id="footer-region"
            value={region}
            onChange={(event) => setRegion(event.target.value)}
          >
            <option value="BD">Bangladesh (BDT)</option>
            <option value="EU">Europe (EUR)</option>
            <option value="GB">United Kingdom (GBP)</option>
            <option value="US">United States (USD)</option>
          </select>
          {region !== "BD" && (
            <small>Region preview. Product prices remain in BDT.</small>
          )}
        </div>
      </div>
      <div className="footer-bottom p-[18px_34px] [border-top:1px_solid_#eee] flex justify-between items-center gap-[20px] [font-size:11px] [color:#777] max-[800.01px]:p-[18px_22px] max-[800.01px]:[flex-wrap:wrap] max-[520.01px]:[&_span:last-child]:hidden footer-legal [&_>_span]:[font-size:12px] [&_>_span]:[color:#8b8e85] [&_>_span]:pb-[9px] max-[550.01px]:[&_>_span]:[font-size:10px] [&_.payment-mark:last-child]:inline-flex">
        <span>&copy; {new Date().getFullYear()} - Aura BOED</span>
        <button
          type="button"
          className="footer-consent-button p-[0_0_9px] [font-size:11px] [color:#30362b] [&:hover]:[text-decoration:underline] max-[550.01px]:[font-size:10px]"
          onClick={() => openInformation("Consent choices")}
        >
          Consent choices
        </button>
        <div className="footer-payments [justify-self:center] text-center [&_>_span]:[color:#93988c] [&_>_span]:[font-size:11px] [&_>_div]:flex [&_>_div]:[flex-wrap:wrap] [&_>_div]:justify-center [&_>_div]:items-center [&_>_div]:gap-[7px] [&_>_div]:m-[5px_0] [&_>_small]:[font-size:8px] [&_>_small]:[color:#8d9285] max-[950.01px]:[grid-column:1_/_-1] max-[950.01px]:[grid-row:1] max-[950.01px]:mb-[16px] max-[550.01px]:[&_>_div]:gap-[5px]">
          <span>Payment methods</span>
          <div aria-label="Payment method design preview">
            {payments.map((payment) => (
              <span
                key={payment}
                className={`payment-mark [background:#fff] [border:1px_solid_#dededb] rounded-[2px] h-[24px] min-w-[39px] p-[3px_5px] inline-flex items-center justify-center [font-size:10px] [font-family:Arial,_sans-serif] [font-weight:var(--font-weight-bold,_700)] [color:#161719] max-[550.01px]:min-w-[35px] max-[550.01px]:[font-size:9px] max-[550.01px]:p-[3px] ${paymentStyles[payment.toLowerCase().replaceAll(" ", "-")] || ""}`}
              >
                {payment === "Mastercard" ? (
                  <>
                    <i />
                    <i />
                    <span className="footer-sr-only absolute w-[1px] h-[1px] p-[0] overflow-hidden [clip:rect(0,_0,_0,_0)] whitespace-nowrap [border:0]">
                      Mastercard
                    </span>
                  </>
                ) : (
                  payment
                )}
              </span>
            ))}
          </div>
          <small>Checkout integration coming soon</small>
        </div>
      </div>
      {accountOpen && <AccountDialog onClose={() => setAccountOpen(false)} />}
      <dialog
        ref={dialogRef}
        className="footer-info-dialog max-w-[calc(100%_-_32px)] w-[510px] [border:1px_solid_#e2e4dd] p-[40px] [color:#343b2d] [background:#fafbf7] [&::backdrop]:[background:#151b1670] [&::backdrop]:[backdrop-filter:blur(3px)] [&_h2]:[font-family:var(--serif)] [&_h2]:[font-size:36px] [&_h2]:[font-weight:var(--font-weight-normal,_400)] [&_h2]:m-[18px_0] [&_p]:[font-size:13px] [&_p]:[color:#7e8477] [&_p]:leading-[1.8] [&_.dark-button]:mt-[20px]"
        aria-labelledby="footer-info-title"
        onCancel={() => setInformation("")}
        onClick={(event) => {
          if (event.target === event.currentTarget) setInformation("");
        }}
      >
        <button
          className="footer-info-close absolute right-[12px] top-[12px] p-[5px]"
          type="button"
          aria-label="Close information"
          onClick={() => setInformation("")}
        >
          <Icon name="close" />
        </button>
        <span className="eyebrow block [font-size:10px] tracking-[0.24em] [font-weight:var(--font-weight-bold,_700)] mb-[17px]">
          AURA BOED
        </span>
        <h2 id="footer-info-title">{information}</h2>
        {information === "Consent choices" ? (
          <>
            <p>
              Manage your preferences on this browser. Your cart and saved items
              use local storage. No analytics service is connected.
            </p>
            <label className="footer-consent-option flex items-center gap-[10px] p-[15px_0] [font-size:12px] [border-top:1px_solid_#e1e5db] [&_span]:ml-[auto] [&_span]:[font-size:10px] [&_span]:[color:#89927f]">
              <input type="checkbox" checked disabled />
              Essential storage <span>Always active</span>
            </label>
            <label className="footer-consent-option flex items-center gap-[10px] p-[15px_0] [font-size:12px] [border-top:1px_solid_#e1e5db] [&_span]:ml-[auto] [&_span]:[font-size:10px] [&_span]:[color:#89927f]">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(event) => setAnalytics(event.target.checked)}
              />
              Optional analytics
            </label>
            <button
              className="dark-button [background:#222321] [color:white] inline-flex items-center justify-center p-[16px_21px] [font-size:11px] [font-weight:var(--font-weight-bold,_700)] tracking-[0.09em] text-center [border:1px_solid_#222321] [transition:background_0.2s] [&:hover]:[background:#484b48]"
              type="button"
              onClick={() => {
                try {
                  localStorage.setItem(
                    "aura-analytics-consent",
                    String(analytics),
                  );
                } catch {
                  /* Consent persistence is optional when storage is unavailable. */
                }
                setInformation("");
              }}
            >
              SAVE PREFERENCES
            </button>
          </>
        ) : information === "Privacy Policy" ? (
          <p>
            This is a storefront preview. Newsletter emails are not stored or
            sent. Cart and saved items are stored locally on your browser. The
            full privacy policy will be available before the store launches.
          </p>
        ) : (
          <p>
            This service is coming soon. Details will be available when the
            store launches.
          </p>
        )}
      </dialog>
    </footer>
  );
}
