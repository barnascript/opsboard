import { formatPct } from "./format";

export interface StatTileProps {
  label: string;
  value: string;
  /** fraction, e.g. 0.12 for +12% */
  change?: number;
  /** set when a fall is the good outcome (refunds, wait time) */
  lowerIsBetter?: boolean;
}

export function StatTile({ label, value, change, lowerIsBetter = false }: StatTileProps) {
  const good = change === undefined ? undefined : lowerIsBetter ? change < 0 : change > 0;
  return (
    <div className="ob-stat">
      <span className="ob-stat__label">{label}</span>
      <strong className="ob-stat__value">{value}</strong>
      {change !== undefined && (
        <span className={`ob-stat__change ${good ? "is-good" : "is-bad"}`}>
          <span aria-hidden="true">{change >= 0 ? "▲" : "▼"} </span>
          {formatPct(change)}
          <span className="ob-visually-hidden"> vs previous period, {good ? "better" : "worse"}</span>
        </span>
      )}
    </div>
  );
}
