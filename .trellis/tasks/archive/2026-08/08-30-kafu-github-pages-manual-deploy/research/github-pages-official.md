# GitHub Pages deployment research

## Official requirements

- GitHub Pages supports public repositories on GitHub Free.
- A custom Actions workflow is the recommended publishing source when a site
  requires a non-Jekyll build such as Vite.
- The Pages artifact must contain its entry `index.html` at the artifact root.
- The deploy job requires `pages: write`, `id-token: write`, a dependency on the
  build job, and the `github-pages` environment.
- `workflow_dispatch` only becomes runnable after the workflow exists on the
  default branch.

Official references:

- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions#onworkflow_dispatch
- https://github.com/actions/configure-pages
- https://github.com/actions/upload-pages-artifact
- https://github.com/actions/deploy-pages

## Repository findings

- Repository: `python-rust/kafu`, public, default branch `main`.
- Authenticated GitHub CLI account: `python-rust`, repository permission
  `ADMIN`, token includes `workflow`.
- Pages was initially absent (`GET /pages` returned 404) and was enabled through
  `POST /repos/python-rust/kafu/pages` with `build_type=workflow`.
- Resulting Pages URL: `https://python-rust.github.io/kafu/`.
- Current site assets and fonts are local Vite imports. External URLs in
  `src/content/kaf.ts` are outbound source/official links only.
- Current production artifact is roughly 17 MiB, far below Pages' 1 GiB site
  limit.

## Decision

Use the official GitHub Pages artifact pipeline, a repository-relative Vite
base, a router basename derived from Vite, and the project's existing mise
toolchain through `jdx/mise-action@v4.2.5`. Do not create a `gh-pages` branch,
commit `dist`, add OSS, or add a separate runtime deployment dependency.

## Live result

The first manual workflow run (`33307698551`) completed successfully on
2026-08-30. GitHub Pages returned HTTP 200 at
`https://python-rust.github.io/kafu/`; browser inspection observed only
same-origin `/kafu/` runtime resources, including local WebP images and Noto
WOFF2 fonts.

