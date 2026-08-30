# Implementation plan

1. Add deterministic regressions for unresolved `decode()`, cached remounts, and
   Journey revisits without loading-state flashes.
2. Add a narrow native loaded-resource/preload module and update
   `ResponsiveArtwork` to reveal on `load` and inspect cache before paint.
3. Replace the Hero ambience `<img>` with preserved inline placeholder
   ambience.
4. Refactor Journey into active narrative state plus loaded displayed-visual
   state; preload the requested and adjacent directional image at low priority.
5. Review request counts, responsive candidates, and cache behavior under slow
   network and normal cache.
6. Update media/quality/deployment SPEC and record the dependency review.
7. Run full validation, commit, push, manually deploy Pages, verify public
   behavior, archive, and journal.

## Validation commands

```bash
python3 scripts/generate_kaf_media_variants.py --check
mise run check
mise run e2e
VITE_BASE_PATH=/kafu/ mise run build
python3 scripts/verify_pages_build.py dist /kafu/
python3 scripts/verify_pages_workflow.py .github/workflows/deploy-pages.yml
git diff --check
python3 .trellis/scripts/task.py validate \
  .trellis/tasks/08-30-kafu-cached-artwork-reveal
```

## Review gates

- Hero must not depend on `decode()` settling.
- No second network-backed Hero ambience image.
- Existing first-load feedback must remain.
- Cached Journey transitions must never paint LQIP again.
- Pending first-time Journey transitions keep the old clear image visible.
- Adjacent Journey prefetch must remain absent before the first Scrollama step
  enters, even if the browser has already lazy-loaded the offscreen first image.
- No new runtime dependency unless the documented review changes materially.
- All public runtime images remain same-origin.

