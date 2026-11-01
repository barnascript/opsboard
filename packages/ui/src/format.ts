const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const int = new Intl.NumberFormat("en-US");

export const formatMoney = (n: number) => money.format(n);
export const formatInt = (n: number) => int.format(n);
export const formatPct = (fraction: number) => `${fraction >= 0 ? "+" : ""}${(fraction * 100).toFixed(1)}%`;
