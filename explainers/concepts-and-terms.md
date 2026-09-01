# Concepts and terms — the vocabulary of the silo

> Status: **aligned**. Read this whenever a word on another page is
> unfamiliar. Every term gets a one-line definition and a pointer to the
> longer story. The order is roughly the order a newcomer meets them.

## The silo

A **silo** is a repository that behaves like a knowledge base: plain
markdown files, organised into compartments, rendered beautifully. This
repository — okuda — is one. A silo is just files on disk; any editor,
any machine, any decade can read it. That is deliberate, and it is the
reason nothing here holds your knowledge hostage.

## okuda and gloam

**okuda** is the renderer: give it a markdown file, and it draws the
document in your terminal — colours, tables, diagrams, the works.

**gloam** is the finder: it shows a list of documents, you pick one, and
it opens in okuda. They are the same binary — the name you type decides
the role (`docs/2026-08-20-origin-doc.md` explains why).

## The okudagram

An **okudagram** is a composed screen: the document as okuda has laid it
out for your current terminal width — headings anchored, tables fitted,
diagrams drawn. Not a scroll of text; a page. The word comes from the
early design notes, and its values are *on screen now* (what you see is
composed for this moment) and *tied to the mast* (a screen that stays
put while you study it).

## Callsigns

A **callsign** is a short, stable, human-friendly name for one document
— like `BRF-BUTT-DIAL` — written in the document's front matter. Say it
on a phone call, jot it on paper, type it to gloam: it always finds the
same document, even after the file is renamed. The rule that makes them
trustworthy: a callsign appears in exactly one place, the front matter
of the document it names.

## Jump tokens

**Jump tokens** are the two-digit numbers you see beside rows in index
pages (`&briefs`, `&next`). Type the digits and you jump to that row's
document. Unlike callsigns, they are **ephemeral** — session codes that
die with the page. Callsigns are for next week's phone call; jump tokens
are for right now.

## The & family

Files starting with `&` — `&alpha`, `&briefs`, `&next` — are **vector
tables**: hand-built pages of links and jump wires that always sort to
the top of any file list. They are the silo's home screens: orientation,
state, decisions. Anyone (human or AI) can author one; they are plain
markdown with invisible wiring.

## The ledger

The **ledger** is the set of registered compartments that record how the
silo thinks:

- `briefs/` — *what will we build?* (intent, before code)
- `decisions/` — *why did we choose this?* (each with its rejected
  alternatives)
- `debriefs/` — *what happened when we built it?*
- `playbooks/` — *how do we do this?* (procedures, for agents)

Together they are the reason the same debate never happens twice, and
the reason a newcomer — human or AI — can reach full speed in one
session. Internally: **the ledger is the moat.**

Exercise the vocabulary — these are the real compartments, open one:

| Open | # |
|---|---|
| **Briefs** — what will we build? | **11** <!-- %%okuda-rhs:11%% briefs/index.md --> |
| **Decisions** — why did we choose this? | **12** <!-- %%okuda-rhs:12%% decisions/index.md --> |
| **Debriefs** — what happened when we built it? | **13** <!-- %%okuda-rhs:13%% debriefs/index.md --> |
| **The orientation vector** — the silo's home screen | **14** <!-- %%okuda-rhs:14%% &alpha.md --> |
| **The decision table** — what is next, ranked | **15** <!-- %%okuda-rhs:15%% &next.md --> |

## The roll

Classic document management divides files into *controlled* and
*uncontrolled* — and the terms are paper-era, deliberately not used
here. The context (ISO 9001:2015, clause 7.5): a **controlled document**
is one put through the full lifecycle — approval before issue, version
control, obsolete versions pulled from circulation so that *only the
current approved version sits at the point of use*; an **uncontrolled
copy** is a printout marked "for reference only" that no one updates,
and treating one as authoritative is a formal nonconformance. The whole
apparatus exists because paper drifts: printed copies go stale, shared
drives desync, and someone eventually works from the wrong revision.

That is the apparatus git makes unnecessary. Every document in this silo
is controlled by an unfuckwithable audit mechanism called git: the
current approved version is whatever `main` says, obsolete versions are
preserved rather than destroyed, the revision history is the audit
trail, and there are no printouts to go stale. Clause 7.5 is the paper-
era ancestor of the commit; we run its intent, not its bureaucracy.

So the variable here is not *control* — it is **membership**: has the
document joined the body of the kirk? A document **registry-controlled**
is on the roll: it carries a callsign, its name is lifted into a
register, and it comes under the session's discipline — frontmatter
hygiene, status flips at debrief time, the callsign lint, the reg-sync
drift walk. In exchange it holds the privileges of membership: a durable
address, field-anchored findability, a line in the index. The registry
is a *second* control layer that git does not provide — consistency
checksums, identifiers, drift repair — which is why it is optional,
and why joining it means something.

A document **not registry-controlled** — everything in `docs/`,
`explainers/`, the `&` vectors — is governed but not enrolled: git-
controlled, lint-checked, merged through the same quality gate, read and
linked like any other — but no callsign, no roll-call, no drift audit.
Free documents. The freedom is deliberate: they keep their author's
voice and layout, and they cost the session nothing to maintain.

The mnemonic is the badge of membership. No callsign, no roll — and no
obligations either. Both states are honourable; they are just different.

## The diagram tool

Write a **mermaid** fence; okuda draws it as ASCII art in the terminal.
Five diagram families, honest size limits, no browser ever required.
See [the diagram tool](the-diagram-tool.md).

## SSH

The silo over the network: a terminal on any device, no install, the
same rendering. Some of this is working, some is on the drawing board —
see [SSH](ssh.md) for the honest state.

## States

Documents in this silo have lifecycles. A foreign draft lands *fresh*,
gets checked against the house rules (*reconciled*), and settles in
(*aligned*) — the status is stamped in its opening note. You will spot
the pattern on any recent document's first lines.
