# Static Deployment Guidelines

> Cloudflare Pages, R2-backed runtime assets, root-hosted builds, and one-click
> manual release contracts for the KAF frontend.

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
Wrangler. Its production hostname is `kafu-8bd.pages.dev`. Run Pages commands
from the repository root so Wrangler discovers `wrangler.toml`; do not pass a
custom `--config` path because Pages rejects it.

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
  responsive Hero preload and all width candidates, zero bundled WebFonts, no
  provenance-only source images, at most 64 KiB entry CSS, at most 400 KiB
  entry JavaScript, and the generated WebP count/byte budget.
- Wrangler is an exact project devDependency and is executed through pnpm, so
  local releases and GitHub Actions use the same lockfile-controlled version.
- `pnpm-workspace.yaml` explicitly allows only Wrangler's required `esbuild`
  and `workerd` install scripts; do not broaden build-script approval without
  reviewing the new dependency and its install behavior.
- `mise run check` includes the avatar asset-lock/repository-policy verifier.
- The live production root, public avatar manifest, model HEAD response, and a
  four-byte model range request must pass before the workflow succeeds.

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
- after `window.load`, one page-owned low-priority queue warms browser-selected
  same-origin WebP candidates in Profile -> Journey -> Works -> Gallery order;
  it does not introduce a remote image service or download every responsive
  encoding;
- page-session loaded-state records remain memory-only and keyed by build-hashed
  asset URLs plus responsive selection context;
- typography uses installed system fonts and issues no font request;
- application JavaScript and CSS are hashed Vite assets;
- the 49,911,472-byte VRM is stored in the private `kafu-runtime-assets` R2
  bucket, but the browser reads it only through the versioned same-origin Pages
  Function path under `/assets/models/kaf/`;
- external media/social URLs remain user-initiated outbound links only.

Do not move current images to a separate CDN merely because the hosting provider
changed. Keeping required runtime assets same-origin avoids a second availability
boundary.

---

## R2-backed avatar asset contract

The KAF VRM is a large runtime asset, not a Pages static-build input:

```text
local-only source -> immutable R2 object -> private Pages binding
                  -> public same-origin Pages Function URL -> browser/download client
```

The executable contract is distributed across these checked-in owners:

- `src/content/kafAvatar.json` — canonical bucket, binding, object key, public
  path, byte size, SHA-256, poster metadata, and model identity;
- `src/content/kafAvatar.ts` — typed browser/Function projection and public
  manifest builder;
- `wrangler.toml` — Pages output directory plus `KAF_AVATAR_ASSETS` binding to
  `kafu-runtime-assets`;
  it must stay at the repository root because `wrangler pages deploy` does not
  support a custom `--config` path;
- `functions/assets/models/kaf/[[path]].ts` — exact-path public GET/HEAD proxy;
- `scripts/kaf-avatar/publish_vrm_to_r2.py` — local verification, additive
  upload, and streamed remote SHA-256 verification;
- `scripts/verify_avatar_assets.py` — lock, poster, binding, and no-large-Git-
  binary policy;
- `scripts/verify_production_avatar.py` — production root/manifest/HEAD/range
  smoke test.

Required rules:

- The VRM and Blender source remain under ignored `.local-assets/`; never commit
  `.vrm`, `.blend`, the authoring archive, or source textures to normal Git or
  Git LFS.
- Object keys and public URLs include a SHA-256 prefix. Content changes create a
  new key; do not overwrite a mutable `latest.vrm` object.
- The current object key is
  `avatars/kaf/fukuro-hatdown/5fe890c94a7af1e5/kaf-fukuro-hatdown.vrm`.
- The public route is
  `/assets/models/kaf/v1/kaf-fukuro-hatdown-5fe890c94a7af1e5.vrm`.
- The Function is intentionally public and supports GET, HEAD, and one byte
  range. It uses the private binding, streams bodies, rejects every unlisted
  path, and emits immutable caching, length, type, ETag, and range metadata.
- The public route may be linked from README and the generated JSON manifest so
  repository visitors can reproduce/download the deployed model. Public
  transport does not create a new downstream model license.
- Do not configure a public R2 hostname or frontend CORS dependency for this
  flow; the Pages route is the public boundary.

### Publication order

Model publication is separate from normal page deployment:

```bash
mise run avatar-publish
mise run avatar-verify
```

The safe release order is:

1. verify the local source against the lock;
2. create the bucket if absent and upload the immutable object;
3. stream the remote object back and verify byte size/SHA-256;
4. commit the lock/public-path change;
5. deploy Pages;
6. run the production manifest, HEAD, and `bytes=0-3` checks.

Never deploy code that references a new object key before that object has passed
remote verification. Normal web deployments do not re-upload the unchanged
model.

### Credentials

- Local model publication uses the authenticated Wrangler profile or an
  equivalent least-privilege R2 write credential outside Git.
- GitHub Actions continues to read `CLOUDFLARE_API_TOKEN` and
  `CLOUDFLARE_ACCOUNT_ID`; its token must be able to deploy the Pages project
  configuration containing the existing R2 binding.
- No R2 credential is exposed to browser code or stored as a Pages runtime
  secret; the Function receives the bucket through `wrangler.toml` binding.

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
- run `scripts/verify_production_avatar.py` and confirm the manifest, model HEAD,
  immutable cache metadata, allow-list 404, and `glTF` range probe;
- request representative hashed JavaScript, CSS, and image resources;
- confirm the Hero preload and `srcset` candidates remain same-origin under
  `/assets/`;
- perform a browser smoke check at `/` when deployment behavior itself changes.

---

## Rollback and failure behavior

- A failed quality/build/artifact check never reaches Wrangler deployment.
- Cloudflare keeps previous successful deployments available in deployment
  history if a later upload fails.
- R2 objects are immutable release inputs. Keep an old object while any deployed
  revision references it; rollback changes the Git-tracked lock/public URL and
  redeploys Pages rather than overwriting an object.
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
python3 scripts/verify_production_avatar.py https://kafu-8bd.pages.dev
```

Also perform a real production smoke check after changing the deployment path,
because valid static asset paths alone do not prove that the hosting endpoint is
serving the intended build.
