const money = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
const int = new Intl.NumberFormat("en-GB");

export const formatMoney = (n: number) => money.format(n);
export const formatInt = (n: number) => int.format(n);
export const formatPct = (fraction: number) => `${fraction >= 0 ? "+" : ""}${(fraction * 100).toFixed(1)}%`;

const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
/** "2011-12-09" -> "9 Dec 2011" */
export const formatDate = (iso: string) => date.format(new Date(`${iso}T00:00:00Z`));
