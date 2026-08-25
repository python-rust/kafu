# Design — KAF media and chronology source of truth

## 1. Ownership

This branch owns static KAF facts, media records, local KAF asset files, and durable provenance. It does not own presentation.

Expected change surface:

```text
src/content/kaf.ts
src/assets/kaf/ATTRIBUTION.md
src/assets/kaf/journey/**
src/assets/kaf/gallery/**       # only when a separate gallery grouping is useful
tests/KafContent.test.tsx      # or an equivalently unique focused filename
```

Preserve the current three assets and exports unless a verified reason requires replacement. Do not make the existing page fail merely because Wave 2 has not integrated the new records yet.

## 2. Data model

Use a stable typed model equivalent to:

```ts
export interface KafMedia {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  credit: string;
  sourceUrl: string;
  licenseSummary: string;
  licenseUrl: string;
  canModify: boolean;
  retrievedAt: string;
}

export interface KafJourneyMilestone {
  date: string;
  label: string;
  sourceUrl: string;
}

export type KafJourneyTheme =
  | 'origin'
  | 'observation'
  | 'rebuild'
  | 'expansion'
  | 'fable'
  | 'transcendent';

export interface KafJourneyChapter {
  id: string;
  period: string;
  yearLabel: string;
  titleJa: string;
  titleEn: string;
  summary: string;
  theme: KafJourneyTheme;
  milestones: readonly KafJourneyMilestone[];
  primaryVisual: KafMedia;
  secondaryVisual?: KafMedia;
}
```

Names may vary when a simpler compatible model is clearer, but all information above must remain available. Do not embed visual-layout coordinates or animation values into editorial content.

## 3. Fact verification

Use primary official sources in this order:

1. current KAF official history/profile/news/live/discography pages;
2. KAMITSUBAKI artist/discography/event pages;
3. official KAF special sites for the relevant release/live;
4. other sources only when a primary source cannot establish a non-critical detail.

Store concise fan-written summaries, not copied promotional paragraphs. Dates should use machine-readable values where useful and display-ready labels where the design needs them.

## 4. Asset acquisition and derivatives

Piapro candidates are discovery leads, not pre-approved assets. Reopen every candidate and inspect all displayed conditions at implementation time.

For compatible assets:

- prefer a published derivative sized for the page rather than committing a 10–30 MiB original;
- generate a derivative only when modification is allowed;
- preserve aspect ratio unless the license permits modification and the crop is deliberate;
- record every local transformation;
- retain enough resolution for the largest intended display without waste.

If no-modification applies, keep the downloaded file intact and expose dimensions so layout can avoid destructive treatment.

## 5. Provenance consistency

`ATTRIBUTION.md` and the shipping directory form one contract:

- every third-party image file has one entry;
- every entry points to an existing file;
- removed/replaced files update the record in the same commit;
- hashes are computed after the final committed derivative is produced;
- credit text is suitable for presentation children to render directly.

## 6. Test design

Focused tests should validate data invariants rather than implementation details:

- exactly six journey chapters in expected order;
- unique media/chapter IDs;
- non-empty titles/summaries/alt/credit/source/license fields;
- milestone source URLs use HTTPS;
- every chapter resolves a primary visual with positive dimensions;
- minimum visual/new-asset count is met;
- every imported media record maps to the expected local asset set.

Avoid filesystem test complexity when a straightforward exported manifest can make invariants testable.

## 7. Compatibility and rollback

This task is additive. If a candidate fails review, remove its content import, file, and provenance entry together. If the whole PR is reverted, the current homepage and its three existing assets remain functional.
