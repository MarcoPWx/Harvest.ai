# Performance & Bundling Guide (Storybook + Next.js)

This guide explains how to profile and optimize bundle size for both Storybook (Vite builder) and your Next.js app, with practical steps, scripts, and acceptance criteria.

## Quick scripts

- Storybook profile (timings):
  - npm run storybook:profile
- Storybook bundle visualization (Vite):
  - npm run storybook:analyze
  - Output: storybook-visualizer.html at repo root (open in a browser)
- Optional vendor splitting (manual chunks):
  - npm run storybook:split
  - npm run storybook:analyze:split

Note: The analyzer is loaded via vite-plugin-visualizer only when ANALYZE=1. If you see a warning about the plugin not being installed, run:

- npm i -D vite-plugin-visualizer

## What to look for

- Largest modules and chunks in the visualizer (storybook-visualizer.html)
- Common vendor chunk size (react, react-dom, radix-ui, lucide-react, framer-motion)
- Duplicated libraries or polyfills
- Any single story importing large demo-only data/visuals by default

## Typical optimizations

0. Tree-shaking basics (quick theory)

- Tree-shaking removes unused code from ESM modules during bundling.
- Prefer named imports (import { X } from 'lib') over namespace imports (import \* as Lib) to maximize tree-shaking.
- Avoid dynamic require patterns or side-effectful module bodies that block shaking.

1. Tree-shakeable imports

- lucide-react: Prefer named imports (already used). Avoid `import * as Icons`.
- @radix-ui/react-icons: Import only the icons you use.

2. Lazy-load heavy demos (Storybook only)

- Convert heavy or rarely used showcase components into dynamic imports so they don’t inflate initial Storybook vendor chunk:

```tsx path=null start=null
// Example (in a .stories.tsx)
const HeavyDemo = React.lazy(() => import("./HeavyDemo"));

export const Playground = () => (
  <React.Suspense fallback={<div>Loading…</div>}>
    <HeavyDemo />
  </React.Suspense>
);
```

3. Code splitting in app and Storybook

- For Storybook: Use dynamic imports in stories where appropriate (like Swagger UI, which is already dynamically imported).
- For Next.js app: Use `next/dynamic` for rarely used panels or admin-only views.

4. Image assets

- Prefer SVG for simple icons/illustrations.
- Ensure large images are not imported synchronously in stories; load them on-demand.

5. Dependency hygiene

- Remove dead dependencies and duplicates.
- Prefer smaller alternatives when functionality overlaps.

## Verifying improvements

### What manual chunks do (Vite + Rollup)

- By default, Vite creates chunks automatically (one per page/entry plus vendor chunks).
- Manual chunking lets you group libraries into stable vendor chunks for cache longevity, e.g., vendor-react, vendor-motion, vendor-lucide.
- We enabled a gated manual chunk strategy in .storybook/main.ts (viteFinal) that activates when SPLIT_CHUNKS=1 is set. This purposely avoids affecting default dev builds.

### Steps

- Baseline: Run npm run storybook:analyze and record the initial total JS payload and top 5 modules.
- Action: Apply one optimization at a time (e.g., lazy-load a heavy demo).
- Verify: Re-run npm run storybook:analyze and compare.
- Acceptance: 20–30% reduction of initial Storybook JS payload, or ≥150KB shaved from the main vendor chunk, with no regressions.

## CI integration (optional)

- Add a dedicated job to run ANALYZE=1 (and optionally SPLIT_CHUNKS=1) so artifacts include storybook-visualizer.html for inspection.
- If you adopt manual chunks, ensure the list matches the most stable vendors to maximize caching benefits.

- Add an ANALYZE build in CI to produce and upload the analyzer report as an artifact (skip for normal PRs if it slows the pipeline):
  - Run: ANALYZE=1 npm run build-storybook
  - Upload `storybook-visualizer.html` as an artifact
- Emit a small JSON with bundle stats and show it in the Status Dashboard (future enhancement)

## Troubleshooting

- Analyzer missing: If npm run storybook:analyze warns about vite-plugin-visualizer, install with `npm i -D vite-plugin-visualizer`.
- Vite/Storybook cache: Clear `.turbo/` and Storybook caches if you suspect stale results.
- Unexpectedly large lucide-react: Audit imports; ensure only named imports, not wildcard.
- Framer-motion size: Consider dynamic imports for pages that showcase intensive animations.

## Next targets (suggested)

- Evaluate if any doc/demo pages can be split out via dynamic import.
- Bundle split guidance: keep React and core UI vendors together, but isolate demo-heavy libraries in their own chunks when feasible.
- Consider a perf budget in CI (e.g., fail if main vendor > X KB gzipped) once you’ve stabilized the current baseline.

---

## What is a CI artifact? (and “on‑demand” artifacts)

- A CI artifact is just a file (or folder) produced during a workflow run and uploaded by CI for you to download later (e.g., HTML reports, coverage, screenshots).
- “On‑demand” means we only generate/upload that artifact when explicitly requested (to save CI time on every PR). For example, we can have a manual job that builds Storybook with ANALYZE=1 and uploads `storybook-visualizer.html`.
- How to use (GitHub Actions):
  - Trigger the manual workflow (workflow_dispatch) from the Actions tab → select the “Analyze Storybook Bundle” job → Run workflow.
  - After the run completes, open the run details → Artifacts → download `storybook-visualizer.html`.

Example workflow (suggested, not required):

```yaml path=null start=null
name: Analyze Storybook Bundle (on-demand)

on:
  workflow_dispatch:
    inputs:
      split:
        description: "Enable manual vendor chunk splitting (SPLIT_CHUNKS=1)"
        required: false
        default: "false"

jobs:
  analyze-storybook:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - name: Build Storybook (analyze)
        env:
          ANALYZE: "1"
          SPLIT_CHUNKS: ${{ github.event.inputs.split == 'true' && '1' || '' }}
        run: npm run build-storybook
      - name: Upload analyzer report
        uses: actions/upload-artifact@v4
        with:
          name: storybook-visualizer
          path: storybook-visualizer.html
```

This job does nothing by default; you run it when you want a bundle report. It avoids slowing down every PR.

---

## Deployment notes (Vercel / Supabase)

- Vercel: Your Next.js application is built and deployed by Vercel using `next build` (we’re using `--turbopack`). The SPLIT_CHUNKS setting we added only applies to Storybook’s Vite build, not your Next.js production build. To apply lazy loading in the app, prefer `next/dynamic` and client-only `React.lazy` where appropriate.
- Supabase: This setup is orthogonal to bundling. Keep server secrets on the server and only expose `NEXT_PUBLIC_` variables to the client. Bundling/treeshaking won’t leak server-only secrets if you avoid importing server files from client modules.
- Storybook hosting vs analysis: This on-demand analyzer workflow does not deploy anything to Vercel. It only builds a static Storybook and uploads the analyzer report as artifacts to GitHub Actions for download.

## Security & Access

- Storybook privacy: We do not deploy Storybook publicly. The static Storybook build and the analyzer HTML are produced only as CI artifacts and are downloadable only by people with access to this repository.
- Analyzer scope: The analyzer report (storybook-visualizer.html) contains bundle metadata, not application secrets. It is safe to share internally but should remain inside your org.
- Chromatic (optional, off by default): Chromatic is a hosted Storybook + visual testing service by the Storybook team. It takes snapshots of your stories, compares them across commits (visual diffs), and provides a review UI. If you decide to use it later, configure a private project with org/team authentication and run it only on demand. In this repo, it is disabled unless you set CHROMATIC_PROJECT_TOKEN in GitHub Secrets.
- Secrets handling: Keep tokens (e.g., Chromatic token) in GitHub Secrets. Do not commit tokens to the repo or echo them in logs. Only expose client-intended values with NEXT*PUBLIC* prefixes.
- Vercel & Supabase: Nothing in these performance steps exposes new endpoints. The app deploys normally on Vercel (Next.js build). Supabase keys used server-side remain server-only.

## Hands‑on learning path (exercises)

1. Baseline and visualize

- Run: `npm run storybook:analyze`
- Open: `storybook-visualizer.html`
- Note the total JS size and top 5 largest modules/chunks.

2. Try vendor splitting

- Run: `npm run storybook:analyze:split`
- Compare the chunk graph (e.g., vendor-react, vendor-motion). Did it make chunk boundaries clearer or cache-friendlier?

3. Lazy-load a heavy demo

- Open Storybook → Docs/Performance & Bundling → “Lazy-loaded EcosystemWidget” story.
- Inspect the analyzer before/after adding more lazy demos (optional): move rarely used demos to React.lazy or `next/dynamic`.

4. Tree-shaking sanity check

- Ensure icon imports are named (e.g., `import { Sparkles } from 'lucide-react'`).
- Avoid `import * as Icons from 'lucide-react'` patterns.

5. CI artifact (optional)

- When you want a shareable HTML report, run the “Analyze Storybook Bundle (on-demand)” workflow (if added) and download the artifact from the run page.

By following these steps, you’ll understand where the bytes come from, how to move demos behind dynamic imports, and how manual chunks can improve cacheability.
