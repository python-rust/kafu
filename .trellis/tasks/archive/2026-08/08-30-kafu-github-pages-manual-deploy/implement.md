# Implementation plan

## Ordered work

1. Confirm repository visibility/admin access, GitHub CLI authentication, Pages
   state, remote divergence, build output, and runtime asset ownership.
2. Enable Pages with `build_type=workflow`.
3. Normalize `VITE_BASE_PATH` in Vite and provide the resulting
   `import.meta.env.BASE_URL` to `BrowserRouter`.
4. Add the manual-only Pages workflow with pinned checkout/mise/Pages Actions,
   exact tool versions from `mise.toml`, quality checks, Pages base build,
   artifact upload, and deploy job.
5. Add a Pages deployment test/verification script or test coverage that checks
   basename normalization and built asset paths without changing local routing.
6. Update README and frontend deployment SPEC with the manual command, URL,
   base-path contract, asset-origin contract, and rollback procedure.
7. Run `mise run check`, `mise run e2e`, and a local `/kafu/` production build
   audit.
8. Commit implementation and documentation/task evidence.
9. Fetch `origin`, confirm no remote-only commits, and push `main` without force.
10. Trigger the workflow with `gh workflow run`, watch it, inspect Pages API,
    and verify the public URL plus same-origin assets.
11. Archive the task and record the Trellis journal after the live deployment is
    verified.

## Validation commands

```bash
mise run check
mise run e2e
pnpm exec tsc -b --pretty false
pnpm exec vite build --base /kafu/
python3 scripts/verify_pages_build.py dist /kafu/
python3 .trellis/scripts/task.py validate \
  .trellis/tasks/08-30-kafu-github-pages-manual-deploy
git diff --check
git fetch origin
git rev-list --left-right --count origin/main...main
gh workflow run deploy-pages.yml --ref main
gh run watch <run-id> --exit-status
```

## Review gates

- Workflow has no implicit automatic trigger.
- No secrets or long-lived personal token are required; deployment uses
  `GITHUB_TOKEN` and OIDC.
- `dist/index.html` is the artifact root.
- Built HTML references `/kafu/assets/`, not `/assets/`.
- Router basename is `/` locally and `/kafu` for Pages.
- No remote image/font requests are introduced.
- Push is a normal fast-forward push; never force-push.

## Completion evidence

- Pages configuration was created through the GitHub API with
  `build_type=workflow`, HTTPS enforced, and public URL
  `https://python-rust.github.io/kafu/`.
- Local validation:
  - `mise run check`: passed, 8 Vitest files / 27 tests;
  - `mise run e2e`: passed, 14 Chromium tests;
  - Pages artifact verifier: 2 HTML entry resources and 198 CSS resources;
  - local `/kafu/` browser smoke: 46 same-origin resources, no external runtime
    requests, 8 responsive images, 40 loaded font faces.
- Git safety:
  - `git fetch origin --prune` completed;
  - `origin/main...main` was `0 30` before push;
  - `git push origin main` was a normal fast-forward from `68ffc5c` to
    `97107e1`.
- Manual deployment:
  - workflow run ID: `33307698551`;
  - event: `workflow_dispatch`;
  - source commit: `97107e11610e125575b25a5ccfc72333ba2adbc0`;
  - Validate and build: success in 35 seconds;
  - Deploy: success in 10 seconds;
  - run URL: `https://github.com/python-rust/kafu/actions/runs/33307698551`.
- Public verification:
  - root response: HTTP 200 with HTTPS/HSTS;
  - hashed JS and CSS: HTTP 200 with correct MIME types;
  - live browser path: `/kafu/`;
  - title/H1 rendered correctly;
  - no failed requests or browser console errors;
  - all observed runtime resources were same-origin and under `/kafu/`;
  - local WebP images and Noto WOFF2 fonts loaded successfully.

