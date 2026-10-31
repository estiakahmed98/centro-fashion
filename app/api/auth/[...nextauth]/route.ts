// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getAuthRequestOptions } from "@/lib/auth-request";
import type { NextRequest } from "next/server";

async function handler(
  request: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> },
) {
  let options;
  try {
    options = getAuthRequestOptions(request, authOptions);
  } catch {
    return Response.json({ error: "Untrusted authentication host" }, { status: 400 });
  }
  return NextAuth(options)(request, context);
}
export { handler as GET, handler as POST };
