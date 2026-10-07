---
date: 2026-10-05
kind: response — a vendor architecture proposal (Gemini, Rust/Wasm in a Bun single binary) measured against the ledger, then shelved with the constraint that would revive it named
lineage: docs/2026-10-05-discussion-rust-and-bun-exe.md (the proposal); DEPENDENCIES.md; ADR-013 (ssh forcecommand); ADR-016 (argv0 dispatch); ADR-030 (live reload); decisions/004 (art-first managed region); decisions/023 (the un-bundleable Worker); the fd retirement, 2026-09-04 (BRF-CONTENT-SHORTLIST)
status: shelved — no constraint in the consideration set demands it. Three revival triggers named in §7.
---

# The single binary is a provisioning question, not an architecture

> ◆ The whole silo — 427 tracked documents — carries **59 mermaid fences**, and the
> heaviest document in it carries **four**. One fence costs **15.0 ms** end to end.
> The Rust engine inside that 15.0 ms is **0.5 ms**; a 234-line bash wrapper is
> **13.0 ms**. The proposal's best case is deleting the 13 — 59 times, across 427
> documents, and never more than four times in one sitting.

## 1. What the document is

A vendor transcript: one model, five milestones, one Cargo workspace, no measured
input. That is not a defect, it is a classification — and by clause 1 of the base
attitude it makes the document's numbers (*"<30 ms to first paint"*, *"sub-5 ms"*,
*"1.5–2 MB"*, *"nucleo matches or outpaces fzf"*) unpaid claims. None of them are
wrong in the sense of false; they are wrong in the sense of being unowned.

One referent drifts from the first line. **`gloam` is the launcher alias; `okuda`
is the product** (`justfile` `install` symlinks both; `decisions/016-argv0-launcher-dispatch.md:39`
— "two names, two entry contracts, one binary"). Everything the document says about
"gloam" is said about the binary in this repo, and the naming matters because half
its proposal is about the launcher path and half about the reader path, and it never
separates them.

The premise — *"a number of executables held together in a TypeScript CLI"* — is a
slight exaggeration of a ledger we keep deliberately: `mermaid-to-md` + `chroma`
(+ optional `diagram-describe`) on the reader path, `rg` + `fzf` + `git` on the
launcher path (`DEPENDENCIES.md`). The compiled binary already carries zero npm
runtime dependencies (`debriefs/2026-08-24-debrief-renderer-implementation.md:16`).

## 2. The Derrida gate — the constraint is never named

The question is not *"would this be cleaner"*. It is: **which host, which user,
which constraint cannot provision two binaries?** A proposal that cannot answer it
is a preference, and preferences have to compete with a work queue.

The consideration set, checked one at a time:

| Candidate | What it needs | Verdict |
|---|---|---|
| SSH host (`ADR-013`) | the remote holds files; the edge renders | nothing to solve — the wire carries bytes, per `docs/Discussion_ Architectural Seams…` |
| Browser terminal (`docs/2026-10-02-the-browser-terminal-is-a-second-host.md`) | a host contract of colour and nothing else | closed — "nothing to build" |
| iPad Mini (`briefs/2026-08-30-ipad-mini-demo.md`) | zero-network, self-contained | a character grid on a terminal app — the same binary, not a new host |
| The origin doc (`docs/2026-08-20-origin-doc.md:8,35,48`) | "single binary, zero external npm runtime dependencies" | already true — and line 48 says the **delegation is the design** |

No member of the set is blocked. That does not kill the idea; it demotes it from
*requirement* to *desirable*, and it changes what we are willing to pay for it.

## 3. What the proposal gets right — the limited upside

1. **The mermaid crate is a genuinely wasm-shaped object, and we verified it rather
   than assuming it.** `~/Dev/GitHub/mermaid-to-md` is ours: 5,229 lines in
   `src/mermaid.rs`, one dependency (`unicode-width`), no `fs`/`net`/`thread`/`env`
   use anywhere in the engine, and `src/main.rs` is argv, stdin, one `render()` call.
   This is the one milestone in the document that is a day's work rather than a
   season's.
2. **It removes a documented failure class.** The wrapper can be resolvable and
   still broken — the symptom is four opaque failures in `tests/table-diagram.test.ts`,
   and `DEPENDENCIES.md` names it. In-binary rendering has no `$PATH` to get wrong.
3. **Version identity.** Today the engine and okuda version independently; `mermaid-to-md
   --verify` is the drift check for authored documents (`decisions/004`).
   One artifact makes them the same version.

That is the whole of the upside, and none of it is a capability. It is packaging
tidiness with a robustness dividend.

## 4. What it gets wrong

1. **The search half contradicts itself.** Wasm cannot `readdir`; the `ignore` crate
   needs a thread pool for the speed that justifies using it, and wasm32 without
   atomics does not have one. So Track B lands on `bun:ffi` plus a `.dylib`/`.so`
   per OS/arch — **more artifacts than the two binaries it set out to remove.** The
   document reaches the conclusion that its own constraints forbid, and does not
   notice.
2. **The traversal axis has already been run and reversed.** `fd` was retired on
   2026-09-04 in favour of `rg`, explicitly so that ignore semantics stay a
   `.gitignore` decision and not "a codepath accident" (`DEPENDENCIES.md`,
   BRF-CONTENT-SHORTLIST). Track B re-opens a settled question with no new evidence.
3. **"Less than 150 lines of ANSI string building"** is the document's decorated-Stuff
   claim. It proposes a hand-rolled TypeScript two-pane TUI — `setRawMode`, alt-screen
   enter/exit, a keystroke loop — against `src/tui.ts` at 53 KB, which already owns a
   reducer, the exit fermata (`ADR-EXIT-FERMATA-051`), a drain window, the gesture
   grammar, and the pending-digit indicator now in flight. Its own sample calls
   `engine.previewMarkdown()` across FFI for a renderer that lives in TypeScript.
4. **The ABI is hand-waved where it is hardest.** `instance.exports.render(mermaidCode)`
   with a JS string is not an ABI. The `extern "C" fn(*const u8, usize) -> *mut u8` it
   does show returns a pointer with no length and no free — who allocates, who frees,
   and how a poisoned buffer is detected are the actual cost, and the "friction"
   section does not mention any of them.
5. **`nucleo` compiles cleanly to Wasm** — unverified, and the value proposition *is*
   the worker pool. The single-threaded matcher exists; it is not the thing whose
   benchmarks the document is quoting.
6. **Observability regresses.** Today a bad diagram is a child process with an exit
   code and a stderr you can reproduce by hand. A wasm trap inside Bun is an offset
   with no stack. For a viewer that renders best-effort and never crashes, that is a
   real downgrade in exactly the failure case that matters.
7. **Release coupling — the price the document never quotes.** Vendoring 5,229 lines
   of parser means a parser fix requires an okuda build, re-sign, and release. Today
   it is `cargo build --release`, a copy, and okuda is untouched.
8. **"One wasm blob, deployed anywhere" is half true.** The blob is portable; the
   artifact is not — Bun still cross-compiles an outer binary per target, and this
   repo's build carries a macOS-only signature step that must be *skipped* elsewhere,
   not failed on (`DEPENDENCIES.md`, `ADR-BUILD-SIGNS-040`). `decisions/023-tty-active-input-reader.md:61`
   already records `--compile` failing to bundle a `Worker`; "just embed it" is a
   thing to verify, not to assume.

## 5. The Watt gate — the probe the document did not run

Cheap, reversible, and decisive: how much does the per-fence chain actually cost?
Method — a four-node diagram on stdin, 50 iterations per row, three repeats (spread
under 2%), warm cache, macOS arm64, `/tmp/probe.mmd`. A `true` row is the floor
(loop plus `fork`); a bash script that does nothing but `exec cat` is the control
that isolates shell startup.

| Path | ms/fence | What it is |
|---|---|---|
| `/usr/bin/true` | **1.5** | the fork floor — loop overhead, nothing else |
| `target/release/mermaid-tui` | **2.0** | the Rust engine: **+0.5 ms over the floor** |
| a bash script that only `exec cat`s | **6.2** | bash startup: +4.7 over the floor |
| the real chain, `mermaid-to-md` | **15.0** | bash wrapper **+ 13.0 ms over the engine** |

The decomposition is the finding. The renderer is **3%** of the path. The wrapper —
`src="$(cat)"`, a `tr` guard, a `printf | $BIN` pipeline (`~/.local/bin/mermaid-to-md:216–234`)
— forks two or three times per fence and bills 87% of the cost, to emit art that
okuda immediately unwraps again: the wrapper's bake mode hands back a sentinel, a
` ```text ` fence, and a full copy of the mermaid source per fence, of which
`extractDiagramArt` (`src/render.ts:196`) keeps the fence contents and discards the rest.

Now scale it. The corpus carries 59 mermaid fences across 427 documents; the heaviest
document carries four. **A full-silo render pays the chain 59 times — under a second,
total — and the worst single document pays 60 ms.** The maximum available win from
moving the engine in-process is therefore 60 ms on one document, ~0 on the other 423,
bought with a Rust toolchain, a committed binary blob, a new drift gate for that blob,
and release coupling on every mermaid fix. A steam engine that saves three per cent
of a path we traverse fifty-nine times is not an improvement; it is a tour of the
lathe.

The measurement also relocates the defect. It is not the subprocess boundary — that
is 1.5 ms. It is our own shell script, sitting on the render path where the render
path wants 2.0 ms of Rust.

## 6. Errata

| The document says | The ledger says |
|---|---|
| "a number of executables held together" | four delegated tools, each with a version and a verified date; zero npm runtime deps |
| product is `gloam` | `gloam` is the launcher alias; `okuda` is the product (`ADR-016`) |
| inlining wasm removes the dependency | it removes the `$PATH` lookup and adds a vendored parser plus an okuda build step |
| pure wasm for the walk; native for the FS | the FS route needs per-OS dylibs — more artifacts, not fewer |
| nucleo → wasm, "cleanly" | unverified; the threading is the point of nucleo |
| "less than 150 lines of ANSI" | `src/tui.ts`, 53 KB, plus the fermata, drain, gesture and keygrammar work |
| sub-5 ms, <30 ms, 1.5–2 MB | unpaid — no method, no conditions, no owner |

## 7. Shelved — with the triggers that would revive it

**Shelved.** Not because the idea is bad; because the gate that decides such things
is "does it make a better steam engine", and the measured answer is 60 ms on our
worst document. The analysis is on file, dated, and paid for. That is cheaper than a
spike, and it is what "it may become interesting in another context" means
operationally — a shelved idea with a named trigger is a decision; a shelved idea
without one is an itch.

Three triggers, any one of which reopens this:

- **T1 — a host with no provisioning path.** A target that cannot run `brew`, `cargo`,
  or an `install.sh`: a locked-down reader box, a kiosk, a signed/sandboxed app. This
  is the constraint the document never named, and the first thing a revival brief
  should require is its name. Note the smallest form: *embed and extract*
  (`bun build --compile` file assets into a versioned cache dir) answers it in about
  thirty lines, covers `chroma` — a Go binary that wasm suits far worse — and needs
  no Rust at all. **If T1 fires, that is the first commit, not the wasm port.**
- **T2 — a consumer that wants the engine as a library, not an artifact.** A
  non-CLI host, or the edit path (`gloam-edit`), wanting to call the renderer
  in-process. Then the question stops being "one file for the user" and becomes
  "is there an okuda API", which is a different question with a different answer —
  and there is prior evidence on the cost of that coupling:
  `briefs/2026-08-25-brief-pi-markdown-rendering-via-okuda.md:31,55` (embedding makes
  the coupling total).
- **T3 — the per-fence number going material.** It is 15.0 ms at four fences maximum.
  If a future document arrives with forty diagrams, re-run §5 before doing anything
  else. (The corpus's own trend is the other way: 59 fences across 427 documents.)

**Not taken, and parked with its own trigger:** the bash hop falls out of §5 as a
finding, and it is *not* part of this shelved idea — it is a separate, smaller change
to a working path. It is parked against the next time the render path is touched, or
against the first document with a material fence count. It is not smuggled into this
document as work to do now.

**Proposed, not done:** a two-line amendment to `DEPENDENCIES.md` recording that the
`mermaid-to-md` entry is a two-process chain (bash wrapper → Rust engine) and carrying
the measured 15.0 ms/fence, so the next person to look at this axis starts from the
number instead of from the milestone list.

## 8. Opinion

The document is a good answer to a question nobody asked, which is the most common
way an architecture proposal fails — and it fails politely, with citations-shaped
prose and a plausible schema. Its persuasive power is real: wasm *is* cleaner than a
subprocess, and every individual sentence about the ABI, the build, or the cross-target
story is roughly true. What is missing is the only thing that mattered: a number, and
a name for the constraint.

The gate that did the work here was Derrida, not Watt. Asking *"which constraint puts
this in the consideration set"* collapsed five milestones into a shelved idea before
any code existed — and the answer to the Watt question, once finally measured, was
already implied by the Derrida answer. A proposal with no external sponsor is being
funded out of tidiness, and tidiness never survives a bill.

The durable find is not in the proposal at all. It is a 234-line bash script on the
render path, doing a document-authoring job (the art-first managed region of
`decisions/002`/`004`, `--inject`, `--verify`) that the render path never asked for,
costing thirteen milliseconds a fence to emit art we unwrap and a second copy of the
source we throw away. The lesson generalises: when something feels slow, measure the
layers *around* the thing you suspect before you rewrite the thing you suspect. The
crate was never the problem.
