import { useMemo, useState } from "react";
import { createApiClient } from "@opsboard/api";
import { BarChart, Card, ErrorState, Loading, StatTile, formatInt, formatMoney, useAsync } from "@opsboard/ui";

const RANGES = [7, 30, 90] as const;

export default function SalesPanel({ apiBase }: { apiBase: string }) {
  const api = useMemo(() => createApiClient({ baseUrl: apiBase }), [apiBase]);
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const [state, retry] = useAsync((signal) => api.sales(days, signal), [api, days]);

  const rangePicker = (
    <div role="group" aria-label="Date range" className="ob-segmented">
      {RANGES.map((r) => (
        <button key={r} type="button" aria-pressed={days === r} onClick={() => setDays(r)}>
          {r}d
        </button>
      ))}
    </div>
  );

  return (
    <Card title="Sales" index="Module 01" actions={rangePicker}>
      {state.status === "loading" && <Loading label="Loading sales" />}
      {state.status === "error" && <ErrorState error={state.error} onRetry={retry} />}
      {state.status === "success" && (
        <>
          <div className="ob-stats">
            <StatTile label="Revenue" value={formatMoney(state.data.totalRevenue)} change={state.data.changeVsPrevious} />
            <StatTile label="Orders" value={formatInt(state.data.totalOrders)} />
            <StatTile label="Avg order" value={formatMoney(state.data.avgOrderValue)} />
          </div>
          <BarChart
            title={`Daily revenue, last ${days} days`}
            data={state.data.days.map((d) => ({ label: d.date, value: d.revenue }))}
            format={formatMoney}
          />
        </>
      )}
    </Card>
  );
}
