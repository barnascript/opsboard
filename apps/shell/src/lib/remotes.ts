/** Where each micro-frontend is deployed. Swapping a URL ships a new version without rebuilding the shell. */
export const REMOTES = {
  sales: process.env.NEXT_PUBLIC_SALES_URL ?? "http://localhost:3001",
  customers: process.env.NEXT_PUBLIC_CUSTOMERS_URL ?? "http://localhost:3002",
} as const;

export type RemoteName = keyof typeof REMOTES;
