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
| **Brief** | `briefs/` | What will we build? | before the work | Becomes irrelevant when the work lands; settles to `.archive/briefs/` (ADR-ARCHIVE-RESOLUTION) |
| **ADR** | `decisions/` | Why did we choose X over Y? | during, at the moment of decision | Retains value indefinitely; superseded in place, never deleted (Palimpsest Protocol) |
| **Playbook** | `playbooks/` | How do we do X? | when a task repeats or a standard emerges | Living; updated when it fails |
| **Debrief** | `debriefs/` | What happened, and why? | after | Historical reference; frozen on completion |
| **Session handoff** | `td handoff`, or `docs/` when it must persist | Where was I? | at a session boundary | Ephemeral. Never a brief (ADR-SESSION-HANDOFFS-017) |

Two columns carry the weight. **Answers** tells you which artefact you are
writing — if the sentence in your head is "what will we build", it is a brief, and
no amount of being *about* a decision makes it an ADR. **Lifetime** tells you what
happens to it, and therefore how much it must be right: a brief that turns out
wrong costs an argument, an ADR that turns out wrong keeps teaching until someone
annotates it in place.

## The Route

The Rules of Engagement (`AGENTS.md`) say what the rules are. This is the order
they run in, who owns each step, and what goes wrong at it.

- **Orient and claim** — `playbooks/td-playbook.md`. Work that is not in td is
  not tracked.
- **Brief** — `playbooks/briefs-playbook.md`. Building before the intent is
  written: the brief becomes a post-hoc rationalisation of code that exists.
- **Decide** — `playbooks/decisions-playbook.md`. **Written at the end, from
  memory.** The failure that makes a record stale, and the one that happens.
- **Build** — two logical changes in one commit.
- **Verify** — the instrument that measures the claim. A claim verified by
  reading the code back is not verified.
- **Close** — `playbooks/debriefs-playbook.md`, then
  `playbooks/registry-playbook.md`. The brief stays in `briefs/` after it lands,
  and the open list becomes a graveyard.

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

1. **Repeatability:** if a task will be done more than twice, write a playbook.
2. **Complexity:** if a task involves >3 steps or critical constraints, write a playbook.
3. **Discovery:** if you solve a novel problem ("First Contact"), write a playbook
   to guide future agents.
4. **Standards:** if there is a "Right Way" to do something (file naming,
   front-matter format), write a playbook.

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
