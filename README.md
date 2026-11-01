# Opsboard

A micro-frontend operations dashboard: a **Next.js shell** that loads independently built and deployed **React remotes** at runtime through **Module Federation**, with a typed REST API, Contentful-driven content, unit and end-to-end tests, and CI.

```
                     ┌───────────────────────────────────────────┐
  browser ─────────► │ shell  (Next.js 16, App Router, :3000)    │
                     │  • server-renders layout + CMS content    │
                     │  • REST API over 1M real UCI rows         │
                     │  • nonce CSP (src/proxy.ts)               │
                     │  • MF runtime: shares ONE React instance  │
                     └──────┬───────────────────────┬────────────┘
             mf-manifest.json│                       │mf-manifest.json
                     ┌──────▼────────┐       ┌──────▼──────────┐
                     │ sales (:3001) │       │ customers(:3002)│   Rsbuild + MF plugin
                     │ SalesPanel    │       │ CustomersPanel  │   each deployable alone
                     └───────────────┘       └─────────────────┘
                             ▲  both import  ▲
                     packages/ui  (design system)   packages/api (types + client)
```

## Run it

```bash
npm install
npm run dev          # shell :3000, sales :3001, customers :3002
```

Each remote also runs on its own (`npm run dev -w @opsboard/sales`), so a team can work on one panel without the shell.

| Command | What it does |
|---|---|
| `npm run typecheck` | `tsc` across every workspace (strict, `noUncheckedIndexedAccess`) |
| `npm test` | Jest + Testing Library unit tests |
| `npm run build` | builds the remotes, then the shell |
| `npm run e2e` | starts all three production builds, runs Cypress, including axe accessibility checks |

## Decisions worth explaining

**Runtime Module Federation, not build-time.** The shell only knows each remote's URL (`NEXT_PUBLIC_SALES_URL`, …). A remote team ships by deploying its own bundle, with no shell rebuild. I used `@module-federation/enhanced/runtime` instead of `nextjs-mf` because the Next plugin does not support the App Router.

**One React, owned by the shell.** The shell registers its own React as the shared singleton with `shareStrategy: "loaded-first"`. Without that, a remote can bring a second copy and hooks break ("Invalid hook call"). Next ships a canary React build, so the version suffix is stripped before matching `^19.0.0`.

**Failure isolation.** Each remote renders inside an error boundary plus Suspense. If `customers` is down, Sales still works, and a Cypress test proves it by forcing a network error on the remote.

**Typed API client with sane retries.** `packages/api` retries network errors and 5xx with backoff, never 4xx, and aborts stale requests. `useAsync` aborts on dependency change, so a slow response can never overwrite a newer one.

**Security.** A per-request nonce CSP with `'strict-dynamic'`: the trusted federation runtime may add remote scripts, while an injected inline script is blocked. Also `frame-ancestors 'none'`, `nosniff`, a strict referrer policy, API input validation, and CORS limited to the known remote origins.

**Accessibility.** Charts render a hidden data table for screen readers. Sortable headers expose `aria-sort`. There is a skip link, visible focus rings and live regions for loading states, and `prefers-reduced-motion` is respected. axe runs in CI and fails on serious or critical issues.

**Performance / SSR.** The shell and CMS content are server-rendered. Remotes are client-only (`ssr: false`) and load in parallel. CMS results are cached for 5 minutes, and API responses send `stale-while-revalidate`.

## Deploy (Render)

`render.yaml` is a Render Blueprint: **Dashboard → New → Blueprint → this repo** creates three services:

| Service | Type | Rebuilds when |
|---|---|---|
| `opsboard` | Node web service (the Next.js shell) | `apps/shell/**` or `packages/**` changes |
| `opsboard-sales` | Static site (remote) | `apps/sales/**` or `packages/**` changes |
| `opsboard-customers` | Static site (remote) | `apps/customers/**` or `packages/**` changes |

The shell learns each remote's hostname from the Blueprint (`fromService`), so nothing is hard-coded. Remote builds use `assetPrefix: "auto"`: one artifact runs on any host. The shell is on Render's free plan, so the first request after 15 idle minutes takes about a minute while it wakes up.

## Contentful

Set `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ACCESS_TOKEN` (in `apps/shell/.env.local`) and create an `announcement` content type with `title` and `body` fields. Without them, the page uses local fallback copy, and a CMS outage also falls back instead of breaking the page.

## Data

Real transactions from the [UCI Online Retail II](https://archive.ics.uci.edu/dataset/502/online+retail+ii) dataset (D. Chen, 2019, CC BY 4.0): a UK online gift wholesaler, 1 Dec 2009 to 9 Dec 2011, 1,033,036 rows. Customer IDs are anonymous numbers; there are no names or emails.

`scripts/import_uci.py` aggregates the raw rows once into small JSON files under `apps/shell/src/data/`, so the API never scans a million rows per request:

| Step | Rows |
|---|---|
| Raw (both yearly sheets, overlap de-duplicated) | 1,033,036 |
| Purchases reversed by a matching cancellation, removed | 6,402 |
| After also dropping cancellations, returns, zero prices, and postage/fee/adjustment lines | 997,113 |

**The trap worth knowing:** dropping cancellation rows alone is not enough. The purchase they reversed stays in. On 9 Dec 2011 a single 80,995-unit order (about £168k) was placed and cancelled the same day; naive cleaning shows that day at £198k, the real figure is £29.6k. The importer matches each cancellation to the latest earlier purchase with the same customer, product and quantity, and removes both. A unit test guards it.

Other honest details: the shop does not trade on Saturdays, so those days are real zeros in the chart; "last N days" counts back from the last day in the data; tiers are spend percentiles (gold top 10%, silver next 30%).

Rebuild the data:

```bash
mkdir -p data/raw
curl -L -o data/raw/online_retail_ii.zip https://archive.ics.uci.edu/static/public/502/online+retail+ii.zip
unzip -o data/raw/online_retail_ii.zip -d data/raw
pip install pandas openpyxl
python3 -I scripts/import_uci.py data/raw/online_retail_II.xlsx apps/shell/src/data
```

## Next steps

- Deploy: shell to Vercel, remotes to any static host/CDN, with URLs set per environment
- Contract tests between the shell and remote props
- Storybook for `packages/ui`
- Lighthouse CI budget on the shell
