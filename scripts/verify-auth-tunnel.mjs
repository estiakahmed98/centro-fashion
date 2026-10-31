// Explicit live verification: creates and removes only its own random test user.
// Run: node scripts/verify-auth-tunnel.mjs http://localhost:3000 https://<tunnel>
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import nextEnv from "@next/env";
import bcrypt from "bcryptjs";
import { createRequire } from "node:module";

nextEnv.loadEnvConfig(process.cwd());
const require = createRequire(import.meta.url);
const { PrismaClient } = require("../generated/prisma");
const db = new PrismaClient();
const bases = process.argv.slice(2);
assert.ok(bases.length, "Supply the localhost and/or HTTPS tunnel origin");
const password = randomBytes(24).toString("base64url");
let user;
try {
  user = await db.user.create({ data: {
    email: `auth-verification-${randomBytes(12).toString("hex")}@example.invalid`,
    name: "Temporary authentication verification", role: "user",
    passwordHash: await bcrypt.hash(password, 10),
  } });
  for (const base of bases) {
    const jar = new Map();
    async function request(path, options = {}) {
      const response = await fetch(new URL(path, base), {
        ...options, redirect: "manual", signal: AbortSignal.timeout(45000),
        headers: { cookie: [...jar].map(([k, v]) => `${k}=${v}`).join("; "), ...options.headers },
      });
      for (const cookie of response.headers.getSetCookie()) {
        const pair = cookie.split(";")[0];
        const split = pair.indexOf("=");
        const key = pair.slice(0, split), value = pair.slice(split + 1);
        if (!value || /Max-Age=0/i.test(cookie)) jar.delete(key);
        else jar.set(key, value);
      }
      return response;
    }
    async function post(path, data) {
      return request(path, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(data) });
    }
    const page = await request("/signin");
    assert.equal(page.status, 200);
    const html = await page.text();
    const assets = [...html.matchAll(/src="([^"]*_next[^"]+)"/g)].map(match => match[1]);
    assert.ok(assets.length);
    for (const asset of assets) {
      const response = await request(asset, { headers: { origin: base, "sec-fetch-mode": "no-cors", "sec-fetch-site": "same-origin" } });
      assert.equal(response.status, 200, `JavaScript asset ${asset}`);
    }
    console.log("PASS", base, "signin and all", assets.length, "JavaScript assets");
    const csrfResponse = await request("/api/auth/csrf");
    if (base.startsWith("https:")) {
      for (const cookie of csrfResponse.headers.getSetCookie()) {
        assert.match(cookie, /; Secure/);
        assert.match(cookie, /; HttpOnly/);
        assert.match(cookie, /SameSite=Lax/);
        assert.doesNotMatch(cookie, /; Domain=/i);
      }
    }
    const { csrfToken } = await csrfResponse.json();
    const invalid = await post("/api/auth/callback/credentials", { email: user.email, password: "incorrect", csrfToken, json: "true", callbackUrl: base + "/post-login" });
    assert.equal(invalid.status, 401);
    assert.match((await invalid.json()).url, /error=CredentialsSignin/);
    console.log("PASS", base, "invalid credentials rejected");
    const missingCsrf = await post("/api/auth/callback/credentials", { email: user.email, password, json: "true" });
    assert.match((await missingCsrf.json()).url, /csrf=true/);
    assert.equal((await (await request("/api/auth/session")).json()).user, undefined);
    console.log("PASS", base, "missing CSRF rejected");
    const login = await post("/api/auth/callback/credentials", { email: user.email, password, csrfToken, json: "true", callbackUrl: base + "/post-login" });
    assert.equal(login.status, 200);
    assert.equal((await login.json()).url, base + "/post-login");
    const sessionCookies = login.headers.getSetCookie().filter(c => c.startsWith("next-auth.session-token="));
    assert.equal(sessionCookies.length, 1);
    if (base.startsWith("https:")) assert.match(sessionCookies[0], /; Secure/);
    for (let refresh = 0; refresh < 2; refresh++) {
      const session = await (await request("/api/auth/session")).json();
      assert.equal(session.user.id, user.id);
    }
    const protectedPage = await request("/ecommerce/user");
    assert.equal(protectedPage.status, 200);
    await protectedPage.text();
    const postLogin = await request("/post-login");
    if (postLogin.status === 307) {
      assert.match(postLogin.headers.get("location"), /\/ecommerce\/user\/?$/);
    } else {
      // Next.js may start streaming before the async server redirect resolves.
      assert.equal(postLogin.status, 200);
      assert.match(await postLogin.text(), /NEXT_REDIRECT;replace;\/ecommerce\/user\/?;307/);
    }
    console.log("PASS", base, "login, cookies, session refresh, protected page and server post-login");
    const freshCsrf = await (await request("/api/auth/csrf")).json();
    const logout = await post("/api/auth/signout", { csrfToken: freshCsrf.csrfToken, json: "true", callbackUrl: base + "/signin" });
    assert.equal((await logout.json()).url, base + "/signin");
    assert.ok(![...jar.keys()].some(key => key.includes("session-token")));
    assert.equal((await (await request("/api/auth/session")).json()).user, undefined);
    const denied = await request("/ecommerce/user");
    assert.equal(denied.status, 307);
    assert.match(denied.headers.get("location"), /\/signin\?/);
    if (base.startsWith("https:")) assert.equal(new URL(denied.headers.get("location"), base).origin, base);
    console.log("PASS", base, "logout clears cookie, empty session, protected page redirects to signin");
    // Optional browser coverage without adding a project dependency. Set this
    // to an installed Playwright module directory; uses local Microsoft Edge.
    if (process.env.AUTH_VERIFY_PLAYWRIGHT_MODULE) {
      const { chromium } = require(process.env.AUTH_VERIFY_PLAYWRIGHT_MODULE);
      const browser = await chromium.launch({ channel: "msedge", headless: true });
      try {
        const page = await browser.newPage();
        page.on("pageerror", error => console.log("Browser error:", error.message));
        page.on("requestfailed", req => console.log("Browser request failed:", new URL(req.url()).pathname, req.failure()?.errorText));
        await page.goto(base + "/signin");
        // SessionProvider disables submit until hydration/session loading ends.
        // Wait before filling so hydration cannot replace the entered values.
        await page.getByRole("button", { name: "Sign In", exact: true }).click({ trial: true });
        await page.getByRole("textbox", { name: "Email", exact: true }).fill(user.email);
        await page.getByLabel("Password", { exact: true }).fill("incorrect");
        await page.getByRole("button", { name: "Sign In", exact: true }).click();
        try {
          await page.getByText("Invalid email or password. Please try again.", { exact: true }).first().waitFor();
        } catch (error) {
          console.log("Browser form state:", (await page.locator("body").innerText()).slice(-4500));
          throw error;
        }
        await page.getByLabel("Password", { exact: true }).fill(password);
        await page.getByRole("button", { name: "Sign In", exact: true }).click();
        await page.waitForURL(/\/ecommerce\/user\/?$/, { timeout: 45000 });
        await page.reload();
        const session = await page.evaluate(async () => (await fetch("/api/auth/session")).json());
        assert.equal(session.user.id, user.id);
        console.log("PASS", base, "Edge browser: invalid password message, form login, dashboard redirect and session after reload");
      } finally {
        await browser.close();
      }
    }
  }
} finally {
  if (user) {
    await db.activityLog.deleteMany({ where: { userId: user.id } });
    await db.user.delete({ where: { id: user.id } });
    console.log("Removed temporary verification user and its test activity records");
  }
  await db.$disconnect();
}
