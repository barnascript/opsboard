import type { Customer, Page, SalesSummary } from "./types";

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export interface ClientOptions {
  baseUrl: string;
  /** retries on network errors and 5xx, never on 4xx */
  retries?: number;
  fetchImpl?: typeof fetch;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function createApiClient({ baseUrl, retries = 2, fetchImpl = fetch }: ClientOptions) {
  async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetchImpl(`${baseUrl}${path}`, { signal, headers: { accept: "application/json" } });
        if (res.ok) return (await res.json()) as T;
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        const err = new ApiRequestError(body.error ?? res.statusText, res.status);
        if (res.status < 500) throw err;
        lastError = err;
      } catch (e) {
        if (e instanceof ApiRequestError && e.status < 500) throw e;
        if ((e as Error).name === "AbortError") throw e;
        lastError = e;
      }
      if (attempt < retries) await sleep(200 * 2 ** attempt);
    }
    throw lastError;
  }

  return {
    sales: (days: number, signal?: AbortSignal) => get<SalesSummary>(`/api/sales?days=${days}`, signal),
    customers: (q: { page?: number; search?: string; tier?: string }, signal?: AbortSignal) => {
      const params = new URLSearchParams();
      if (q.page) params.set("page", String(q.page));
      if (q.search) params.set("search", q.search);
      if (q.tier) params.set("tier", q.tier);
      return get<Page<Customer>>(`/api/customers?${params}`, signal);
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
