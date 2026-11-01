import { REMOTES } from "./remotes";

const allowed = new Set<string>(Object.values(REMOTES));

/** Remotes call the API directly in standalone mode, so allow only their origins. */
export function corsHeaders(origin: string | null): HeadersInit {
  return origin && allowed.has(origin) ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" } : {};
}
