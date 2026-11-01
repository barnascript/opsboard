import type { Customer, Page, SalesSummary } from "@opsboard/api";
import { customers, salesHistory } from "./seed";

const HISTORY = salesHistory();
const CUSTOMERS = customers();
export const PAGE_SIZE = 20;

export function summariseSales(days: number): SalesSummary {
  const current = HISTORY.slice(-days);
  const previous = HISTORY.slice(-days * 2, -days);
  const sum = (xs: typeof current, k: "revenue" | "orders") => xs.reduce((a, d) => a + d[k], 0);
  const totalRevenue = sum(current, "revenue");
  const totalOrders = sum(current, "orders");
  const prevRevenue = sum(previous, "revenue");
  return {
    days: current,
    totalRevenue,
    totalOrders,
    avgOrderValue: totalOrders ? Math.round(totalRevenue / totalOrders) : 0,
    changeVsPrevious: prevRevenue ? (totalRevenue - prevRevenue) / prevRevenue : 0,
  };
}

export function searchCustomers({ page = 1, search = "", tier = "" }: { page?: number; search?: string; tier?: string }): Page<Customer> {
  const q = search.trim().toLowerCase();
  const filtered = CUSTOMERS.filter(
    (c) => (!tier || c.tier === tier) && (!q || c.name.toLowerCase().includes(q) || c.email.includes(q)),
  );
  const start = (page - 1) * PAGE_SIZE;
  return { items: filtered.slice(start, start + PAGE_SIZE), page, pageSize: PAGE_SIZE, total: filtered.length };
}
