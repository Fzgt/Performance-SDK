# performance-sdk

Written in TypeScript. Captures Web Vitals and page-load timing breakdowns with device/network context, and reports data to a configurable backend based on priority.

## Usage

```ts
import PerfSDK from "performance-sdk";
new PerfSDK({
  logUrl: "https://your-backend/log", // required, throws if not provided
  captureError: true, // enable error capture
  resourceTiming: true, // capture resource load timing
  elementTiming: true, // capture key element render timing
  maxMeasureTime: 15000, // capture window duration, default 15s
  analyticsTracker: (opts) => {}, // custom data consumer, falls back to built-in implementation if not provided
});
```

The constructor is the entry point — instantiating with `new` starts collection immediately, no separate `start()` call needed.

## What it captures

**Web Vitals** — all based on `PerformanceObserver`:

| Metric   | Description                                    | Threshold source |
| -------- | ----------------------------------------------- | ----------------- |
| FP / FCP | First Paint / First Contentful Paint            | 1000 / 2500ms     |
| LCP      | Largest Contentful Paint                        | 2500 / 4000ms     |
| FID      | First Input Delay                               | 100 / 300ms       |
| CLS      | Cumulative Layout Shift                          | 0.1 / 0.25         |
| TBT      | Total Blocking Time (includes 5s / 10s / final segments) | 300 / 600ms |

Each metric is scored `good` / `needsImprovement` / `poor` via `helpers/vitalsScore.ts`, with thresholds sourced from [web.dev/vitals](https://web.dev/vitals/).

**NavigationTiming** — DNS lookup, TCP connection, TTFB, time to first paint, DOM parsing, load completion, and other stage-by-stage timings.

**Runtime environment context** — this is where the SDK gets more interesting: it doesn't just report numbers, it also reports *the conditions under which those numbers were measured*:

- Network: `downlink` / `effectiveType` / `rtt` / `saveData` from `navigator.connection`
- Device: `deviceMemory`, `hardwareConcurrency`, low-end device detection (`isLowEnd.ts`)
- Storage: offline cache usage via `navigator.storage.estimate()`

**Error monitoring** (enabled via `captureError: true`) — three sources, all reported at `IDLE` priority:

- Uncaught sync/async errors via `window.onerror`. The `Error` instance is serialised to `name` / `message` / `stack` first — `JSON.stringify` alone turns it into `{}`. A handler the host page installed earlier is chained, not overwritten.
- Resource load failures (e.g. a 404 image) via a capture-phase `error` listener on `window` — these never reach `window.onerror`.
- Unhandled promise rejections. Reported only; the SDK does not `preventDefault()` them, since swallowing them would hide the host app's own errors.

Source locations are resolved on the backend from the reported `scriptURI` / `lineno` / `colno`; see `examples/sourcemap`.

## Notable implementation details

**Report prioritisation** (`data/ReportData.ts`) — reports are tiered via `AskPriority`: `URGENT` uses `fetch(..., { keepalive: true })`, falling back to XHR if unsupported; `IDLE` reports during idle time. This is the standard approach for ensuring data gets sent out even as the page is being unloaded.

**Lifecycle management** (`performance/observe.ts`) — listens to `visibilitychange` and disconnects observers/finalises metrics when the page is hidden. Performance data needs to be settled before the page hides — waiting for `unload` is too late.

**Observer registration/teardown** (`performance/performanceObserver.ts`) — `po()` / `poDisconnect()` manage observer instances via the `perfObservers` array. The `longtask` observer for computing TBT is only registered after FCP fires, reflecting a dependency ordering between metrics.

## Build

```bash
yarn build          # microbundle, outputs ESM / CJS / UMD
yarn dev            # watch mode
yarn test           # jest unit tests
yarn typecheck      # tsc --noEmit
yarn example:run     # parcel serves examples/index.html
yarn api:run         # api-extractor generates API report
yarn api:doc         # typedoc generates docs to docs/
```

The `examples/` directory contains four examples: `performance` (performance capture), `error` (error capture), `sourcemap` (webpack + server-side source location resolution), and `playback` (rrweb recording playback — **not implemented, TODO only**).
