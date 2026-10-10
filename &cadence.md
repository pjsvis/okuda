# &cadence — the spine's tempo

An **entropy indicator**, not a velocity dashboard. It measures the coherence
between intent and product over time: a brief is a claim about what should
exist; the Thing that cites it is what exists; the lag between them is the
window in which the two can disagree. **Stretched**, the brief outlives its
context — *the stale ledger, misleading confidently*. **Compressed**, arrivals
outrace intake — **Mercury tempo**. Good is a **band**, and both ends of it
already have names.

We do not track it. There is no store and no trend. It is derived from the
corpus's own claims — the filename dates the registries mirror and the callsign
citation graph — never git, because a file's date is a *claim* and a committer
timestamp is a host *observation* (`date-lint`; `reg-sync`). It is **shown**,
read, and after a while it will mean something or not; both are results.
Ranking on it would make it benchmaxxing, so no one does.

Regenerate: `just cadence`. The region below is derived and overwritten; the
prose above is the editor's.

<!-- cadence:begin (derived — do not hand-edit) -->

*Derived by `scripts/cadence.ts --write`; do not hand-edit. Regenerate: `just cadence`.*

**Instrument:** `briefs/INDEX.jsonl`, `debriefs/INDEX.jsonl`, `decisions/INDEX.jsonl`, `playbooks/REGISTRY.jsonl`, `advisories/INDEX.jsonl`, `.archive/briefs/INDEX.jsonl` — plus the callsign citation graph over 434 scanned documents.

### Tier cadence (by claimed date)

| Tier | Docs | Span | Rate |
|---|---|---|---|
| briefs | 97 | 2026-08-25 .. 2026-10-10 | ≈ 14.8/wk |
| decisions | 59 | 2026-08-20 .. 2026-10-10 | ≈ 8.1/wk |
| debriefs | 42 | 2026-08-20 .. 2026-10-10 | ≈ 5.8/wk |
| playbooks | 19 | 2026-08-20 .. 2026-10-10 | ≈ 2.6/wk |
| advisories | 6 | 2026-09-05 .. 2026-09-30 | ≈ 1.7/wk |
| .archive/briefs | 42 | 2026-08-20 .. 2026-10-08 | ≈ 6.0/wk |

### Brief latency (brief date → the date of the Thing that cites it)

n=79 · min 0d · median 0d · p90 18d · max 35d

### Derivation coverage (a decision/debrief citing a brief)

| Tier | Citing | Coverage |
|---|---|---|
| decisions | 32/59 | 54% |
| debriefs | 23/42 | 55% |

### In flight (briefs not settled)

open 81 · parked 10

**What would give this meaning:** a band in the latency line, stable over weeks — or nothing. Both are results.

<!-- cadence:end -->
