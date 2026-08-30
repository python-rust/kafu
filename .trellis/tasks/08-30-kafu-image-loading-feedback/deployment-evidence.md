# Deployment evidence

## Commits

- implementation: `377b0950d8b6fbeb99f13eb847aba350bf07ac72`
- SPEC / task planning: `39d774df3e45b6d245b653a656a775b22817d092`

## GitHub Pages release

- workflow: `Deploy GitHub Pages`
- run: `33310483344`
- URL: `https://github.com/python-rust/kafu/actions/runs/33310483344`
- event: `workflow_dispatch`
- deployed SHA: `39d774df3e45b6d245b653a656a775b22817d092`
- validate/build job: success in 27 seconds
- deploy job: success in 10 seconds
- public URL: `https://python-rust.github.io/kafu/`
- public HTML last modified: `2026-08-30T12:04:20Z`

## Public browser verification

Verified at 390×844 with DPR 3:

- Hero current source: same-origin `kaihou-2x` candidate;
- `狂想β` current source: same-origin `kyousou-beta-high` candidate;
- `狂想β` candidate set: 480 / 800 / 1600 widths;
- bottom media disclosure: `图片来源（10 项）`;
- runtime resource origins: only `https://python-rust.github.io`;
- failed requests: 0;
- console errors: 0.

The live Hero request was then deliberately delayed through Playwright routing:

- before response: `data-artwork-status=loading`, `aria-busy=true`, inline
  WebP placeholder present, and `图片加载中` visible;
- after release/decode: `data-artwork-status=loaded` and `aria-busy` removed.

## Validation

- media verification: 10 sources, 30 derivatives, 10 inline placeholders;
- Vitest: 9 files / 30 tests passed;
- Chromium Playwright: 15 tests passed;
- `mise run check`: passed;
- `mise run e2e`: passed;
- GitHub Pages artifact verification: 3 responsive Hero preload candidates;
- workflow verification: manual-only trigger and five immutable Action pins;
- `git diff --check`: passed;
- Trellis context validation: passed.
