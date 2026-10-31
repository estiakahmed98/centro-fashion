"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "./StoreProvider";
import { Icon } from "./Icons";

type AccountMode = "login" | "signup" | "reset";

export function AccountDialog({ onClose }: { onClose: () => void }) {
  const { catalogue } = useStore();
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<AccountMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  function changeMode(next: AccountMode) {
    setMode(next);
    setShowPassword(false);
    setMessage("");
    setError("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "login") {
      onClose();
      router.push("/admin");
      return;
    }
    const form = event.currentTarget;
    const data = new FormData(form);
    setMessage("");
    setError("");
    if (mode === "signup" && !String(data.get("name") || "").trim()) {
      setError("Please enter your name.");
      return;
    }
    if (
      mode === "signup" &&
      data.get("password") !== data.get("confirmPassword")
    ) {
      setError("Your passwords do not match. Please try again.");
      return;
    }
    setMessage(
      mode === "reset"
        ? "Password reset preview complete. No email was sent; account services are not connected yet."
        : mode === "signup"
          ? "Sign-up preview complete. No account was created or details saved; account services are not connected yet."
          : "Login preview complete. No sign-in was performed or details saved; account services are not connected yet.",
    );
    form.reset();
    setShowPassword(false);
  }

  return (
    <dialog
      className="auth-dialog [border:0] p-[0] w-[min(920px,_calc(100%_-_40px))] max-h-[calc(100dvh_-_40px)] [color:var(--ink)] [background:#fff] [box-shadow:0_20px_100px_#0003] overflow-auto [&::backdrop]:[background:#15171380] [&::backdrop]:[backdrop-filter:blur(4px)] max-[700.01px]:w-[min(470px,_calc(100%_-_24px))] max-[700.01px]:max-h-[calc(100dvh_-_24px)]"
      ref={dialogRef}
      aria-labelledby="account-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="auth-layout grid grid-cols-[0.85fr_1.15fr] min-h-[640px] max-[700.01px]:grid-cols-[1fr] max-[700.01px]:min-h-[0]">
        <aside className="auth-editorial relative isolate overflow-hidden [background:#b8aa97] min-h-[100%] [&_>_img]:absolute [&_>_img]:w-[100%] [&_>_img]:h-[100%] [&_>_img]:object-cover [&_>_img]:object-[50%_40%] [&_>_img]:z-[-2] [&:after]:[content:''] [&:after]:absolute [&:after]:inset-[0] [&:after]:[background:linear-gradient(180deg,_#26231e30,_transparent_30%,_#26231ebd)] [&:after]:z-[-1] max-[700.01px]:hidden">
          <img src={catalogue.collectionImages.suits || undefined} alt="" />
          <div className="auth-editorial-top p-[30px] [font-family:var(--serif)] [font-size:32px] [color:white] leading-[1.15] [&_>_span]:block [&_>_span]:mt-[10px] [&_>_span]:[font-family:var(--sans)] [&_>_span]:[font-size:8px] [&_>_span]:tracking-[0.23em]">
            Aura BOED<span>THE ART OF DRESSING WELL</span>
          </div>
          <div className="auth-editorial-copy absolute bottom-[38px] left-[30px] right-[25px] [color:#fff] [&_.eyebrow]:[font-size:9px] [&_.eyebrow]:tracking-[0.18em] [&_h2]:[font-family:var(--serif)] [&_h2]:[font-weight:var(--font-weight-normal,_400)] [&_h2]:[font-size:49px] [&_h2]:leading-[1.04] [&_h2]:m-[18px_0] [&_p]:[font-size:12px] [&_p]:leading-[1.9] [&_p]:[color:#f1ede7] [&_p]:m-[0]">
            <span className="eyebrow block [font-size:10px] tracking-[0.24em] [font-weight:var(--font-weight-bold,_700)] mb-[17px]">
              YOUR STYLE, YOUR WORLD
            </span>
            <h2>
              A little more
              <br />
              <em>distinctly you.</em>
            </h2>
            <p>
              Considered pieces. Lasting impressions.
              <br />
              Discover your next everyday favourite.
            </p>
          </div>
        </aside>
        <section className="auth-content relative p-[52px_48px_30px] [&_>_.eyebrow]:[font-size:9px] [&_>_.eyebrow]:tracking-[0.17em] [&_>_.eyebrow]:[color:var(--muted)] [&_>_h2]:[font-family:var(--serif)] [&_>_h2]:[font-size:40px] [&_>_h2]:[font-weight:var(--font-weight-normal,_400)] [&_>_h2]:leading-[1.1] [&_>_h2]:m-[15px_0_10px] max-[700.01px]:p-[45px_28px_28px] max-[700.01px]:[&_>_h2]:[font-size:37px] max-[360.01px]:pl-[20px] max-[360.01px]:pr-[20px]">
          <button
            type="button"
            className="auth-close absolute top-[16px] right-[16px] grid [place-items:center] w-[32px] h-[32px]"
            onClick={onClose}
            aria-label="Close account dialog"
          >
            <Icon name="close" size={22} />
          </button>
          <span className="eyebrow block [font-size:10px] tracking-[0.24em] [font-weight:var(--font-weight-bold,_700)] mb-[17px]">
            THE AURA BOED ACCOUNT
          </span>
          <h2 id="account-title">
            {mode === "signup"
              ? "Make yourself at home."
              : mode === "reset"
                ? "A fresh start."
                : "Welcome back."}
          </h2>
          <p className="auth-intro [font-size:12px] leading-[1.7] [color:var(--muted)] mb-[25px]">
            {mode === "signup"
              ? "Create your account and make Aura BOED your own."
              : mode === "reset"
                ? "Enter your email to reset your password."
                : "Your next favourite piece is waiting. Come on in."}
          </p>
          {mode !== "reset" && (
            <div
              className="auth-switch flex [border-bottom:1px_solid_var(--line)] mb-[25px] [&_>_button]:w-[50%] [&_>_button]:p-[12px] [&_>_button]:[font-size:12px] [&_>_button]:[color:var(--muted)] [&_>_button]:[border-bottom:2px_solid_transparent] [&_>_button]:mb-[-1px] [&_>_button[aria-pressed='true']]:[color:var(--ink)] [&_>_button[aria-pressed='true']]:[border-bottom-color:var(--ink)] max-[700.01px]:mb-[22px]"
              role="group"
              aria-label="Account options"
            >
              <button
                type="button"
                aria-pressed={mode === "login"}
                onClick={() => changeMode("login")}
              >
                Log in
              </button>
              <button
                type="button"
                aria-pressed={mode === "signup"}
                onClick={() => changeMode("signup")}
              >
                Sign up
              </button>
            </div>
          )}
          <form
            className="auth-form flex flex-col gap-[17px] [&_>_label]:flex [&_>_label]:flex-col [&_>_label]:gap-[9px] [&_>_label]:[font-size:11px] [&_>_label]:[font-weight:var(--font-weight-medium,_500)] [&_input]:[border:1px_solid_#dcd9d3] [&_input]:rounded-[0] [&_input]:[background:#fff] [&_input]:p-[13px_14px] [&_input]:w-[100%] [&_input]:min-w-[0] [&_input]:h-[45px] [&_input]:[font-size:13px] [&_input]:[color:var(--ink)] [&_input::placeholder]:[color:#97938d] [&_input::placeholder]:[font-size:12px] max-[700.01px]:[&_input]:[font-size:16px] max-[700.01px]:gap-[15px]"
            key={mode}
            noValidate={mode === "login"}
            onSubmit={submit}
            onChange={() => {
              setError("");
              setMessage("");
            }}
          >
            {mode === "signup" && (
              <label htmlFor="account-name">
                Full name
                <input
                  id="account-name"
                  name="name"
                  autoComplete="name"
                  placeholder="Your full name"
                  required
                  maxLength={100}
                />
              </label>
            )}
            <label htmlFor="account-email">
              Email address
              <input
                id="account-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                maxLength={254}
              />
            </label>
            {mode !== "reset" && (
              <label htmlFor="account-password">
                <span id="account-password-label">Password</span>
                <span className="auth-password flex relative [&_input]:pr-[65px] [&_button]:absolute [&_button]:right-[0] [&_button]:top-[0] [&_button]:h-[100%] [&_button]:p-[0_14px] [&_button]:[font-size:10px] [&_button]:[text-decoration:underline] [&_button]:[text-underline-offset:3px]">
                  <input
                    id="account-password"
                    aria-labelledby="account-password-label"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                    placeholder={
                      mode === "signup"
                        ? "At least 8 characters"
                        : "Enter your password"
                    }
                    minLength={mode === "signup" ? 8 : undefined}
                    required
                  />
                  <button
                    type="button"
                    aria-controls="account-password"
                    aria-pressed={showPassword}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((shown) => !shown)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </span>
              </label>
            )}
            {mode === "signup" && (
              <label htmlFor="account-confirm-password">
                Confirm password
                <input
                  id="account-confirm-password"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  required
                  minLength={8}
                />
              </label>
            )}
            {mode === "login" && (
              <button
                className="auth-forgot [align-self:flex-end] [font-size:11px] [text-decoration:underline] [text-underline-offset:3px] mt-[-5px] p-[3px_0]"
                type="button"
                onClick={() => changeMode("reset")}
              >
                Forgot password?
              </button>
            )}
            {error && (
              <p
                className="auth-error [font-size:12px] leading-[1.7] p-[12px] m-[0] [background:#faf0ed] [color:#9e3430]"
                role="alert"
              >
                {error}
              </p>
            )}
            {message && (
              <p
                className="auth-status [font-size:12px] leading-[1.7] p-[12px] m-[0] [background:#f0f3ed] [color:#42633e]"
                role="status"
              >
                {message}
              </p>
            )}
            <button
              className="dark-button [background:#222321] [color:white] inline-flex items-center justify-center p-[16px_21px] [font-size:11px] [font-weight:var(--font-weight-bold,_700)] tracking-[0.09em] text-center [border:1px_solid_#222321] [transition:background_0.2s] [&:hover]:[background:#484b48] auth-submit w-[100%] flex justify-between items-center mt-[4px] min-h-[48px]"
              type="submit"
            >
              {mode === "signup"
                ? "CREATE ACCOUNT"
                : mode === "reset"
                  ? "SEND RESET LINK"
                  : "LOG IN"}
              <Icon name="arrow-right" size={18} />
            </button>
          </form>
          <Link
            className="admin-entry flex gap-[12px] items-center justify-center m-[22px_0] [font-size:12px] [text-decoration:underline]"
            href="/admin"
            onClick={onClose}
          >
            Demo admin login <Icon name="arrow-right" size={16} />
          </Link>
          <p className="auth-other text-center [font-size:11px] [color:var(--muted)] m-[22px_0] [&_button]:[text-decoration:underline] [&_button]:[text-underline-offset:3px] [&_button]:[font-weight:var(--font-weight-medium,_500)] [&_button]:[color:var(--ink)] [&_button]:p-[3px]">
            {mode === "signup"
              ? "Already part of Aura BOED?"
              : mode === "reset"
                ? "Remember your password?"
                : "New to Aura BOED?"}{" "}
            <button
              type="button"
              onClick={() => changeMode(mode === "login" ? "signup" : "login")}
            >
              {mode === "login" ? "Create an account" : "Log in"}
            </button>
          </p>
          <p className="auth-demo flex gap-[8px] [border-top:1px_solid_var(--line)] pt-[18px] m-[0] [color:var(--muted)] [font-size:10px] leading-[1.7] [&_svg]:[flex-shrink:0] [&_svg]:mt-[2px]">
            <Icon name="shield" size={15} />
            <span>
              Design preview · Details stay in this form and are never saved or
              sent. Account services coming soon.
            </span>
          </p>
        </section>
      </div>
    </dialog>
  );
}
