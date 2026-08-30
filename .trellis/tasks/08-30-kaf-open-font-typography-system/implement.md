# Implementation plan

## Ordered work

1. Verify official Noto/Fontsource/OFL licensing and compare alternatives.
2. Install the two pinned Fontsource variable packages.
3. Import variable-face CSS once at the application root.
4. Update semantic font tokens and tune display tracking/numeric roles.
5. Add third-party notice and deployable OFL text.
6. Add browser assertions for computed roles, loaded faces, same-origin
   resources, transfer budget, and license access.
7. Run the full unit/build/browser matrix.
8. Update frontend typography SPEC.
9. Commit implementation, commit docs/SPEC, archive, and journal.

## Validation

```bash
mise run check
mise run e2e
python3 .trellis/scripts/task.py validate \
  .trellis/tasks/08-30-kaf-open-font-typography-system
git diff --check
```

## Review gates

- `package.json` adds only the two selected font packages.
- No remote font URL exists in production source.
- Font CSS is imported once.
- Japanese proper names retain a Japanese-first fallback stack.
- Performance is measured from production preview rather than package size.
- 320px, mobile viewport, and 200% typography tests remain green.

## Completed evidence

- Fontsource packages pinned at 5.3.0.
- Production preview measured 40 same-origin WOFF2 requests and 2,387,612
  transferred bytes.
- Klee One and LXGW WenKai were reviewed but not added.
- Complete OFL text is included under `public/font-licenses/`.

