/** @jest-environment node */
import meta from "../data/meta.json";
import { PAGE_SIZE, searchCustomers, summariseSales } from "./queries";

describe("summariseSales", () => {
  it("returns exactly the requested number of days, ending on the last day of data", () => {
    const s = summariseSales(30);
    expect(s.days).toHaveLength(30);
    expect(s.asOf).toBe(meta.lastDate);
    expect(s.days.at(-1)!.date).toBe(meta.lastDate);
  });

  it("keeps totals consistent with the daily rows", () => {
    const s = summariseSales(90);
    expect(s.totalRevenue).toBeCloseTo(s.days.reduce((a, d) => a + d.revenue, 0), 2);
    expect(s.avgOrderValue).toBe(Math.round(s.totalRevenue / s.totalOrders));
  });

  it("does not count the cancelled 80,995-unit order on 9 Dec 2011", () => {
    const lastDay = summariseSales(7).days.at(-1)!;
    expect(lastDay.date).toBe("2011-12-09");
    expect(lastDay.revenue).toBeLessThan(50_000);
  });
});

describe("searchCustomers", () => {
  it("pages every customer, highest spend first", () => {
    const p1 = searchCustomers({ page: 1 });
    expect(p1.items).toHaveLength(PAGE_SIZE);
    expect(p1.total).toBe(meta.customers);
    const spends = p1.items.map((c) => c.lifetimeSpend);
    expect(spends).toEqual([...spends].sort((a, b) => b - a));
  });

  it("filters by tier and by country or ID", () => {
    expect(searchCustomers({ tier: "gold" }).items.every((c) => c.tier === "gold")).toBe(true);
    const nl = searchCustomers({ search: "nether" });
    expect(nl.total).toBeGreaterThan(0);
    expect(nl.items.every((c) => c.country === "Netherlands")).toBe(true);
    expect(searchCustomers({ search: "14646" }).items[0]?.id).toBe("14646");
  });

  it("ignores an unknown tier instead of matching everything", () => {
    expect(searchCustomers({ tier: "platinum" }).total).toBe(0);
  });
});
