# Performance ledger — 26 November 2026

## Measured problem
`npm run build` reported a 737.55 kB initial bundle against a 500 kB warning budget.
`app.routes.ts` imported all four page components eagerly, including their Material dependencies.

## Experiment
Replace static page imports with route-level `loadComponent` and dynamic imports.
Keep the root redirect, guard on all employee routes, and Add-before-ID route ordering.

| Measurement | Initial raw bundle | Estimated transfer | Result |
| --- | ---: | ---: | --- |
| Before | 737.55 kB | 160.47 kB | Budget warning |
| After lazy routes only | 303.45 kB | 82.80 kB | No budget warning |
| After session-storage error handling | 303.64 kB | 82.82 kB | No budget warning |

Verdict: keep. Initial raw bundle decreased by about 59%; no budget thresholds changed.
The same production build command was used before and after.

## Guards and limitations
- Four configuration tests check that page routes remain lazy; three check employee guards.
- Routing tests exercise login, Add route precedence, and list → detail → OK.
- The total code across lazy chunks is not reduced by 59%; code is requested on demand.
- No LCP/INP/RUM measurements or network throttling benchmarks were collected.
- No new dependency or custom cache was added.
