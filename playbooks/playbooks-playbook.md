---
type: Playbook
callsign: PLY-DOC
---

# The Process Playbook

## Purpose

This playbook owns **the knowledge system**: which artefact a piece of thinking
belongs in, what each one answers, how long it lives, and the route you walk
through them. It also carries the authoring standard for playbooks themselves.

Read it when you are about to write something down and you are not certain which
artefact you are writing.

## The Knowledge System

One table, one owner. Anything else that needs it cites this.

| Tier | Where | Answers | Written | Lifetime |
|---|---|---|---|---|
| **Idea** *(not a tier)* | `docs/ideas.md` | Is this worth a promise? | before it is a brief | Promoted, refused, or deleted with the ledger that holds it (`ADR-IDEA-LEDGER-064`) |
| **Brief** | `briefs/` | What will we build? | before the work | Becomes irrelevant when the work lands; settles to `.archive/briefs/` (ADR-ARCHIVE-RESOLUTION) |
| **ADR** | `decisions/` | Why did we choose X over Y? | during, at the moment of decision | Retains value indefinitely; superseded in place, never deleted (Palimpsest Protocol) |
| **Playbook** | `playbooks/` | How do we do X? | when a task repeats or a standard emerges | Living; updated when it fails |
| **Debrief** | `debriefs/` | What happened, and why? | after | Historical reference; frozen on completion |
| **Session handoff** | `td handoff`, or `docs/` when it must persist | Where was I? | at a session boundary | Ephemeral. Never a brief (ADR-SESSION-HANDOFFS-017) |

The **Lifetime** column is the tier view. The **register** view — what a document
owes before it is a tier at all (ephemeral, record, addressed, retired), when a
callsign is earned, and what may never be deleted — is
`ADR-DOCUMENT-LIFECYCLE-057`, with the operational how in
`playbooks/registry-playbook.md`.

Two columns carry the weight. **Answers** tells you which artefact you are
writing — if the sentence in your head is "what will we build", it is a brief, and
no amount of being *about* a decision makes it an ADR. **Lifetime** tells you what
happens to it, and therefore how much it must be right: a brief that turns out
wrong costs an argument, an ADR that turns out wrong keeps teaching until someone
annotates it in place.

**The Idea row is the intake gate, and it is not a tier.** A brief is a
*promise* — intent, preconditions, acceptance criteria — so writing one is a
commitment; without a cheaper container every idea becomes a promise, which is
how 59 of 71 live briefs came to sit at `open`. The ledger is a *record*
(`ADR-DOCUMENT-LIFECYCLE-057`): no callsign, no registry, one entry per idea,
and a **trigger** — the observation that would make it worth doing — because a
trigger is the one thing a brief cannot require. Promotion into a brief or an
epic is its only exit. If the ledger stops promoting, it is deleted, not
curated.

## The Route

The Rules of Engagement (`AGENTS.md`) say what the rules are. This is the order
they run in, who owns each step, and what goes wrong at it.

- **Orient and claim** — `playbooks/td-playbook.md`. Work that is not in td is
  not tracked.
- **Idea** — `docs/ideas.md`. An idea is staged with its trigger while it is
  still cheap to drop; a brief is written only for a *promoted* one
  (`ADR-IDEA-LEDGER-064`). Skipping this step is how the open list became a
  pile of unmade decisions.
- **Brief** — `playbooks/briefs-playbook.md`. Building before the intent is
  written: the brief becomes a post-hoc rationalisation of code that exists.
- **Decide** — `playbooks/decisions-playbook.md`. **Written at the end, from
  memory.** The failure that makes a record stale, and the one that happens.
- **Build** — two logical changes in one commit, or one that lands at the end:
  a tidy accumulated across a session is a tidy whose diff nobody reads.
- **Verify** — the instrument that measures the claim. A claim verified by
  reading the code back is not verified.
- **Close** — `playbooks/debriefs-playbook.md`, then
  `playbooks/registry-playbook.md`. The brief stays in `briefs/` after it lands,
  and the open list becomes a graveyard.

**Tidy first, in prose.** Separate the structural change from the behavioural one
and land it first — the tier table hoisted to one owner changes no rule, the
evidence rule adds one. But the correspondence with code is loose, and it is
looser in one direction that matters: a refactor in code is proved
behaviour-preserving by a passing test, while a playbook has no oracle at all,
so its structural claim rests on a reader. A 200-line move buries the next
sentence that actually changes how someone works. Commit the structural step as
it lands — do not accumulate, because the diff is the only review a document
ever gets.

A list rather than a table on purpose: a path is 25 columns where a basename was
15, and at 80 columns the table's failure column — the only column carrying new
information — was the one that elided. Shape follows what the content needs.

**The Decide row is the one that gets skipped**, and skipping it is the single
largest source of stale record in this silo. An ADR written after the work lands
is written from memory: the argument that justified the choice is gone, the
alternatives are reconstructed, and the ruling keeps teaching long after it has
been repealed. The `playbooks/decisions-playbook.md` in-place annotation rule exists for
exactly this — but as a card to tick when you finish, which is when the damage is
already done. Make the decision an ADR at the moment you make it.

## The Evidence Rule

**A claimed fact names its instrument.** If a record asserts that something is
sound, correct, valid or unchanged, it says how that was established — a command,
a measurement, a test, or the word *unverified*. A claim with no instrument is a
belief wearing a record's clothes.

Why it is a rule rather than a taste: ADR-UNIVERSAL-ELISION-050 certified its
table arithmetic as *"VALID … and stands unchanged"* with nothing behind it. The
certification was carried into the source as a comment, stood for five days, and
cost a full measurement session to withdraw. Every hour spent re-deriving that
claim began at that sentence. The corollary is the useful half: a claim that
names its instrument can be retired in one command when the instrument changes.

It is enforced where the author is — the review checklist in
`playbooks/decisions-playbook.md` carries it.

## Find Yourself

| Where you are | Read |
|---|---|
| Starting a session, wondering what to work on | `playbooks/td-playbook.md` |
| Holding an idea, before it is a promise | `docs/ideas.md`, then `decisions/064-idea-ledger.md` |
| About to propose or begin non-trivial work | `playbooks/briefs-playbook.md` |
| Choosing between two reasonable options | `playbooks/decisions-playbook.md` |
| About to write something down, unsure which artefact | the tier table above |
| Something went wrong and the cause is not known yet | `playbooks/defect-playbook.md` |
| Writing for a reader rather than the record | `playbooks/authoring-playbook.md` |
| Changing the silo's structure | `playbooks/silo-playbook.md` |
| Closing a session or a piece of work | `playbooks/td-playbook.md`, then `playbooks/registry-playbook.md` |

The full list is `playbooks/index.md` (generated).

## The Authoring Standard

A **playbook** is a codified set of instructions, patterns, or standards for a
specific repeatable task. It exists to reduce cognitive load, ensure consistency,
and capture "tribal knowledge" into an explicit protocol.

### When to Write a Playbook

1. **Repeatability:** if a second attempt would have to re-derive what the first
   knew, write a playbook.
2. **Fallibility:** if a step can be done in the wrong order, or a critical
   constraint is one that nothing downstream would catch, write a playbook.
3. **Discovery:** if you solve a novel problem ("First Contact"), write a playbook
   to guide future agents.
4. **Standards:** if there is a "Right Way" to do something (file naming,
   front-matter format), write a playbook.

**These were counts, and a count is not a criterion.** Criterion 1 read *more than
twice* and criterion 2 read *more than 3 steps* — the one justification this house
refuses: *justify a convention by the perceptual property it serves, never by a
count* (`system.md:28`). A tally is satisfied by counting, so it promotes the
countable and buries the failure. The property underneath is **fallibility** — a
procedure earns a playbook when following it can produce a *detectable* wrong
answer. `okuda-assess-capability` is the worked case: its first step can return
*no*, and its trap list exists because that step has returned the wrong no. The
argument and its measurements are
`docs/2026-10-16-written-down-and-promoted-on-a-count.md`.

### The Structure of a Playbook

Every playbook follows this structure:

**1. Title & Purpose.** A clear operational H1 (e.g. "Registry Playbook"), and one
sentence explaining *what* this does and *why*.

**2. Context & Prerequisites.** What tools are needed, what state the system must
be in, which other playbooks to reference.

**3. The Protocol — the how-to.** The core. Numbered lists, imperative mood.
*Step 1: do X. Step 2: check Y.* Mark constraints inline.

**4. Standards & Patterns (optional).** If the playbook defines a *style* rather
than a *process*, the rules go here — "always use YAML front-matter", "never
hand-edit `INDEX.jsonl`, regenerate with `just reg-sync-fix`".

**5. Validation.** How do I know I am done? Explicit acceptance criteria —
"`just check` passes", "the output renders correctly in the viewer".

### Maintenance

- Playbooks are living documents.
- If a playbook fails, **update it**. Do not bypass it and leave it broken.
- **Deprecation:** if a playbook is obsolete, add a `> **DEPRECATED**` banner at
  the top and link to the successor.
- **Review after use:** if you find a gap while following a playbook, fix it and
  commit.

### Location

All playbooks reside in `playbooks/`. Filename convention:
`topic-playbook.md` or `topic-subtopic-playbook.md`.
