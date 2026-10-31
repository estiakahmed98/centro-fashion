import type { NextAuthOptions } from "next-auth";

// NextAuth v4 derives its origin and cookie names from NEXTAUTH_URL. Keep
// those names consistent with getServerSession while securing HTTPS requests.
export function getAuthRequestOptions(
  request: Request,
  options: NextAuthOptions,
  env: NodeJS.ProcessEnv = process.env,
): NextAuthOptions {
  const canonical = new URL(env.NEXTAUTH_URL || "http://localhost:3000");
  const requestUrl = new URL(request.url);
  const host = request.headers.get("host") || requestUrl.host;
  // Do not trust arbitrary X-Forwarded-Host values. Cloudflared preserves Host.
  const originUrl = new URL(`${requestUrl.protocol}//${host}`);
  if (originUrl.host !== host || originUrl.username || originUrl.password) {
    throw new Error("Untrusted authentication host");
  }
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(originUrl.hostname);
  const quickTunnel = /^[a-z0-9-]+\.trycloudflare\.com$/.test(originUrl.hostname);
  const development = env.NODE_ENV === "development";
  if (originUrl.host === canonical.host) {
    originUrl.protocol = canonical.protocol;
  } else if (development && quickTunnel && !originUrl.port) {
    originUrl.protocol = "https:";
  } else if (!(development && local)) {
    throw new Error("Untrusted authentication host");
  }
  const origin = originUrl.origin;
  const secure = originUrl.protocol === "https:";
  const canonicalSecure = options.useSecureCookies ?? canonical.protocol === "https:";
  const prefix = canonicalSecure ? "__Secure-" : "";
  const cookieOptions = { httpOnly: true, sameSite: "lax" as const, path: "/", secure };

  return {
    ...options,
    cookies: {
      ...options.cookies,
      sessionToken: {
        name: `${prefix}next-auth.session-token`,
        options: cookieOptions,
      },
      csrfToken: {
        name: `${canonicalSecure ? "__Host-" : ""}next-auth.csrf-token`,
        options: cookieOptions,
      },
      callbackUrl: {
        name: `${prefix}next-auth.callback-url`,
        options: cookieOptions,
      },
    },
    callbacks: {
      ...options.callbacks,
      async redirect({ url }) {
        // Relative and same-origin destinations only; no open redirects.
        try {
          const target = new URL(url, origin);
          if (target.origin === origin) return target.href;
        } catch { /* Fall back to this validated origin. */ }
        return origin;
      },
    },
  };
}
