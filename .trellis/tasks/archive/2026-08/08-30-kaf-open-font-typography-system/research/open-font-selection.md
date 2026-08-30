# Open font selection research

## Primary sources

- Noto CJK: `https://github.com/notofonts/noto-cjk`
- Noto Sans SC: `https://fontsource.org/fonts/noto-sans-sc`
- Noto Serif SC: `https://fontsource.org/fonts/noto-serif-sc`
- Fontsource self-hosting: `https://fontsource.org/docs/getting-started/introduction`
- Fontsource Unicode ranges: `https://fontsource.org/docs/getting-started/subsets`
- SIL OFL and FAQ: `https://openfontlicense.org/`
- Klee One: `https://github.com/fontworks-fonts/Klee`
- LXGW WenKai: `https://github.com/lxgw/LxgwWenKai`

## Findings

### Noto Sans SC / Noto Serif SC

- Both selected Fontsource packages declare OFL-1.1.
- Sans spans weights 100–900; Serif spans 200–900.
- The SC families cover Simplified Chinese plus Latin/punctuation used here.
- Fontsource provides versioned packages for self-hosting.
- Default variable CSS uses Unicode ranges and `font-display: swap`.

### OFL responsibilities

- OFL fonts may be used as webfonts and bundled with applications.
- Redistributed font software should retain copyright/license information.
- Static deployment therefore includes complete OFL text and a notice.

### Klee One

- OFL-licensed, with a quiet handwritten Japanese character.
- Reviewed Japanese assets are roughly 1.8 MB at 400 and 1.9 MB at 600.
- Rejected because Japanese labels are sparse and native Japanese Mincho
  fallbacks already preserve their language role.

### LXGW WenKai

- OFL-licensed and permits broad personal/commercial use.
- Upstream reserves `霞鹜/霞鶩`, `落霞孤鹜/落霞孤鶩`, and `LXGW`, and limits a
  same-name webfont subsetting exception to approved platforms unless the author
  confirms another platform.
- Rejected because no custom conversion/subsetting path is needed here.

## Decision

Use Noto Sans SC Variable and Noto Serif SC Variable from the application
origin. Preserve system Japanese Mincho fallbacks. Do not add a handwriting face
merely for decorative variety.

