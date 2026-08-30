# okuda — Table Audit (sparse → crowded)

Each section states **what you should see**, then renders a table live. The configurations walk from sparse to crowded — the territory loose tables are meant to fix. Read the rendered output against the stated expectation. Where loose rows help, note it; where they make a crowded table into a *tall* crowded table, note that too.

Run `okuda docs/tables.md --tui` (or `just tables`). The real test is at **two terminal widths**: narrow (~80) and wide (~140). A 5-column table is crowded at 80 and sparse at 140 — the loose-rows judgement shifts with width. Resize and re-read.

---

## 1. Sparse — 2 cols, 2 rows, short cells

**Should see:** airy, readable, the grid header reads as a table. Loose rows add whitespace; nothing to overcrowd.

| Key | Value |
| --- | --- |
| name | okuda |
| kind | viewer |

## 2. Dictionary — 2 cols, many rows, short key / medium value

**Should see:** the first-column amber bold reads as a key column. Loose rows let the eye walk key→value. The grid header brackets it.

| Flag | Effect |
| --- | --- |
| `--tui` | alternate-screen viewport + Gloam footer |
| `--no-color` | strip ANSI; plain text for pipes and logs |
| `--watch` | re-render on file change (streaming, no footer) |
| `--width N` | override detected terminal width |

## 3. Aligned — 3 cols, left / centre / right

**Should see:** alignment carried through — `L` left, `C` centred (spaces both sides), `R` right (leading space). The `│` separators sit between header cells; body uses the 3-space gutter aligned underneath.

| L | C | R |
| :--- | :---: | ---: |
| left | centre | right |
| a | bb | ccc |
| 1 | 2 | 3 |

## 4. Moderate — 4 cols, 4 rows, mixed-width cells

**Should see:** the typical case. Header grid cues the columns; loose rows separate the records. First column amber, others default.

| Element | Channel | Role | Hex |
| --- | --- | --- | --- |
| heading | structural | purple bold | `#bd93f9` |
| strong | emphasis | orange bold | `#ffb86c` |
| emphasis | emphasis | yellow italic | `#f1fa8c` |
| code | inline | green | `#50fa7b` |

## 5. Wide — 5 cols, long cell content (forces width-shrink)

**Should see:** the table fits the terminal width (never overflows). The widest columns shrink to a proportional budget; long cells wrap in-cell. This is where loose rows meet overcrowding — does the whitespace help you scan, or does the wrapped table just get taller? (Generic tables only — a jump-wired menu table role-fits instead: number far right, callsign stable, slug truncates then suppresses. ADR-022; `just jump-demo` shows that path.)

| Name | Kind | Width | Colour | Notes |
| --- | --- | --- | --- | --- |
| heading | structural | full | purple bold | the scan path Glow users know |
| strong | emphasis span | inline | orange bold | bold distinguishes, colour carries signal |
| emphasis | emphasis span | inline | yellow italic | the slant is the signal, colour reinforces |
| code | inline span | inline | green no-bg | background dropped, colour is the signal |
| link | inline span | inline | rose + cyan | text in rose, URL shown inline in cyan |

## 6. Crowded — 6 cols, short cells, many rows

**Should see:** the overcrowded case loose tables are meant to fix. At narrow width the columns fight for space; at wide width they breathe. Does the loose-row spacing relieve the crowding, or does a 6-column table stay crowded regardless? This is the test of the hypothesis.

| a | b | c | d | e | f |
| --- | --- | --- | --- | --- | --- |
| 1 | 2 | 3 | 4 | 5 | 6 |
| 7 | 8 | 9 | 10 | 11 | 12 |
| 13 | 14 | 15 | 16 | 17 | 18 |
| 19 | 20 | 21 | 22 | 23 | 24 |
| 25 | 26 | 27 | 28 | 29 | 30 |

## 7. Crowded + long cells — 6 cols, mixed width, few rows

**Should see:** the worst case for width-fit. Six columns, some with long content, forcing both shrink and in-cell wrap. The header grid and the full-width rules are the only things holding it together as a table. Watch whether the loose rows help or just stretch a broken layout vertically.

| id | name | type | status | owner | notes |
| --- | --- | --- | --- | --- | --- |
| 1 | renderer | module | shipped | ses_a66534 | the render plane, brief 002/003 |
| 2 | tui | module | shipped | ses_d0509c | control plane, brief 006 |
| 3 | palette | config | converged | ses_d0509c | glow-CLI Dracula, ADR-006 |

## 8. Single data row — degenerate

**Should see:** a header plus one row. The grid header + closing rule still bracket it as a table. Loose rows are moot (one row). Does the full-width rule under a single row read as a table or as an underline?

| Element | Status |
| --- | --- |
| tables | in audit |

## 9. Header only — no data rows

**Should see:** a header and a rule, nothing else. The degenerate case. Does it read as an empty table or as a stray header?

| Column | A | B | C |
| --- | --- | --- | --- |

## 10. All long cells — 3 cols, paragraph-length content

**Should see:** every cell wraps in-cell. The table becomes a grid of paragraphs. Loose rows separate the "records," but each record is tall. This is where loose rows either shine (records are visually grouped) or fail (the table is a wall of text either way).

| Section | What it tests | What to watch |
| --- | --- | --- |
| sparse | the airy end — 2 cols, short cells | does loose add value when there's nothing to overcrowd? |
| crowded | the overloaded end — 6 cols, many rows | does loose relieve crowding or just stretch it vertically? |
| wide | the width-fit stress — 5 cols, long cells | does in-cell wrap + loose rows read as records or as noise? |

---

## What to judge

After reading all ten at both widths, the questions:

1. **Do loose rows help at the crowded end?** If a 6-column table is crowded with or without loose rows, the thing may not be earning its keep — a tight grid (glow-faithful) might read better.
2. **Do loose rows help at the sparse end?** If they just add vertical space to a 2-row table, they're ceremony.
3. **Does the grid header hold at every width?** The `│` separators and full-width rules are the new addition — do they read as a table at 6 columns and at 2?
4. **Does the 3-space gutter keep columns aligned?** Body cells should sit under their header cells, not drift.

Where the answers surprise, that's a brief.
