import { useDeferredValue, useMemo, useState } from "react";
import { createApiClient, type Customer, type CustomerTier } from "@opsboard/api";
import { Card, DataTable, ErrorState, Loading, formatInt, formatMoney, useAsync, type Column } from "@opsboard/ui";

const columns: Column<Customer>[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "tier", header: "Tier", render: (c) => <span className={`ob-badge ob-badge--${c.tier}`}>{c.tier}</span> },
  { key: "visits", header: "Visits", numeric: true, sortable: true, render: (c) => formatInt(c.visits) },
  { key: "lifetimeSpend", header: "Lifetime spend", numeric: true, sortable: true, render: (c) => formatMoney(c.lifetimeSpend) },
  { key: "lastVisit", header: "Last visit", sortable: true },
];

export default function CustomersPanel({ apiBase }: { apiBase: string }) {
  const api = useMemo(() => createApiClient({ baseUrl: apiBase }), [apiBase]);
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState<CustomerTier | "">("");
  const [page, setPage] = useState(1);
  // typing stays responsive; the request follows the deferred value
  const query = useDeferredValue(search);
  const [state, retry] = useAsync((signal) => api.customers({ page, search: query, tier }, signal), [api, page, query, tier]);

  const totalPages = state.status === "success" ? Math.max(1, Math.ceil(state.data.total / state.data.pageSize)) : 1;

  return (
    <Card title="Customers" index="Module 02">
      <form className="ob-filters" role="search" onSubmit={(e) => e.preventDefault()}>
        <label>
          Search
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Name or email"
          />
        </label>
        <label>
          Tier
          <select
            value={tier}
            onChange={(e) => {
              setTier(e.target.value as CustomerTier | "");
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
            <option value="bronze">Bronze</option>
          </select>
        </label>
      </form>

      {state.status === "loading" && <Loading label="Loading customers" />}
      {state.status === "error" && <ErrorState error={state.error} onRetry={retry} />}
      {state.status === "success" && (
        <>
          <p className="ob-muted" aria-live="polite">
            {formatInt(state.data.total)} customers
          </p>
          <DataTable rows={state.data.items} columns={columns} caption="Customers" />
          <nav className="ob-pager" aria-label="Customer pages">
            <button type="button" className="ob-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button type="button" className="ob-btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </nav>
        </>
      )}
    </Card>
  );
}
