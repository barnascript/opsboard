import { NextResponse, type NextRequest } from "next/server";
import { REMOTES } from "./lib/remotes";

/**
 * Nonce-based Content-Security-Policy. 'strict-dynamic' lets the trusted
 * Module Federation runtime add the remote <script> tags, while any injected
 * inline script without the nonce is blocked.
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const dev = process.env.NODE_ENV !== "production";
  const remoteOrigins = Object.values(REMOTES).join(" ");

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${remoteOrigins}${dev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: https://images.ctfassets.net`,
    `connect-src 'self' ${remoteOrigins}${dev ? " ws:" : ""}`,
    `font-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ].join("; ");

  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [{ source: "/((?!api|_next/static|_next/image|favicon.ico).*)" }],
};
