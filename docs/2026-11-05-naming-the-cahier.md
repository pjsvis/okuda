# cahier — the name for the package, and why it is that word

> Logged 2026-11-05. **Status: decided, with the etymology unverified** — the
> research tools were down when this was written, so every claim about Latin,
> French and Middle English below is marked *general knowledge, unverified this
> session*. §7 is the list of what to check. The code is
> `scripts/html-package.ts`; the mechanism is `ADR-PANEL-NOT-DOOR-081`; the
> reasoning that got here is `docs/2026-11-05-lessons-from-the-port.md`.

## 1. What the thing is, so the name can be judged

A **cahier** is one self-contained HTML file holding:

- a main document, rendered;
- its one-hop references, rendered into panels;
- both in a single file that fetches nothing — no assets, no fonts, no network;
- the reader returned to their exact place after every dereference.

It is published by `just html <file>`, listed by `just serve-html`, and measured
by `just html-verify`.

**A name is a claim about its referent.** NASA's veto (1966) renamed the *Lunar
Excursion Module* to *Lunar Module* because "excursion" implied a mobility the
vehicle did not have. The test is not whether the name is pleasant; it is
whether it lies.

## 2. The name

**cahier.**

`just html documents/2001-a-cahier.md` produces one. **A cahier of documents** is
the set.

The machine code does not change: the script is `html-package`, and nobody is
asked to say that out loud. Two codes, deliberately separated — the ugly one is
greppable, the good one is spoken.

<!-- state: open -->
- **`cahier`** — the word. Say it /ka.je/ if you can, and something reasonable if
  you cannot; nothing you are likely to say is embarrassing.
- **`quire`** — retired to the etymology, below. It is the same word one language
  earlier, and it has done its work.
<!-- state: done -->
- **`html-package`** — the machine code. Never in prose a human reads.

## 3. The chain

*General knowledge, unverified this session (see §7).*

| | | |
|---|---|---|
| Latin | *quattuor* | four |
| | *quaterni* | four each, four at a time — the distributive |
| Medieval Latin | *quaternio* | a set of four; **a quire of paper** |
| Old French | *quaier*, *cahier* | a gathering of leaves |
| Middle English | *quaier* → **quire** | the gathering a binder sews |
| French, modern | **cahier** | a notebook; a printed section; a specification |

**Why four.** A sheet folded once makes a *bifolium* — two leaves, four pages.
Four such sheets nested make a *quaternion*: eight leaves, sixteen pages, the
standard gathering a scribe worked in. Gatherings varied — a *ternion* was
three sheets, a *quinternion* five, a *sexternion* six — but the quaternion was
the norm, so **the word remembers the count, not the thing**.

**The two are one word.** *Cahier* is not a second name laid on top of *quire*;
it is the form the word had before it was English. There is nothing between them
to drift, because there is only one of them.

**Two French senses, and both are wanted.** A *cahier* is a gathering of sheets
bound as one — which is the artefact. A *cahier des charges* is a specification:
the document that states a requirement. This artefact carries a claim and the
evidence behind it, which is what a specification does.

**And the modern reflex is a school exercise book** — so *"read the cahier and
tell me what you think"* is not a cute example. It is the workflow.

## 4. The three collisions

A name is damaged by the words it sits near. Three were found, and they are why
the English forms did not survive:

| Form | Near | The problem |
|---|---|---|
| *quire* | **acquire** /əˈkwaɪə/ | "we should produce a quire" ≈ "we should produce acquire" |
| *quair* | **queer** /kwɪər/ | the Scots form; the homophone would land badly in an innocent sentence |
| *quire* (paper trade) | a **quantity** — 24 or 25 sheets, 1/20 ream | a count, not a structure |

◆ **The first two are collisions of sound; the third is a collision of meaning, and it is the one worth refusing. This week learned twice that a count is a proxy which does not track what it proxies — the panel budget was a count when the cost was bytes, and it was dropping 56 of 80 references on the index that most wanted them. We take the binding sense, because binding is the whole property of the artefact.**

## 5. The rejections, each with the rule it lost to

Rejected names are part of the record (`docs/2026-08-30-naming-like-nasa.md`).
None of these lost to taste.

| Candidate | The referent | Killed by |
|---|---|---|
| sheaf | a bundle of loose papers | **the veto** — a sheaf is *unbound*, and this artefact holds together absolutely. The only difference between a sheaf and a quire is the binding, and the binding is the property. |
| dossier | documents about one subject | connotes espionage, and a person rather than a gathering |
| bundle / package | things carried together | no referent beyond transport; collides with software distribution |
| vade mecum | a handbook carried for ready reference | accurate, but two words, and a name you would have to spell |
| codex | a bound book | **overclaims**: a codex is *made of* gatherings; we are one gathering |
| library | a collection | overclaims harder — we are not a collection |

**A word on why *cahier* beat *quire*, given they are the same word.** *Quire*
looks English. A reader assumes they know it, and is wrong, silently — the
failure `ADR-027` names at the scale of a single token: *a stale ledger
misleading confidently*. *Cahier* wears its foreignness, so nobody pretends. **A
name that announces you may not know it is an audit surface in the word itself.**

## 6. What the name claims, and what it does not

**Claims:**

- ✓ a gathering of leaves, held as one object
- ✓ bound — complete in itself, nothing to fetch
- ✓ a small unit that composes into something larger (a book is made of quires)
- ✓ a notebook someone is expected to read and say something about

**Does not claim:**

- ✗ a whole book, a library, or a collection
- ✗ a quantity of sheets
- ✗ any runtime, network, or application

## 7. Notes to check the archives

The etymology above is **general knowledge, unverified this session.** Each line
below is a claim to confirm against an authority, and the one that matters most
is third.

- [ ] **The chain.** *quaternio* → Old French *quaier*/*cahier* → Middle English
      *quire*. Confirm against OED or etymonline; the Latin *quaterni* from
      *quattuor* is the root claim.
- [ ] **The quaternion norm.** That a standard gathering was four sheets / eight
      leaves, and that the word carries that count. Confirm the variants
      (ternion, quinternion, sexternion) while there.
- [ ] ◆ **The French bookbinding sense.** Does a French binder say ***cahier***
      for a gathering — the direct cognate of *quire* — or does *cahier* mean
      only "notebook"? **This is the load-bearing one.** If the binding sense is
      French too, the name is exact. If not, the name is a metaphor, and the
      explainer should say so rather than imply otherwise.
- [ ] **The paper-trade quire.** 24 or 25 sheets, one twentieth of a ream.
      Confirm both figures — the difference is a stationer's convention, not a
      law.
- [ ] **The Scots *quair*.** Confirm it is the Scots form of the same word, and
      that the *queer* homophone is as close in Scots as it is in English.
- [ ] **The modern French reflex.** That *cahier* is the ordinary word for an
      exercise book, and that *cahier des charges* is the standard term for a
      specification.
- [ ] **The corpus.** `docs/2026-09-13-monastic-engineering.md:13` and
      `docs/2026-09-07-scriptoria-then-and-now.md` use *quires* in the
      scriptorium register. Both were written before this decision. Decide
      whether they are updated to *cahiers* or left as the record of what was
      said at the time — the second is defensible, and so is the first.
- [x] **No prior use.** *Cahier* appears nowhere in the live corpus or in
      `.archive/` — checked 2026-11-05. The namespace is clean.

## Related

- `docs/2026-11-05-lessons-from-the-port.md` — the seven lessons, and the
  proposal this decides
- `docs/2026-08-30-naming-like-nasa.md` — the veto applied here, and the
  two-codes pattern
- `docs/2026-09-13-monastic-engineering.md` — the scriptorium vocabulary
  *cahier* joins
- `decisions/081-the-panel-not-the-door.md` — what the artefact does
