# Technical design

## Deployment topology

```text
main branch
  -> manually run Deploy GitHub Pages
  -> checkout + pinned Node/pnpm
  -> quality checks
  -> Vite build with --base /kafu/
  -> upload dist as github-pages artifact
  -> deploy-pages to github-pages environment
  -> https://python-rust.github.io/kafu/
```

All runtime assets stay in the Vite artifact. Source/attribution links remain
external anchors but are not render dependencies.

## Base-path boundary

The default Vite base remains `/`. The Pages workflow passes:

```bash
vite build --base "/${{ github.event.repository.name }}/"
```

Vite then exposes `/kafu/` through `import.meta.env.BASE_URL`. `main.tsx`
normalizes the trailing slash and passes the value to `BrowserRouter.basename`:

```ts
const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';
```

This keeps local `/` routing and repository Pages `/kafu/` routing in the same
source tree. The workflow owns target-specific build configuration rather than
hard-coding GitHub Pages into normal builds.

## Workflow security and permissions

- `contents: read` is the workflow default.
- Only the deploy job receives `pages: write` and `id-token: write`.
- The deploy job uses the `github-pages` environment and the deployment URL
  output.
- External Actions are pinned to immutable SHAs corresponding to reviewed
  releases.
- Concurrency uses one `pages` group with `cancel-in-progress: false`, avoiding
  interruption of an in-flight production deployment.

## Reviewed Action releases

| Action | Release | Commit |
| --- | --- | --- |
| `actions/checkout` | `v7.0.1` | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| `jdx/mise-action` | `v4.2.5` | `3c2e0cf82a5b2e5249f0d3635a4d83d0ae861518` |
| `actions/configure-pages` | `v6.0.0` | `45bfe0192ca1faeb007ade9deae92b16b8254a0d` |
| `actions/upload-pages-artifact` | `v5.0.0` | `fc324d3547104276b827a68afc52ff2a11cc49c9` |
| `actions/deploy-pages` | `v5.0.0` | `cd2ce8fcbc39b97be8ca5fce6e763baed58fa128` |

## Failure and rollback

- A failed quality/build job never creates a deployment.
- A failed deployment leaves the last successful Pages version active.
- Re-run the same manual workflow after fixing the source; no deployment branch
  or generated files are committed.
- If Pages must be disabled, delete the Pages site through the repository Pages
  API; source history remains unaffected.

