/** Where each micro-frontend is deployed. Swapping a URL ships a new version without rebuilding the shell. */
const origin = (value: string | undefined, fallback: string) => {
  if (!value) return fallback;
  // hosts like Render pass a bare hostname; CSP and fetch need a full origin
  return /^https?:\/\//.test(value) ? value.replace(/\/$/, "") : `https://${value}`;
};

export const REMOTES = {
  sales: origin(process.env.NEXT_PUBLIC_SALES_URL, "http://localhost:3001"),
  customers: origin(process.env.NEXT_PUBLIC_CUSTOMERS_URL, "http://localhost:3002"),
} as const;

export type RemoteName = keyof typeof REMOTES;
