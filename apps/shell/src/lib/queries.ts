import type { Customer, CustomerTier, Page, SalesDay, SalesSummary } from "@opsboard/api";
import salesJson from "../data/sales-daily.json";
import customersJson from "../data/customers.json";

// pre-aggregated from ~1M UCI Online Retail II rows by scripts/import_uci.py
const HISTORY = salesJson as SalesDay[];
const CUSTOMERS = customersJson as Customer[];
const TIERS = new Set<CustomerTier>(["gold", "silver", "bronze"]);
export const PAGE_SIZE = 20;

export function summariseSales(days: number): SalesSummary {
  const current = HISTORY.slice(-days);
  const previous = HISTORY.slice(-days * 2, -days);
  const sum = (xs: SalesDay[], k: "revenue" | "orders") => xs.reduce((a, d) => a + d[k], 0);
  const totalRevenue = sum(current, "revenue");
  const totalOrders = sum(current, "orders");
  const prevRevenue = sum(previous, "revenue");
  return {
    asOf: HISTORY[HISTORY.length - 1]!.date,
    days: current,
    totalRevenue,
    totalOrders,
    avgOrderValue: totalOrders ? Math.round(totalRevenue / totalOrders) : 0,
    changeVsPrevious: prevRevenue ? (totalRevenue - prevRevenue) / prevRevenue : 0,
  };
}

/** Search matches a customer ID prefix or a country name. Results keep the file's order: highest spend first. */
export function searchCustomers({ page = 1, search = "", tier = "" }: { page?: number; search?: string; tier?: string }): Page<Customer> {
  const q = search.trim().toLowerCase();
  const filtered = CUSTOMERS.filter(
    (c) =>
      (!tier || (TIERS.has(tier as CustomerTier) && c.tier === tier)) &&
      (!q || c.id.startsWith(q) || c.country.toLowerCase().includes(q)),
  );
  const start = (page - 1) * PAGE_SIZE;
  return { items: filtered.slice(start, start + PAGE_SIZE), page, pageSize: PAGE_SIZE, total: filtered.length };
}
