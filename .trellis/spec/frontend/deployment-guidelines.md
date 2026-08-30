# Static Deployment Guidelines

> GitHub Pages, build-target, asset-origin, and manual release contracts for
> the KAF frontend.

---

## Current production target

The current public deployment target is:

```text
https://python-rust.github.io/kafu/
```

Repository-level GitHub Pages uses `/kafu/` as its public base path. Normal
local development and generic production builds continue to use `/`.

---

## Manual release contract

`.github/workflows/deploy-pages.yml` is the single production deployment
workflow.

Required behavior:

- `workflow_dispatch` is the only trigger;
- no push, pull-request, schedule, release, or repository-dispatch trigger;
- build and deploy are separate jobs;
- the deployment job targets the `github-pages` environment;
- deployment concurrency uses one `pages` group and does not cancel an
  in-progress production deployment;
- the workflow uses `GITHUB_TOKEN` plus Pages OIDC, not a personal token or
  repository secret.

The GitHub repository Pages source remains `build_type=workflow`.

---

## Toolchain and quality contract

- CI installs the versions already pinned by `mise.toml` through the reviewed
  `jdx/mise-action` release.
- Dependencies install with `pnpm install --frozen-lockfile`.
- `mise run check` completes before the Pages-specific build.
- The target build sets `VITE_BASE_PATH=/<repository-name>/` and runs
  `mise run build`.
- `scripts/verify_pages_workflow.py` verifies the manual-only trigger, immutable
  Action references, permissions, and required commands.
- `scripts/verify_pages_build.py` verifies artifact-root `index.html`, target
  base paths, same-origin HTML/CSS resources, file existence, JavaScript/CSS
  entry resources, the responsive Hero preload and all of its width candidates,
  and self-hosted WOFF2 output.

External GitHub Actions must be pinned to full 40-character commit SHAs. Keep a
release comment such as `# v6.0.0` beside each pin. Upgrading an Action requires
checking the repository release, resolving the release tag to its commit, and
updating the workflow verifier in the same change.

---

## Base-path and routing contract

`vite.config.ts` owns build-target base normalization through the optional
`VITE_BASE_PATH` environment variable:

```text
unset or /  -> /
/kafu/      -> /kafu/
```

Vite exposes the resolved target as `import.meta.env.BASE_URL`.
`BrowserRouter` receives a normalized basename from that value:

```text
/      -> /
/kafu/ -> /kafu
```

Do not hard-code `/kafu/` into component URLs or content. Vite imports continue
to own asset URL generation. A future custom domain can build with `/` without
rewriting the application.

---

## Static asset origin contract

The deployable page must render without fetching required assets from external
origins:

- images are Vite-managed local assets;
- tiny weak-network placeholders are inline WebP data URLs generated from those
  local assets and require no additional origin or request;
- the Hero uses one network-backed responsive image; portrait ambience reuses
  that image shell's inline placeholder rather than requesting a thumbnail;
- page-session loaded-state records are memory-only and keyed by build-hashed
  asset URLs plus responsive selection context, so no stale state persists across
  a deployment or browser session;
- Noto fonts are self-hosted WOFF2 build assets;
- application JavaScript and CSS are hashed Vite assets;
- Piapro, KAMITSUBAKI, Bilibili, YouTube, and social URLs are user-initiated
  outbound links only.

Do not move current images to OSS/CDN merely for GitHub Pages. The artifact is
well below Pages' size limit, and splitting media would add a second runtime
availability boundary.

---

## Release procedure

From the GitHub UI:

```text
Actions -> Deploy GitHub Pages -> Run workflow -> main
```

Equivalent GitHub CLI flow:

```bash
gh workflow run deploy-pages.yml --ref main
gh run list --workflow deploy-pages.yml --limit 1
gh run watch <run-id> --exit-status
```

After deployment:

- confirm the run conclusion is `success`;
- confirm the Pages API reports `build_type=workflow` and HTTPS enforcement;
- request the public URL and at least one hashed JS, CSS, image, and WOFF2
  resource;
- confirm the Hero preload and `srcset` candidates use `/kafu/assets/` and the
  page exposes no required external runtime resource;
- perform a browser smoke check at `/kafu/` and confirm no required external
  runtime resource requests.

---

## Rollback and failure behavior

- A failed build never reaches the deploy job.
- A failed deployment keeps the last successful Pages deployment available.
- Fix the source and manually rerun the workflow; do not commit `dist` or create
  a generated `gh-pages` branch.
- Never force-push `main` to deploy.
- Disabling Pages is a repository configuration operation and does not require
  deleting source or deployment history.

---

## Required review

Deployment changes must run:

```bash
mise run check
mise run e2e
VITE_BASE_PATH=/kafu/ mise run build
python3 scripts/verify_pages_build.py dist /kafu/
python3 scripts/verify_pages_workflow.py .github/workflows/deploy-pages.yml
```

Also verify the built site at `/kafu/` in a real browser because correct asset
paths alone do not prove that React Router's basename is correct.

