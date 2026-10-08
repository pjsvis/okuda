---
type: Debrief
callsign: DBF-OS-UPGRADE
---

# Debrief: The OS upgrade — one stale page hash, and two lessons the silo already held

**Date:** 2026-09-21
**Status:** Shipped for the signature — `ADR-BUILD-SIGNS-040` landed, `build` compiles then re-signs then verifies, `check` verifies, `scripts/signature-check.sh` is the instrument. Open: two further defects reported and not fixed (the diagram-swallow at `src/render.ts:155-160`; `facade-lint.sh`'s silent exit 1), and nothing is committed — the branch is `docs/ornament-that-pays-rent`, `main..HEAD` is 42 commits.

## Accomplishments

- **The diagnosis, and it was not the available one.** `bun build --compile` emits a
  Mach-O whose adhoc, linker-signed `CodeDirectory` carries **one stale page hash** —
  slot 15,498 of 15,499, the only *partial* page, 672 bytes at the tail of the
  `__LINKEDIT` symbol string table. macOS arm64 requires a valid signature and SIGKILLs
  the process on exec: exit 137, zero bytes, no message. `zsh: killed` is that.
- **Four controls, two of which mislead.** As emitted → invalid signature → **exit 137**.
  Re-signed → valid → exit 0. Signed then +1 byte → *failed strict validation* → **exit 0**.
  Signature stripped → *not signed at all* → **exit 137**. Row 3 falsified "trailing data";
  row 4 falsified "only a broken signature is fatal".
- **The cause, dated, from the record rather than from argument.** macOS 27.0 installed
  **2026-09-20 16:29** (`system_profiler SPInstallHistoryDataType`); the binary was built
  2026-09-16 and its mtime never moved; `bun` 1.4.0 since 2026-08-20, unchanged; and
  `tmp/reload-cost-probe.py` ran that exact binary **twenty times on 2026-09-19** with
  the row count recorded as **320** in `BRF-GLOAM-OWNS-LOOP`. Same bytes, ran under
  26.6.2, killed under 27.0 — **the OS was the only variable.**
- **The fix landed, not just recorded.** `ADR-BUILD-SIGNS-040`. `just build` is now
  compile → `codesign --force --sign -` → `signature-check.sh`; `just check` runs
  `signature-check.sh` first; `scripts/signature-check.sh` is new and runnable without
  `just`; `DEPENDENCIES.md` gains a `codesign` row and a `--compile` signature section
  beside the existing columns=0 one.
- **The instruments.** `tmp/macho-signature-probe.py` (verifies every page hash and
  prints the mismatching *indices*, not a count); `scripts/signature-check.sh` (the gate);
  the `macho-signature-triage` skill (the reusable procedure, with the probe inline).
- **A second silent failure found while checking the first one's document.** A failed
  mermaid render produces **nothing** — no diagram, no fallback caption, no warning,
  exit 0 — because `src/render.ts:149` pipes the child's stderr and never reads it,
  `:155` checks the exit code and discards the reason, and `:160` returns `""`.

## Problems

- **I attributed the SIGKILL to my own sandbox, and that was wrong.** It was the first
  explanation I reached for and the most available one. What falsified it was the
  reader's terminal reproducing `zsh: killed` — not any probe of mine. All verification
  before that point had been routed through `bun run src/cli.ts` to dodge a problem that
  was not there.
- **I claimed mermaid was broken silo-wide. Wrong, twice over.** `~/.local/bin/mermaid-tui`
  is installed and works. `mermaid-to-md` exits **1**, not 0 — the "exits 0" reading came
  from `... | head -20; echo "exit=$?"`, which reports **`head`'s** status. The wrong
  version was written into a skill and into a landed note before the reader's one-line
  remark about the OS upgrade prompted a re-measure.
- **The same pipe mistake had already been made earlier in the session**, in the
  `facade-lint.sh` diagnosis, and I wrote the lesson into the skill — then repeated it.
  Two instances, one session.
- **I re-derived two lessons the silo already held.** The mermaid "too wide" remedy —
  `flowchart TD`, two-word labels — is commit `c502f10` (2026-09-18, on
  `ADR-PERIMETER-039`) and is written out in `DEPENDENCIES.md:59-60`: *"Wide `flowchart LR`
  with long node labels hits this; short labels at the same node count do not."* I
  rediscovered both by experiment.
- **A third detection error: my box-drawing counter used the wrong glyph set.** `┌┐└┘`
  for rendered art, `╭╮╰╯` for a fallback source box — so it reported "no diagram" for a
  figure that had rendered.
- **`facade-lint.sh` still exits 1 with zero bytes** where `just` is absent. Reported,
  not fixed — a change to the gate needs a brief.
- **I broke the facade gate while fixing the build, and could not run the gate to see it.**
  The justfile's recipe comments are bounded — single-line, and **≤ 3 words**
  (`scripts/facade-lint.sh:11-12`). I wrote a six-line comment over `build` and a
  three-line comment over `check`, violating two invariants at once. `facade-lint.sh`
  cannot run here (`just` absent — the defect in the bullet above), so the gate was silent
  and green-looking. It was caught by **reading the gate's source and re-running its two
  `awk` invariants by hand**, which is one command. Reverted to `# Compile, re-sign,
  verify` and `# Sync gate`, with the argument moved to `ADR-BUILD-SIGNS-040` and
  `DEPENDENCIES.md` — which is where the house keeps it, and what the terse-label
  invariant exists to enforce.
- **Nothing is committed.** The tree carries other sessions' uncommitted work.

## Lessons Learned

- **The sandbox is the most available explanation and usually the wrong one.** An agent
  shell is a suspect before the code is — but so is the *sandbox* before the artifact.
  Reproduce in a clean build (which reversed the artifact verdict) and **ask the reader
  to run it in their own terminal**, which settles it in one line.
- **A piped `$?` is not a measurement.** `x | tail; echo $?` reports `tail`'s status. It
  made a silently-failing gate read as green and a tool that exits 1 read as 0 — twice in
  one session, the second time immediately after writing the lesson down.
- **The OS is a dependency.** The build had been emitting an unrunnable artifact since
  2026-09-16 and nothing noticed, because nothing verified the artifact's precondition.
  The defect was **latent for four days and then became an outage** when the OS changed
  underneath it. `just build` reported success throughout, because it was measuring the
  compiler's exit code rather than the artifact's runnability. **Verify the precondition,
  not the exit code** — the same lesson as the columns=0 defect already in
  `DEPENDENCIES.md`, one layer down.
- **A dated measurement of the thing *working* is the strongest evidence in the repo.**
  The question "compiler or OS?" was settled by `tmp/reload-cost-probe.py`'s twenty runs
  and a recorded row count — evidence that already existed for another purpose. **Look
  for a past measurement before designing a new one.**
- **Look in the silo before deriving a lesson.** Twice here the record was right and the
  session did not read it: the diagram-width remedy was in a commit *and* in
  `DEPENDENCIES.md`; and the mermaid shim's PATH fallback is documented in
  `DEPENDENCIES.md`'s platform notes. The ledger only pays if it is read.
- **An agent shell is not the reader's shell.** `~/.zshrc` is not sourced
  non-interactively, so `~/.local/bin` was absent from `PATH` for me and present for the
  reader (`:178`). I reported a working diagram as missing. **When verifying a render,
  set up the reader's environment first, or report your own.**
- **A gate you cannot run is a gate you must read.** `facade-lint.sh` is unusable in this
  environment, so its invariants were invisible — and I then edited the very file it lints.
  Reading the script and re-implementing its two `awk` checks by hand took one call and
  caught a regression the gate would have caught on a machine with `just`. **When a gate is
  down, port its checks by hand before touching what it guards** — a gate that cannot run
  is not a gate that has nothing to say.
- **Say what would settle an open question, and ask.** The note marked "Bun regression or
  macOS enforcement?" as not-established, correctly — and one sentence from the reader
  closed it. A question left marked with no ask attached waits indefinitely.

## Observations

### The controls did the work

The first mechanism I wrote down — "bytes past the signed segment" — was plausible,
consistent with the file layout, and **wrong**. It was falsified by appending one byte to
a *validly signed* binary: a strict-validation warning and a clean run. The correction
came from a control, not from more thinking. **Two failure modes with different strings
(`invalid signature` vs `failed strict validation`) and only one of them fatal.**

### The flag was a dead end, and the census said so

`linker-signed` looked like the discriminator until `mermaid-tui` and `uv` were checked —
both `flags=0x20002(adhoc,linker-signed)`, both valid. Twelve locally-built Mach-O
binaries in `~/.local/bin`, all twelve valid. The defect is one artifact, not a class.

### The record-keeping was the slow part, not the diagnosis

Roughly: the diagnosis was a handful of probes; the remainder was writing it down in a
form the next session can use — the note, the ADR, this debrief, two skills corrected, a
script, and a dependency row. That ratio is the house working as designed, and it is
worth stating plainly because it looks like overhead from inside a session.

## Metrics

- **The defect:** 1 stale page hash of 15,499 slots; 672 bytes of a 63,976,562-byte file.
- **Re-sign effect:** 63,976,562 → 63,604,752 bytes (−372 KB), 4 KiB → 16 KiB pages.
- **Latency:** built 2026-09-16, last known good run 2026-09-19, OS upgraded 2026-09-20,
  dead 2026-09-21. **Four days latent.**
- **Evidence for the cause:** 20 timed runs, 320 rows, 40.3 ms, all dated 2026-09-19.
- **Binaries censused:** 12 locally built, 12 valid; 4 controls on the broken one.
- **Landed:** 1 note, 1 ADR, 1 debrief, 1 script, 1 dependency row, 1 new skill,
  2 skills corrected.
- **Gate results:** `signature-check` OK; `reg-sync --all` all in sync; `facade-lint.sh`
  **exit 1, zero bytes** (pre-existing — `just` absent); `bun test` **651 pass / 7 skip /
  37 fail**; `amp-check` **26** hard items (pre-existing — 25 on 2026-09-13).
- **None of the 37 test failures are attributable to this work.** `src/` and `tests/` are
  untouched, and no test reads `justfile` or `DEPENDENCIES.md`. Four are the documented
  symptom of `mermaid-tui` missing from `PATH` (`DEPENDENCIES.md:35-39`), and they pass
  with `~/.local/bin` prepended (**655 pass / 33 fail**).
- **Facade invariants:** 2 violated by this work, 2 caught by hand, 0 remaining.
- **Tables:** the three new documents `0 cut`; `DEPENDENCIES.md` cuts **11**, down from
  **18** at HEAD, all in the pre-existing `fd` row — an allocator fault owned by
  BRF-TABLE-WIDTH.
- **Committed:** nothing. `main..HEAD` = 42.

## Related

- Note: `docs/2026-09-21-the-page-the-signature-got-wrong.md` — the measurement and the
  falsified first story
- Decision: `ADR-BUILD-SIGNS-040` — the re-sign, and why it lives in `build`
- Brief: `BRF-GLOAM-OWNS-LOOP` — its `:21` is the proof the binary ran
- Dependency: `DEPENDENCIES.md` — the `codesign` row and the `--compile` signature section
- Skill: `macho-signature-triage`; and `okuda-docs-note`, corrected
- Playbook: `playbooks/debriefs-playbook.md`

## Post-Debrief Checklist

- [x] Frontmatter present: `type`, `callsign`
- [ ] Registered in `debriefs/INDEX.jsonl` — pending `reg-sync --fix`
- [x] ADR written for the decision made during execution (`ADR-BUILD-SIGNS-040`)
- [ ] The two open defects have owners — **not yet**. `src/render.ts:155-160` and
      `facade-lint.sh` are reported in the note and unassigned
