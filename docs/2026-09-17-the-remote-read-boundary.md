---
date: 2026-09-17
kind: design note — the boundary between what okuda renders from a pipe and what only a file can do, and what a remote document costs
lineage: the reader's question (get files from GitHub and treat them like local files); docs/2026-09-16-GLoam-github-ssh.md (the transport-wire doctrine this prices); pretext cloned to tmp/ as the foreign-repo subject
status: open — nothing is built; the boundary is measured and the recommendation is a materialiser, not a fetcher
---

# The pipe renders; only a file reads

> ◆ okuda already renders a GitHub file with no change at all — `curl -sL
> <raw-url> | okuda` works today, through the stdin path at `cli.ts:110`. What a
> pipe cannot do is *read*: no jump, no reload, no resize anchor, no callsign,
> because every one of those re-reads the document and a stream is consumed once.
> And the network must not move onto that read path: a warmed remote fetch is
> **23 ms** against a local read's **0.02 ms**, a ratio of **1,052×**, and 23 ms is
> **72% of an entire keystroke**. So the requirement is not a fetch in okuda. It
> is a local tree, and the way to get one is a materialiser keyed by commit SHA.

## What we are deciding

Whether okuda should learn to read from GitHub, and if not, what should sit
between a repository and okuda's read path.

## The question is already answered, and the answer is a pipe

`readSource` (`src/cli.ts:143`) takes a file or, when stdin is not a TTY, the
stream:

```
if (!process.stdin.isTTY) return await new Response(process.stdin).text();
```

So the environment fetches and okuda renders. Verified against a real remote
file — `curl -sL …/corpora/TAXONOMY.md | okuda` rendered correctly, unmodified.
That is the three-concerns split working exactly as written: **compositing is
the environment's lane, and okuda never learns what a URL is.**

## What a pipe cannot do

The stdin path is a single read. Everything that makes okuda a *reader* rather
than a formatter needs to re-read the document, and a stream cannot be re-read:

| capability | `curl \| okuda` | a local file |
|---|---|---|
| render | works today | yes |
| `§` silcrows | TTY only | yes |
| jump `§13` to its target | no | yes |
| reload (`r`), watch, resize anchor | no | yes |
| callsign resolution | no | yes, with a root |

`--tui` requires a file outright (`cli.ts:227`), and the reason is structural
rather than incidental: `rerenderAnchored` re-fetches on every watch, resize and
reload, and `resolveTarget` maps a vector to a path. **A pipe gets the render; a
file gets the reader.** Since references are the whole reason to want a remote
document local, the requirement is a tree on disk.

## A foreign repository already works, unmodified

Cloned pretext (19 markdown files) and pointed the existing binary at it:

- `okuda README.md` renders correctly.
- `okuda --entries "text"` returns its 7 nested files; `--entries ""` returns
  the 11 root files. The shelf-and-dive rule works on a repository that has
  never heard of okuda.

What a foreign repository does *not* get is the silo layer. `detectRoot()`
returns null unless there is a root `index.md` carrying `okf_version`, or tier
registries — so no badge and no callsigns. That is correct: **a foreign
repository is not a silo**, and rendering it as loose markdown is the honest
outcome.

## The two seams, and only one of them is a problem

Two seams would have to change, and only one of them is a problem.

**`readSource` — filesystem-only today, and the easy one.** `Bun.file` rejects a
URL outright, measured: `ENOENT` on a string URL and `ERR_INVALID_URL_SCHEME` on
a URL object. But the read path is already `async` and already returns
`{ ok: false, reason }`, and the content gate already retains the last-known-good
on failure. **So a network read fits the existing fetch-state model exactly** —
the failure model needs nothing new.

**`resolveTarget` — synchronous by contract, and the real constraint.** It is a
closure the caller supplies (ADR-031: a closure, never registry knowledge) with
the type `(target: string) => string | null`. A `§` vector cannot await. Making
it async changes the actuator's contract, which is a decision rather than a
refactor.

## What a remote read costs

Measured against `raw.githubusercontent.com`, one 1 KB file:

| | |
|---|---|
| cold fetch, new connection and TLS | 80 ms |
| warmed fetch, median of 7 | 23 ms |
| the same bytes from disk | 0.02 ms |
| ratio | **1,052×** |

And against okuda's own interactive budget, from the scaling profile: **a
keystroke is 32 ms at the 1× corpus.** So one warmed remote read is 72% of a
whole keystroke, and one cold read is two and a half of them. This is not a
rounding error on an interactive path; it is the same order of magnitude as the
thing the reader is waiting for.

## Fetching the references makes it worse, not better

The obvious next idea — pull the document *and the documents it references* —
is priced by okuda's own reference scanner. Across 322 documents: 1,181
reference instances, 719 distinct targets. The heaviest document is
`briefs/index.md` at **69 distinct targets**.

| strategy | cost |
|---|---|
| one file at a time | 69 × 23 ms = **1.6 s** |
| whole repository, one tarball | 1 × 732 ms = **0.73 s** |
| clone once, then read locally | 1.4 ms after the clone |

A tarball is 2.0 MB in 732 ms, so **one file at a time only wins below 32
files — and the heaviest document needs 69.** The closure is always the wrong
shape. If references are wanted, the unit is the repository.

## Getting a repository on demand

The measured menu, all of it verified on this machine:

- **One file:** `raw.githubusercontent.com/<owner>/<repo>/<ref>/<path>` — 23 ms
  warmed, no auth for public repositories, `cache-control: max-age=300` with an
  ETag. The right tool for one file.
- **A whole repository:** `codeload.github.com/<owner>/<repo>/tar.gz/<sha>` —
  2.0 MB in 732 ms, one request.
- **A private repository, or auth:** `gh` 2.98.0 is installed — `gh api` for
  contents, `gh repo clone --filter=blob:none --sparse` for lazy blobs so only
  what is read is fetched.
- **A branch tip:** `git clone --depth 1`.

And one property worth building on: **a raw URL pinned to a commit SHA is
immutable.** Two fetches of the same pinned URL returned byte-identical content.
So a cache keyed `<owner>/<repo>@<sha>:<path>` contains its own content identity
and **can never go stale** — staleness is not representable. That is I4, the
path is truth and the index is a rebuildable cache, applied to the network.

## The fork

**A — a materialiser beside okuda, keyed by SHA, with an honest cold miss.**

- A separate command resolves `<owner>/<repo>@<sha>[:<path>]` to
  `~/.cache/okuda/remotes/<owner>/<repo>@<sha>/<path>`, filling the cache on
  first use.
- `resolveTarget` stays **synchronous**: the resolver is a `stat` on the cache.
  On a miss it returns `null`, which already means *no document to render* and
  which the actuator already flashes honestly. A background fill makes the
  second attempt succeed.
- The network happens once, out of band, at materialisation — which is the
  transport-wire doctrine and its Local Primacy invariant, applied to reads.
- Costs: a cache directory with a growth policy, and the cold-miss UX.

**B — teach okuda to read a URL.**

- A branch in `readSource` for `http(s)`, and `resolveTarget` made async.
- One command, no cache directory, no second binary.
- Costs: the renderer acquires a network dependency; 80 ms lands on the open
  path; the resolver's contract changes; and the failure surface grows from
  "no such file" to every way a network can fail. It also puts compositing back
  inside okuda, which is the lane boundary the three-concerns split exists to
  hold.

## What is not in question

- **The pipe.** `curl | okuda` works, needs nothing, and is the doctrine's own
  answer. It should be documented rather than replaced.
- **A foreign repository.** Rendering and search already work on one, with no
  change, and the shelf-and-dive rule holds. Nothing to fix.
- **The silo layer is local.** Callsigns and the badge need a root. A fetched
  repository without a root is not a silo, and should not pretend to be one.
- **The read path's failure model.** `{ ok: false, reason }` plus the gate's
  last-known-good already covers a failed fetch. No new state.

## Where I would land

**A — and the case is not close, because the pipe already covers the part
people actually ask for.**

The reader's first question — can we treat a GitHub file like a local file — has
the answer *yes, today, with `curl`*. The second — should we pull the file and
its references — has the answer *that is a clone, and a clone is cheaper than
the closure at every size that matters (0.73 s against 1.6 s)*. Only the third
is real work, and it is work *beside* okuda, not inside it.

The design that makes this cheap is the SHA key, and it is worth stating
plainly: because a commit SHA names content rather than a moving branch, the
cache needs no invalidation, no TTL, and no revalidation — the key *is* the
content identity. A branch-pinned cache needs all three and still races. So the
materialiser should accept only a SHA, and resolve a branch to one at the
moment of materialisation, once.

And the synchronous resolver is not an obstacle but the tell that the design is
right. A resolver that cannot await is a resolver that must be answered from
local state — which is exactly what a cache is. The cold miss returning `null`
is not a wart; it is the actuator's existing honest failure, and it means the
network never enters a keystroke.

What would change my mind: if okuda's purpose narrows to *reading single
documents*, with references demoted to decoration, then the closure argument
evaporates, B's costs shrink, and a URL branch in `readSource` becomes a
reasonable afternoon. The measurement says the opposite — 1,181 reference
instances across 322 documents is not decoration.

## Evidence

Three probes, all in `tmp/` (scratch, gitignored):

- `tmp/bunfile-url-probe.ts` — `Bun.file` is filesystem-only; the two throw
  sites.
- `tmp/github-fetch-probe.ts` — cold and warmed latency, cache headers, SHA
  immutability, tarball against per-file.
- `tmp/closure-cost-probe.ts` — the reference closure priced with okuda's own
  `scanReferences`.

## Related

- `docs/2026-09-16-GLoam-github-ssh.md` — the transport-wire doctrine this
  prices (Local Primacy; Git as an asynchronous wire)
- `src/cli.ts:143` — `readSource`, the file-or-stdin fork; `:153` the stdin path
- `src/tui.ts:461` — the reader's own `readSource`; `:45` `resolveTarget`'s type
- `src/root.ts:84` — `detectRoot`, what makes a directory a silo
- `decisions/031-vector-actuator.md` — the resolver closure this would sit behind
- `docs/2026-09-15-the-scaling-profile.md` — the 32 ms keystroke
