# AURA BOED authentication tunnel fix

Audit and verification date: October 29, 2026.

## Root cause and evidence

The running project uses Next.js 16.3.7 and NextAuth **4.24.15**, not Auth.js v5.
`next.config.ts` allowed an old ngrok host and a LAN address but no Cloudflare
Quick Tunnel hosts. Before the fix, `/signin` returned HTTP 200 while its Next.js
JavaScript resources returned **403 Unauthorized** when requested with a tunnel
Origin. The dev server logged `Blocked cross-origin request to Next.js dev
resource ... from "audit-example.trycloudflare.com"`. The page loading alone
therefore did not prove that the interactive sign-in application could run.
The same resource checks returned 200 after the fix.

A second configuration issue was confirmed: `.env` specifies a localhost
`NEXTAUTH_URL`. NextAuth v4's installed `utils/detect-origin.js` gives that value
precedence over forwarded headers. Its `core/init.js` and `core/lib/cookie.js`
therefore selected localhost callbacks and cookies without `Secure` even for
public HTTPS requests. Those response headers were reproduced before the fix.
This was a cookie/redirect configuration defect; the audit did not establish
that missing `Secure` alone prevented credentials verification.

## Authentication flow and audit findings

1. `app/providers.tsx` mounts NextAuth's `SessionProvider`.
2. `signin-form.tsx` imports `signIn` from `lib/auth-client.ts`, which re-exports
   NextAuth React. The installed client uses relative `/api/auth` browser URLs;
   credentials are not sent to a hardcoded localhost backend from the browser.
3. NextAuth fetches providers and a CSRF token, then posts credentials to
   `/api/auth/callback/credentials`. Its signed double-submit CSRF check remains
   enabled. Missing CSRF and invalid credentials were tested and rejected.
4. `lib/auth.ts` queries this application's Prisma `User`, rejects missing
   password hashes and banned accounts, checks bcrypt, preserves delivery access
   synchronization, and logs login activity. There is no external General
   E-commerce authentication backend and no separate backend tunnel is needed.
5. NextAuth writes an encrypted JWT session cookie. The JWT callback checks
   account blocking on subsequent reads; the session callback populates RBAC.
   The existing `AUTH_SECRET` is supported by this installed v4 release; no
   secret values were changed or printed.
6. `/post-login` calls `getServerSession(authOptions)`, validates internal return
   paths, and resolves dashboard/business membership routes. Checkout continuity
   in the sign-in form remains intact.
7. `proxy.ts` forwards cookies to `/api/auth/session`, then applies existing
   protected-page and API permission rules. Its development lookup uses local
   port 3000. Live tests confirmed that public HTTPS cookies work with both this
   internal lookup and server-side session reads. No middleware rules changed.
8. Signout retains CSRF verification and existing activity/presence events.
   Cookie clearing, empty subsequent sessions, and redirect after logout passed.

No authentication CORS exchange is required because browser auth requests are
same-origin. Blanket `AUTH_TRUST_HOST` was not enabled. An unused demo
`components/auth/AuthContext.tsx` exists but is not imported by the active app;
it does not authenticate this sign-in flow.

## Changed files

| File | Change |
|---|---|
| `next.config.ts` | Allow `*.trycloudflare.com` for development resources, including rotating Quick Tunnel names. |
| `lib/auth-request.ts` | Request-specific cookie flags and same-origin callback validation. Accept canonical host; additionally allow localhost and single-label Quick Tunnel hosts in development. Ignore arbitrary forwarded-host claims. |
| `app/api/auth/[...nextauth]/route.ts` | Apply request-specific NextAuth options; reject untrusted hosts with 400. |
| `app/(main)/(auth)/signin/signin-form.tsx` | Friendly credential errors; require both `ok` and no auth error before treating sign-in as successful. |
| `.env.example` | Document development tunnel behavior and stable auth-secret requirement. |
| `tests/auth-request.test.mjs` | Five regression tests covering origin validation, redirects, cookies, production prefixes, and shared-config isolation. |
| `scripts/verify-auth-tunnel.mjs` | Live HTTP verification with a random temporary user; optional headless Edge form verification. Removes only its own user and test activity records in `finally`. |
| `docs/auth-tunnel-fix.md` | Audit, operational instructions, and verification report. |

Cookie names deliberately continue to follow the canonical NextAuth v4
configuration so existing `getServerSession(authOptions)` calls can read them.
Development tunnel cookies have `Secure`, `HttpOnly`, `SameSite=Lax`, `Path=/`,
and no Domain. Production HTTPS retains the standard `__Secure-` session and
`__Host-` CSRF prefixes. Shared auth options and environment values are not
mutated per request. Requests from concurrent localhost/tunnel users can coexist.

## Environment and restart

No `.env` changes are required for the existing development setup. Keep
`NEXTAUTH_URL=http://localhost:3000/` and the existing stable `AUTH_SECRET` or
`NEXTAUTH_SECRET`. Do not replace secrets when restarting a tunnel. No random
tunnel hostname needs to be saved in configuration.

For production, set `NEXTAUTH_URL` to the canonical public HTTPS origin. Automatic
Quick Tunnel host acceptance is intentionally restricted to development. Other
custom hosts must match the configured canonical host. Cloudflared must preserve
the browser's Host header; do not use a localhost `--http-host-header` override.
Payment/SEO public URL configuration is independent of this authentication fix.

In the app terminal, stop the existing process with Ctrl+C, then run:

```powershell
Set-Location 'C:\EveryThing\Office Projects\themed ecommerce'
npm run dev
```

In a second terminal, stop the old tunnel with Ctrl+C, then run:

```powershell
cloudflared tunnel --url http://localhost:3000 --no-autoupdate
```

Use the new HTTPS URL printed by cloudflared. Sessions on an old tunnel hostname
do not transfer to a new hostname; sign in again, as expected for host-only cookies.

Reproduce the tests:

```powershell
node --import tsx --test tests/auth-request.test.mjs
node scripts/verify-auth-tunnel.mjs http://localhost:3000 'https://YOUR-NEW-TUNNEL.trycloudflare.com'
npm run lint
npm run typecheck
npm run build
```

Optional browser verification: set `AUTH_VERIFY_PLAYWRIGHT_MODULE` to the absolute
directory of an installed Playwright module before running the live script.
It launches headless Microsoft Edge; Playwright was loaded from the npm cache
during this audit, without adding a repository dependency.

## Verification

| ID | Result | Evidence |
|---|---|---|
| AUTH-01 | PASS | Localhost credentials login, correct callback and authenticated session. |
| AUTH-02 | PASS | Live HTTPS Quick Tunnel credentials login and authenticated session. |
| AUTH-03 | PASS | Wrong password returns 401 / CredentialsSignin; localhost and HTTPS Edge display friendly error. |
| AUTH-04 | PASS | Repeated session requests persist; localhost and HTTPS Edge retain session after page reload. |
| AUTH-05 | PASS | Customer dashboard returns 200; server post-login resolves customer route. |
| AUTH-06 | PASS | CSRF-protected logout clears session cookie and returns same-origin callback. |
| AUTH-07 | PASS | After logout, session is empty and protected dashboard redirects to signin. |
| AUTH-08 | PASS | HTTPS responses set Secure, HttpOnly, SameSite=Lax, Path=/, no Domain. |
| AUTH-09 | PASS | Correct same-origin credentials endpoint verifies against the real Prisma database. |
| AUTH-10 | PASS | Recreated tunnel with a different hostname; complete HTTP flow passes without environment/config updates. |

All HTTP rows were executed against localhost and live public HTTPS. All 23
sign-in JavaScript resources returned 200. A request without CSRF was rejected
on both origins. Both live tunnel runs used random test users and cleaned them
up; existing accounts were not reset or removed.

Additional checks: five regression tests PASS; repository lint PASS with two
existing warnings in archived `front_End/layout.tsx`; standalone typecheck PASS;
targeted lint PASS; standard `npm run build` PASS (compilation, TypeScript,
static generation, and route output completed).

Headless Microsoft Edge form checks PASS on localhost and the second live HTTPS
tunnel: invalid-password message, successful form submission, dashboard
navigation, and authenticated session after reload. An initial HTTPS browser
attempt timed out waiting for the error message; a diagnostic rerun passed.
The harness now explicitly waits for session/hydration readiness before filling
the form; the complete HTTPS HTTP and Edge run passed again with that wait in
place (exit code 0). Logout was exercised over HTTP, not through a browser
logout button.

An earlier build using the pre-existing `WAREHOUSE_BUNDLE_VERIFY=true` isolated
build config failed because that config includes archived `front_End` files
whose imports are missing. That config was not modified. A separate attempt
with its log stored inside `.next` failed because Windows locked the log during
build cleanup. The final standard build used a log in the system temp directory
and completed with exit code 0. These failed attempts did not indicate an auth
code build failure.

## Limitations

Customer authentication was exercised. Admin/supplier/investor role journeys,
checkout, payment transactions, account blocking, and unrelated commerce flows
were not executed; their existing code/security rules were retained. Production
cookie prefixes and host rejection have automated coverage; no deployed
production browser session was tested. The application still expects local
port 3000 for its existing development proxy session lookup.

The old Quick Tunnel URL was not running at audit start. Verification used two
new Quick Tunnels. Nothing was committed or pushed.
