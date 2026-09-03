# Static Deployment Guidelines

> Cloudflare Pages, root-hosted builds, asset-origin, and one-click manual
> release contracts for the KAF frontend.

---

## Current production target

The public deployment target is:

```text
https://kafu-8bd.pages.dev/
```

The site is hosted from the origin root (`/`). Local development and production
builds therefore share the same public base path.

---

## Release model

`.github/workflows/deploy-cloudflare-pages.yml` is the single production
deployment workflow.

Required behavior:

- `workflow_dispatch` is the only trigger;
- push, pull-request, schedule, release, and repository-dispatch must not deploy;
- the job may release only when the selected ref is `main`;
- deployment concurrency uses one `cloudflare-pages` group and does not cancel
  an in-progress production deployment;
- one run performs validation, build, artifact verification, deployment, and a
  production HTTP smoke check.

This intentionally keeps release as an explicit one-click operation while
making everything after the click deterministic and automated.

---

## Cloudflare project and credentials

The Cloudflare Pages project is named `kafu` and uses Direct Upload through
Wrangler. Its production hostname is `kafu-8bd.pages.dev`.

GitHub Actions reads:

```text
CLOUDFLARE_API_TOKEN   repository Actions secret
CLOUDFLARE_ACCOUNT_ID repository Actions variable
```

The API token must be scoped to the owning account with Cloudflare Pages edit
permission. Never commit the token or place its literal value in workflow YAML,
scripts, logs, or documentation.

---

## Toolchain and quality contract

- CI installs the versions already pinned by `mise.toml` through the reviewed
  `jdx/mise-action` release.
- Dependencies install with `pnpm install --frozen-lockfile`.
- `mise run check` completes before deployment.
- `scripts/verify_static_build.py` verifies artifact-root `index.html`,
  same-origin HTML/CSS resources, file existence, JavaScript/CSS entries, the
  responsive Hero preload and all width candidates, and zero bundled WebFonts.
- Wrangler is an exact project devDependency and is executed through pnpm, so
  local releases and GitHub Actions use the same lockfile-controlled version.
- `pnpm-workspace.yaml` explicitly allows only Wrangler's required `esbuild`
  and `workerd` install scripts; do not broaden build-script approval without
  reviewing the new dependency and its install behavior.
- The live production root must return HTTP success before the workflow passes.

External GitHub Actions must be pinned to full 40-character commit SHAs. Keep a
release comment beside each pin. Upgrading an Action requires resolving and
reviewing the release tag before changing the pin and workflow verifier.

---

## Base path and routing contract

Production is root-hosted, so Vite uses its normal `/` base and React Router
uses its normal root routing. Do not add repository-name prefixes such as
`/kafu/` to component URLs, router configuration, or content.

Vite imports continue to own application asset URL generation. A future custom
domain should also remain root-hosted and should not require application code
changes.

---

## Static asset origin contract

The deployable page must render without fetching required assets from external
origins:

- images are Vite-managed local assets;
- weak-network placeholders are inline WebP data URLs generated from local
  assets and require no additional origin;
- the Hero uses one network-backed responsive image and its existing inline
  placeholder behavior;
- page-session loaded-state records remain memory-only and keyed by build-hashed
  asset URLs plus responsive selection context;
- typography uses installed system fonts and issues no font request;
- application JavaScript and CSS are hashed Vite assets;
- external media/social URLs remain user-initiated outbound links only.

Do not move current images to a separate CDN merely because the hosting provider
changed. Keeping required runtime assets same-origin avoids a second availability
boundary.

---

## Release procedure

From GitHub:

```text
Actions -> Deploy Cloudflare Pages -> Run workflow -> main
```

Equivalent CLI flow:

```bash
gh workflow run deploy-cloudflare-pages.yml --ref main
gh run list --workflow deploy-cloudflare-pages.yml --limit 1
gh run watch <run-id> --exit-status
```

After deployment:

- confirm the workflow conclusion is `success`;
- confirm `https://kafu-8bd.pages.dev/` returns HTTP success;
- request representative hashed JavaScript, CSS, and image resources;
- confirm the Hero preload and `srcset` candidates remain same-origin under
  `/assets/`;
- perform a browser smoke check at `/` when deployment behavior itself changes.

---

## Rollback and failure behavior

- A failed quality/build/artifact check never reaches Wrangler deployment.
- Cloudflare keeps previous successful deployments available in deployment
  history if a later upload fails.
- Fix the source and rerun the manual workflow; do not commit `dist` or create a
  generated deployment branch.
- Never force-push `main` to deploy.
- Removing or rotating the GitHub Actions token disables future releases without
  deleting source or deployment history.

---

## Required review

Deployment changes must run:

```bash
mise run check
mise run e2e
python3 scripts/verify_static_build.py dist
python3 scripts/verify_cloudflare_workflow.py .github/workflows/deploy-cloudflare-pages.yml
```

Also perform a real production smoke check after changing the deployment path,
because valid static asset paths alone do not prove that the hosting endpoint is
serving the intended build.
