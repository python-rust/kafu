# Deployment evidence

## Commits

- implementation: `91bd7208ab6f575b767d28a2f76a0287198a7a09`
- SPEC and task documentation: `5f266b2933324a9be87314018296748c005334a1`

## GitHub Pages release

- workflow: `Deploy GitHub Pages`
- run: `33314071965`
- URL: `https://github.com/python-rust/kafu/actions/runs/33314071965`
- event: `workflow_dispatch`
- deployed SHA: `5f266b2933324a9be87314018296748c005334a1`
- validate/build job: success in 28 seconds
- deploy job: success in 8 seconds
- public URL: `https://python-rust.github.io/kafu/`

## Public Hero verification

Verified on the deployed site at 390×844, DPR 3 while replacing
`HTMLImageElement.decode()` with a Promise that never settles:

- one Hero network `<img>`;
- `data-artwork-status=loaded`;
- final image opacity `1`;
- current source is same-origin `kaihou-2x`;
- preserved inline ambience opacity `0.48`;
- after one second on the Hero, no `observation-past` Journey neighbor request;
- runtime resource origin is only `https://python-rust.github.io`;
- failed requests: 0;
- console errors: 0.

The public Hero image response was also deliberately delayed:

- before release: status `loading`, `aria-busy=true`, inline placeholder and
  `图片加载中` visible, image opacity `0`;
- after release: status `loaded`, `aria-busy` removed, image opacity `1`.

## Public Journey verification

All six Journey images were loaded in order, then revisited in reverse:

- audit states contained only `idle` and `loaded`;
- no `loading` state was recorded during cached revisits;
- final active/displayed index: `0` / `0`;
- stage status: `idle`;
- loading artwork shells: 0;
- displayed image opacity: `1`;
- failed requests: 0;
- console errors: 0.

## Validation

- media verification: 10 sources, 30 derivatives, 10 inline placeholders;
- Vitest: 9 files / 34 tests passed;
- Chromium Playwright: 16 tests passed;
- `mise run check`: passed;
- `mise run e2e`: passed;
- Pages artifact verification: passed with three responsive Hero preload
  candidates;
- workflow verification: manual-only trigger and five immutable Action pins;
- `git diff --check`: passed;
- Trellis context validation: passed.
