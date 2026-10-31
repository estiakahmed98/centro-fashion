import test from "node:test";
import assert from "node:assert/strict";
import { getAuthRequestOptions } from "../lib/auth-request.ts";

const dev = { NODE_ENV: "development", NEXTAUTH_URL: "http://localhost:3000/" };
const request = (host, protocol = "http:") => new Request(`${protocol}//${host}/api/auth/session`, {
  headers: { host, "x-forwarded-proto": "https", "x-forwarded-host": "attacker.example" },
});

test("localhost retains HTTP cookies despite spoofed forwarded headers", () => {
  const options = getAuthRequestOptions(request("localhost:3000"), {}, dev);
  assert.equal(options.cookies.sessionToken.name, "next-auth.session-token");
  assert.equal(options.cookies.sessionToken.options.secure, false);
});

test("rotating Quick Tunnel hosts use secure host-only cookies and same-origin callbacks", async () => {
  for (const host of ["first-tunnel.trycloudflare.com", "new-tunnel.trycloudflare.com"]) {
    const options = getAuthRequestOptions(request(host), {}, dev);
    assert.equal(options.cookies.sessionToken.name, "next-auth.session-token");
    for (const cookie of Object.values(options.cookies)) {
      assert.deepEqual(cookie.options, { httpOnly: true, secure: true, sameSite: "lax", path: "/" });
    }
    const redirect = url => options.callbacks.redirect({ url, baseUrl: dev.NEXTAUTH_URL });
    assert.equal(await redirect("/post-login"), `https://${host}/post-login`);
    assert.equal(await redirect(`https://${host}/ecommerce/user`), `https://${host}/ecommerce/user`);
    for (const unsafe of ["https://attacker.example/", "//attacker.example/", "javascript:alert(1)", "http://localhost:3000/"]) {
      assert.equal(await redirect(unsafe), `https://${host}`);
    }
  }
});

test("production preserves secure cookie prefixes and rejects unconfigured hosts", () => {
  const env = { NODE_ENV: "production", NEXTAUTH_URL: "https://shop.example" };
  const options = getAuthRequestOptions(request("shop.example"), {}, env);
  assert.equal(options.cookies.sessionToken.name, "__Secure-next-auth.session-token");
  assert.equal(options.cookies.csrfToken.name, "__Host-next-auth.csrf-token");
  assert.equal(options.cookies.sessionToken.options.secure, true);
  for (const host of ["new.trycloudflare.com", "attacker.example", "localhost:3000"]) {
    assert.throws(() => getAuthRequestOptions(request(host), {}, env));
  }
});

test("untrusted hosts and tunnel lookalikes are rejected in development", () => {
  for (const host of ["attacker.example", "foo.trycloudflare.com.attacker.example", "foo.bar.trycloudflare.com", "foo.trycloudflare.com:1234"]) {
    assert.throws(() => getAuthRequestOptions(request(host), {}, dev));
  }
});

test("request options do not mutate shared auth configuration or callbacks", () => {
  const jwt = async ({ token }) => token;
  const shared = { callbacks: { jwt } };
  const options = getAuthRequestOptions(request("new.trycloudflare.com"), shared, dev);
  assert.equal(options.callbacks.jwt, jwt);
  assert.deepEqual(shared, { callbacks: { jwt } });
});
