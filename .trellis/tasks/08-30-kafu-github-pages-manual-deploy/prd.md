# Deploy KAF site to GitHub Pages manually

## Goal

Publish the current Vite/React static site at
`https://python-rust.github.io/kafu/` through a GitHub Actions workflow that is
triggered only with `workflow_dispatch`. The deployed site must serve all
images, fonts, JavaScript, and CSS from the same GitHub Pages origin and remain
compatible with a repository subpath.

## Requirements

### R1. Manual-only deployment

- Add one workflow under `.github/workflows/`.
- The workflow trigger is only `workflow_dispatch`; no `push`, `pull_request`,
  `schedule`, or release trigger is allowed.
- Use a build job and a separate Pages deployment job.
- Use the `github-pages` environment, deployment concurrency, and the minimum
  required `GITHUB_TOKEN` permissions.

### R2. Reproducible build

- Install Node `24.19.0` and pnpm `11.21.0` from `mise.toml` through the pinned
  `jdx/mise-action` release.
- Install with `pnpm install --frozen-lockfile`.
- Run formatting, lint, unit tests, TypeScript checking, and the Vite
  production build before uploading the Pages artifact.
- Pin every external GitHub Action to a full commit SHA and annotate the release
  version in a comment.

### R3. GitHub Pages subpath support

- Build with the Pages project base path `/kafu/`.
- Configure `BrowserRouter` from Vite's `import.meta.env.BASE_URL` so the `/`
  application route works when the browser pathname is `/kafu/`.
- Local development and non-Pages builds keep `/` as the base path.
- The uploaded artifact contains `index.html` at its root and references assets
  under `/kafu/assets/`.

### R4. Repository and Pages configuration

- Enable the repository Pages site with `build_type=workflow`.
- Push the current completed `main` history and the deployment workflow to
  `origin/main` after fetching and confirming no remote-only commits exist.
- Trigger the workflow manually through `gh workflow run`.
- Monitor the workflow to completion and verify the public Pages URL.

### R5. Runtime independence

- Page rendering must not fetch images or fonts from Piapro, KAMITSUBAKI,
  Google Fonts, or another external CDN.
- External URLs may remain as user-initiated source/official links only.
- Do not introduce OSS, a separate media host, a custom domain, or a new runtime
  dependency.

## Acceptance Criteria

- [ ] GitHub Pages reports `build_type: workflow` and the URL
      `https://python-rust.github.io/kafu/`.
- [ ] `.github/workflows/deploy-pages.yml` has only `workflow_dispatch`.
- [ ] All five Actions are pinned to reviewed full SHAs.
- [ ] The workflow builds with `/kafu/`, uploads `dist`, and deploys through the
      official Pages artifact/deployment actions.
- [ ] `BrowserRouter` receives a normalized basename derived from
      `import.meta.env.BASE_URL`.
- [ ] A local Pages-mode build has a root `index.html`, `/kafu/assets/`
      references, and no runtime external asset URLs.
- [ ] `mise run check` and `mise run e2e` pass locally.
- [ ] `main` is pushed without force and has no local/remote divergence.
- [ ] The manual workflow completes successfully.
- [ ] The public URL returns HTTP 200 and renders the KAF homepage with local
      images and fonts.
- [ ] Deployment constraints and the manual release procedure are recorded in
      frontend SPEC/README documentation.

## Out of Scope

- Automatic deployment on every push.
- Custom domains, ICP filing, mainland-China CDN nodes, or OSS.
- Preview deployments for pull requests.
- GitHub Pages analytics or external monitoring.

