# Implementation plan

## Ordered work

1. Extend the media generator to encode a tiny inline WebP placeholder from each
   existing thumbnail and regenerate the typed metadata only.
2. Add `placeholderDataUrl` to production media contracts and test fixtures.
3. Refactor `ResponsiveArtwork` into a one-image progressive shell with cached,
   loaded, and error handling plus reduced-motion-safe CSS.
4. Change responsive candidates to width descriptors and add explicit `sizes`
   and priority hints for Hero, Profile, Journey, Works, and Gallery roles.
5. Add the verified official `狂想β` cover through the source-native derivative
   path and update provenance/content/source-index contracts.
6. Add component tests for loading/cached/error behavior and browser tests for
   delayed-image feedback, candidate selection, priorities, and layout
   stability.
7. Run the media check, full local quality gate, E2E suite, Pages build/workflow
   verification, and a local `/kafu/` preview audit.
8. Update media and quality SPEC, commit implementation and documentation, push
   `main`, manually deploy GitHub Pages, verify the public site, record evidence,
   archive, and journal.

## Validation commands

```bash
python3 scripts/generate_kaf_media_variants.py --check
python3 scripts/verify_pages_workflow.py .github/workflows/deploy-pages.yml
VITE_BASE_PATH=/kafu/ mise run build
python3 scripts/verify_pages_build.py dist /kafu/
mise run check
mise run e2e
python3 .trellis/scripts/task.py validate \
  .trellis/tasks/08-30-kafu-image-loading-feedback
git diff --check
```

## Review gates

- Confirm inline placeholders add no runtime origin or request.
- Confirm one semantic `<img>` remains per artwork.
- Confirm all ten source records and 30 derivatives pass manifest verification.
- Confirm 390px/DPR3 no longer selects a 3440px Hero.
- Confirm the Hero remains the only eager/high-priority image.
- Confirm loading feedback is visible under delayed responses and does not flash
  persistently on cached images.
- Confirm reduced motion disables the indeterminate animation.
- Confirm no image source/provenance URL changes.
- Confirm the new `狂想β` cover is the reviewed official source, uses only
  source-native technical derivatives, and is present in the bottom index.
- Confirm the GitHub Pages workflow remains manual-only.

## Commit plan

1. `perf: improve weak-network artwork loading`
2. `docs: define weak-network image delivery contracts`
3. deployment-evidence commit if required
4. Trellis archive commit
5. Trellis journal commit

