import { useMemo, useState, type ReactNode } from "react";

export interface Column<T> {
  key: keyof T & string;
  header: string;
  render?: (row: T) => ReactNode;
  numeric?: boolean;
  sortable?: boolean;
}

type Sort<T> = { key: keyof T & string; dir: "ascending" | "descending" } | null;

export function DataTable<T extends { id: string }>({ rows, columns, caption }: { rows: T[]; columns: Column<T>[]; caption: string }) {
  const [sort, setSort] = useState<Sort<T>>(null);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const factor = sort.dir === "ascending" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * factor;
      return String(av).localeCompare(String(bv)) * factor;
    });
  }, [rows, sort]);

  const toggle = (key: keyof T & string) =>
    setSort((s) => (s?.key === key && s.dir === "ascending" ? { key, dir: "descending" } : { key, dir: "ascending" }));

  return (
    <div className="ob-table-wrap">
      <table className="ob-table">
        <caption className="ob-visually-hidden">{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" aria-sort={sort?.key === c.key ? sort.dir : undefined} className={c.numeric ? "is-num" : undefined}>
                {c.sortable ? (
                  <button type="button" onClick={() => toggle(c.key)}>
                    {c.header}
                    <span aria-hidden="true">{sort?.key === c.key ? (sort.dir === "ascending" ? " ↑" : " ↓") : " ↕"}</span>
                  </button>
                ) : (
                  c.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.id}>
              {columns.map((c) => (
                <td key={c.key} className={c.numeric ? "is-num" : undefined}>
                  {c.render ? c.render(row) : String(row[c.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
