---
type: Advisory
callsign: ADV-FFF-DECLINED
---

# ADV-FFF-DECLINED — Advisory declining `fff-search`, a trojan horse of packaged state


## From

okuda (the reader's silo) · **To:** the operator weighing a new dependency · **Date:** 2026-10-13 · **Status:** Open. Declined, with a named revisit trigger.

---

## Preamble

`fff-search` was raised as *a crate we could fly* — a fast file-search library, MIT, that
speeds up a long-lived process. This advisory records the evaluation and the decline, so
that the next operator who finds it does not have to re-derive the reasons. The short form:
**it is a trojan horse of packaged state, of dependencies, and of a targeted operating
environment — none of which is ours.**

## What it is, in the record

A Rust library crate (`has_lib`, no `bin_names`), MIT, stable `0.11.0` (2026-09-21),
edition 2024, publishing nightly since 2026-03. Its whole value is a **resident index**: the
README's own line is *"if you run one grep from a terminal, `rg` is still the right tool;
if you run dozens inside the same process, FFF pays for itself starting from the second
call."* Its default walker is ripgrep's `ignore` + `globset`, so it is not a replacement for
`rg` in the one-shot case — it is a cache that only a long-lived process can spend.

## The trojan horse: state

The speed is bought with state that outlives the query — a file index, an in-memory content
index (~360 bytes/file), a memory-mapped content cache, a **frecency database** and a
**history database**, and a background file watcher. That is a store outside the silo, kept
by a process we do not own, ranking what we read by how often we read it. This silo's rule is
*no parallel stores* (`playbooks/registry-playbook.md`) and *continuity is re-reading, not
recall*; a frecency DB is recall, cached and opaque. It is the drift hazard with a score
attached.

## The trojan horse: dependencies

Flying the crate means adopting its tree: the `ripgrep` feature (`ignore`, `globset`,
`fff-query-parser`), `mimalloc`, and — behind `zlob` — the Zig toolchain for the parallel
walker. Edition 2024 pins a recent `rustc`. None of this is a reason by itself; all of it is
cost that this silo does not currently pay, for a benefit it cannot currently spend. The
silo already has `rg` and `fzf` (DEPENDENCIES.md, verified) doing this job in one shot.

## The trojan horse: a targeted environment

Its distribution assumes a host that wants the agent layer: an **MCP server**, a **Neovim
plugin**, and a **pi extension** (`@ff-labs/pi-fff`), each a prebuilt binary or an install
script per platform, auto-bumped on every release. This silo refuses the agent layer on
principle — *a tool's contract is its actuator, its screen and its channel*, and a skill or
an MCP server is a fourth interface that prevents the tool from composing. We would take the
actuator and decline the wrappers; but the actuator is a library, and the wrappers are where
its convenience lives. What is left is a crate we would have to build our own interface for.

## Why it is not ours, concretely

Three paths were considered, and two are closed by the constitution rather than by taste:

1. **Add the crate** — impossible; okuda is Bun/TypeScript, not Rust.
2. **The Node/Bun SDK or the C ABI** — a native addon or a `libfff_c` dynamic library. This
   breaks `bun build --compile`'s single signed binary; the artefact would ship a sidecar
   `.node`/`.dylib` at runtime. Closed.
3. **A thin Rust CLI around the crate**, spawned — the one open door, and the
   `mermaid-to-md` shape. But a spawned CLI pays the scan per invocation, which is exactly
   the one-shot case where the README concedes `rg` wins. It would spend a toolchain and a
   binary to be slower than what is already installed.

And the scale does not call for it: the silo is a few hundred markdown files, where
`rg --files --type md` is already milliseconds. The crate is built for 10⁴–10⁵-file trees
and sub-10 ms repeat queries; neither condition is present.

## The revisit trigger

A decline without a trigger is a slogan. The trigger is stated so it can be checked, not
recalled: **fly it if the corpus crosses ~10⁴ files, or if the launcher ever holds a search
process open across keystrokes** — a resident surface per repository. At that point a sidecar
built around `fff-search` is the right way to spend the toolchain, and the `mermaid-to-md`
precedent already covers the install shape. Until then: not ours. A crate is flown for the
problem it solves, and we do not have that problem.

---
