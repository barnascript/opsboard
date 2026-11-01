# Opsboard

A micro-frontend operations dashboard: a **Next.js shell** that loads independently built and deployed **React remotes** at runtime through **Module Federation**, with a typed REST API, Contentful-driven content, unit and end-to-end tests, and CI.

```
                     ┌───────────────────────────────────────────┐
  browser ─────────► │ shell  (Next.js 16, App Router, :3000)    │
                     │  • server-renders layout + CMS content    │
                     │  • REST API  /api/sales  /api/customers   │
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

## Contentful

Set `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ACCESS_TOKEN` (in `apps/shell/.env.local`) and create an `announcement` content type with `title` and `body` fields. Without them, the page uses local fallback copy, and a CMS outage also falls back instead of breaking the page.

## Demo data

All data is generated from a seeded PRNG (`apps/shell/src/lib/seed.ts`), so it is identical on every run and safe to publish.

## Next steps

- Deploy: shell to Vercel, remotes to any static host/CDN, with URLs set per environment
- Contract tests between the shell and remote props
- Storybook for `packages/ui`
- Lighthouse CI budget on the shell
