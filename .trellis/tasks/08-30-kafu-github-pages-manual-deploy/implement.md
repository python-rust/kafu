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

