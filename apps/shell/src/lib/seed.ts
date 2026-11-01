import type { Customer, CustomerTier, SalesDay } from "@opsboard/api";

/** Small deterministic PRNG so the demo data is identical on every run and in tests. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DAY_MS = 86_400_000;
// pinned "today" keeps tests stable; real deployments would use the clock
export const SEED_TODAY = Date.UTC(2026, 9, 31);

export function salesHistory(totalDays = 180): SalesDay[] {
  const rand = mulberry32(42);
  const out: SalesDay[] = [];
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(SEED_TODAY - i * DAY_MS);
    const weekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;
    const orders = Math.round((weekend ? 140 : 85) + rand() * 40);
    const revenue = Math.round(orders * (38 + rand() * 14));
    out.push({ date: d.toISOString().slice(0, 10), orders, revenue });
  }
  return out;
}

const FIRST = ["Ada", "Tunde", "Grace", "Chidi", "Maya", "Ivan", "Zara", "Leo", "Amaka", "Noah", "Ife", "Sara", "Kofi", "Lena", "Musa", "Ruth"];
const LAST = ["Okafor", "Smith", "Adeyemi", "Garcia", "Chen", "Bello", "Novak", "Ibrahim", "Kim", "Mensah", "Silva", "Eze"];

export function customers(count = 240): Customer[] {
  const rand = mulberry32(7);
  return Array.from({ length: count }, (_, i) => {
    const first = FIRST[Math.floor(rand() * FIRST.length)]!;
    const last = LAST[Math.floor(rand() * LAST.length)]!;
    const visits = 1 + Math.floor(rand() ** 2 * 60);
    const lifetimeSpend = Math.round(visits * (30 + rand() * 50));
    const tier: CustomerTier = lifetimeSpend > 2000 ? "gold" : lifetimeSpend > 600 ? "silver" : "bronze";
    return {
      id: `c${String(i + 1).padStart(4, "0")}`,
      name: `${first} ${last}`,
      email: `${first}.${last}${i}@example.com`.toLowerCase(),
      tier,
      visits,
      lifetimeSpend,
      lastVisit: new Date(SEED_TODAY - Math.floor(rand() * 120) * DAY_MS).toISOString().slice(0, 10),
    };
  });
}
