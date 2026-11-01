/** @jest-environment node */
import { PAGE_SIZE, searchCustomers, summariseSales } from "./queries";

describe("summariseSales", () => {
  it("returns exactly the requested number of days and consistent totals", () => {
    const s = summariseSales(30);
    expect(s.days).toHaveLength(30);
    expect(s.totalRevenue).toBe(s.days.reduce((a, d) => a + d.revenue, 0));
    expect(s.avgOrderValue).toBe(Math.round(s.totalRevenue / s.totalOrders));
  });
});

describe("searchCustomers", () => {
  it("pages results", () => {
    const p1 = searchCustomers({ page: 1 });
    expect(p1.items).toHaveLength(PAGE_SIZE);
    expect(p1.total).toBe(240);
  });

  it("filters by tier and search text", () => {
    const gold = searchCustomers({ tier: "gold" });
    expect(gold.items.every((c) => c.tier === "gold")).toBe(true);
    const ada = searchCustomers({ search: "ADA" });
    expect(ada.items.every((c) => c.name.toLowerCase().includes("ada") || c.email.includes("ada"))).toBe(true);
  });
});
