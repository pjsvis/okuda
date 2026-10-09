---
date: 2026-10-06
kind: position and outreach draft — what this silo is for, stated for a reader outside it. Doubles as the internal statement of purpose the repo has never written down
lineage: the operator's question, 2026-10-05 — *"the shared cognition thing is where my thoughts have led"* — and the two documents it rests on: `docs/cognition-in-the-wild.md` (the Hutchins summary) and `docs/2026-09-08-accessibility-audit.md` (the a11y claims, self-assessed). Candidate audience: CALL Scotland (University of Edinburgh) — see the reserve at the foot of this file. **Drafted, not sent.** **Extended 2026-10-09:** the *document contract* section — stable · addressable · inspectable · shared · purposive — from the operator's question *"am I just repeating myself, or is there something here that IT/the market/devs has missed in the current AI age"*.
status: open — the draft stands; whether it is sent, published, or left as an internal statement is the operator's call.
---

# The shared artifact — what two parties must be able to see, index and verify

## What this file is

Two things at once, deliberately in one place.

**Internally:** the statement of purpose this silo has been carrying without writing down. The project has described itself as a fast terminal markdown renderer. That is the *mechanism*. The purpose is the next section down.

**Externally:** the draft we would take to a practitioner audience — assistive technology, accessible formats, supported communication — if we ever decide the finding is worth the asking. It is not a product announcement; there is no product to announce. It is a practice, offered for criticism.

**The naming.** The tool is `okuda`; the reader's own word for it is **Gloam** (a Scots word for the half-light, and the name the launcher answers to).

## The document contract — what a document is, for the purpose of this practice

The statement of purpose, in one table. A document is held to five properties
here — a specification, not a set of inventions — and each one is the answer to
a specific failure, most of which the current fashion has stopped worrying about.

| property | what it means here | the failure it answers |
|---|---|---|
| **stable** | a change is a *new version with a new address*, never a silent mutation under the reader's eye | the chat interface's *regenerate*: asking again overwrites the answer the two parties had settled on, and there is no address for "the one we decided" |
| **addressable** | every document, and every claim inside it, has a name that resolves to the thing | retrieval by embedding: a passage returned with no durable address — a derived, unanchored, uninspectable stand-in for the source |
| **inspectable** | the reader can check it rather than trust it; the address resolves to a body | the context window as memory — a larger whiteboard, not a filing cabinet; a model that re-reads a file beats one that remembers a conversation |
| **shared** | it carries what two parties must both see — including the one who arrives cold | the transcript as the record: mutable, unsearchable, unversioned, and gone when the window closes |
| **purposive** | it exists to change a decision, not to be produced | content metrics — tokens generated rather than decisions changed, which is how decoration gets rewarded |

**The word is not immutability.** Documents must change; a practice that froze
them would be useless. The property is **referential stability**: what changes is
*versioned and addressed*, so a reference the reader holds still points at the
thing it pointed at. A change that cannot be attributed makes every reference
suspect.

The same rule appears in the render, one layer down — a transformation is
trustworthy when the reader can attribute it (`docs/2026-10-08-the-resize-contract.md`;
**attributable structure** in `system.md`). A document that moves underneath the
reader is a transformation with no attribution, which is why the second property
in the practice note below — *references must survive editing* — is harder than
it looks.

**What this is not.** Not a claim that the field has missed these ideas.
Archives, records management, libraries and docs-as-code hold every one of them,
and hypertext's founding intention was stable addresses and non-destructive
editing. The claim is narrower and less flattering: the **consumer layer of the
AI age has stopped holding them**, because the default product shape — the chat
window — does not need them. That answers the moat question honestly. None of
this is secret; what is not public is the practice, the refusals, and the record
of why.

---

# State outside the text does not exist

*A practice note from a workflow where the other mind forgets everything.*

I want to open with what this piece is not, because the rest depends on it.

This is not an AI-in-education proposal. It is not a study. It is one person's working practice — hardened in an unusual place, described honestly, with the failures left in — and a request for a practitioner to tell us which parts of it are wrong. There are no learners in it. There is no evidence of transfer to a classroom, and I think the transfer is larger than it looks. What follows is a description of a shared artifact, and an argument that some of what it must carry is familiar ground to anyone who supports another person's understanding for a living.

## The collaborator who forgets

Most of the work in this practice is done with a machine collaborator — an AI agent — and the agent's defining property is not that it is clever. It is that **it has no memory between sessions and no tacit knowledge at all.** It does not know what we decided last week unless it is written down. It cannot infer the house style, the half-finished argument, or the thing we agreed not to do. Every session begins from the documents.

That constraint is not a limitation to be engineered away. It is the forcing function, and it produced one rule from which most of the rest follows:

> **Nothing that is only remembered exists.**

A plan in someone's head is not a plan. A decision that was reached in conversation and not written down will be reached again, differently. A private notebook that the next reader cannot see is not memory — by the same argument, it does not exist. This silo's operating clause is blunt about it: continuity is *re-reading*, not recall. What persists between sessions is what is written where both parties can see it.

Anyone who has written a handover for a cover teacher, or a support plan that has to work when the person who wrote it is off sick, will recognise the rule. The difference here is only in how absolute it has to be. A human colleague who forgets can be reminded; they can read a room. An agent with amnesia will not notice that something is missing, because it has no baseline to miss. So the artifact has to carry everything, every time, and be legible to a reader who was not present.

## What the artifact has to carry

A persistent document that two parties both see is not a document with better formatting. It is the shared working memory, and five properties turn out to matter more than presentation:

**1. It must be checkable against what it claims to show.** A diagram inside a document is a claim about the text it illustrates. If the picture and the source can drift apart, you have a lie that everyone trusts. In this practice that failure happened: a source reflow collapsed a six-line diagram fence in a showcase document, the diagram silently disappeared, and nobody noticed for weeks — until a routine check re-rendered it. Not wrong output; *absent* output, with nothing to indicate absence. The fix was mechanical: generated art lives between sentinels, and a verification command re-renders it and diffs it, so art that no longer matches its source fails loudly. Small, unglamorous, and the most transferable thing in this piece.

**2. References must survive editing.** Two parties need to point at the same thing without pointing — "the third one, there" is how shared attention degrades. So references are numbered, and the numbers are *generated at the moment of rendering, never authored*: a stable address per destination within the document, reproducible byte-for-byte. The hard part is not the numbering; it is that the numbering must remain stable while the document changes underneath it. That is where the scars are, and it is where a professional would find something worth arguing with.

**3. Dangerous addresses should be unreachable.** This one fell out by accident, and it is the reason I am writing this at all. The numbering scheme deliberately skips the tokens where both digits repeat — `11`, `22`, `33`, and so on. They cannot be a document address. They are reserved for global actions that are intentional by shape: two presses of the same key is the lowest-effort input on the number row, and it does something the reader can predict.

The side effect is that **an involuntary double-strike cannot navigate anywhere.** A tremor, a spasm, a sticky key, a switch that chatters: the repeat lands on a token that means "the system acts", never "the document moves". We then debounced rapid repeats as well, but the structural exclusion is the stronger guarantee, because it is a property of the address space rather than a threshold that can be tuned wrong.

I am a fast keyboard user, and I do not know whether this actually helps the people it is aimed at. That is a question for someone who assesses motor access professionally, and it is the one thing I would most like answered.

**4. Symbols get one job each, and the legend is declared once.** A small closed set of marks — done, not done, rejected, parked — used everywhere, meaning the same thing in a list, a table and a sentence, and never re-saying what the bullet already says. An outside reader learns four glyphs once and can then read the document's state at a glance without reading it. The discipline is subtraction: a mark that duplicates existing structure is noise, and noise is the enemy of a glance. Anyone who works with symbol-supported resources will know the failure mode on the other side of this — symbol soup, where every word gets a picture and the page becomes unreadable.

**5. Nothing is timed.** No timeouts anywhere: pages do not expire, a half-finished input waits indefinitely, and there is a deliberate held frame at every mode change — a pause that lasts exactly as long as the reader needs, because it is dismissed by input rather than by a clock. There is a name for the failure I am avoiding: a deadline that punishes the slow reader and pressures the fast one serves nobody. Paging is discrete rather than a smooth scroll; the reading position is anchored to the text under your eye so that a change to the document does not throw your place. These are standard accommodations. They were arrived at from an engineering premise — the reader sets the tempo — and only afterwards recognised as accommodations, which is the interesting part.

## How the work is actually done

The methodology is nothing exotic, and I would rather state it plainly than dress it up: it is the ordinary discipline of not claiming things you cannot show, applied without much mercy.

Every claim in these documents is either cited to a file and a line, or explicitly marked as a proposal. A proposal that is never tested stays marked. A measurement is taken before a belief is formed, not after — and that ordering has paid for itself repeatedly: a proposal to bundle half the toolchain into one binary looked reasonable on paper, and died on a stopwatch. One fence of a diagram cost 15 milliseconds end to end; the renderer was 3% of that and a shell script was 87%; the corpus carried 59 such fences across 427 documents. The proposal was shelved in an afternoon, with the number recorded next to it, instead of becoming a week of work.

Reversals are written down as reversals. Decisions get their own records, including the ones they replace. Work that is not written into the queue is not work. And the derived ledgers — the indexes a machine maintains from the documents — are checked for agreement rather than assumed: a status that had been quietly wrong in an index since the end of August was found only because a new check was written to *refuse to guess*. It reported "I cannot tell" rather than filling in a plausible default, and the row it found had been silently wrong for five weeks. A ledger that answers confidently when it does not know is worse than one that fails.

That is the whole method: cite or mark; measure before believing; write the reversal down; never let a derived artifact guess.

## What we do not claim, and what we would like to know

We do not claim this transfers. One operator, who is also the author of the tool, who has an unusually high tolerance for a terminal. No learners, no assessment, no study, no evidence. Our own accessibility notes are a self-assessment, largely unverified, and — I will say it before someone else does — probably wrong in at least one place: our claim that assistive technology "reads the output directly" holds for the plain streaming path, where the output is pure text with no cursor control at all (measured: 427 documents, 5.4 MB, and not one byte of cursor movement), and it does *not* hold for the interactive mode, which repaints a whole screen per keystroke and hides a half-typed input from the reader. That is a real problem in our own house, and it is on the list.

The general caution is not mine either: it is notoriously difficult to generalise from the desk to the wild, and our desk is one desk.

So the piece ends where it should — with the questions rather than the answers:

- **Does the unreachable-address idea help anyone with a tremor, a spasm, or a switch, or does it merely feel clever to a fast keyboard user?**
- **What does a shared artifact need that this one does not have** — for a reader whose working memory is supported rather than assumed, and for a partner who arrives cold, mid-year, with no context at all?
- **Is the verification principle — art must fail loudly when it stops matching its source — already standard practice somewhere we have not looked?**

---

## Reserve: CALL Scotland

Recorded here so the option is not lost, and so nothing is implied that has not happened.

**What they are.** CALL Scotland (Communication, Access, Literacy and Learning) at the University of Edinburgh, Moray House — established 1983, providing information, advice, training and assistive-technology loans for learners with additional support needs across Scotland, with Service Level Agreements across most Scottish councils. Relevant corners of their work: **Books for All** (accessible curriculum formats), **Adapted Digital Exams**, **Communication Passports**, **Symbols for All**, **AAC Scotland**, **WordTalk**, **The Scottish Voice**, and their practice guidance on creating accessible documents and alternative formats. Their published stance — *making the original document more accessible reduces the need to produce accessible formats* — is the same argument as this piece, one layer upstream.

**What we reserve.** Two separate things, and they should not be blurred:

1. **Their resources, as reference material.** Their accessible-format guidance and their symbol/supported-communication practice are citable prior art for this silo — useful when reviewing our own claims, no contact required. Their site is public and this costs nobody anything.
2. **Contact, if we ever have something worth their time.** The only shape I would send is this document: a finding offered for criticism, with the two questions above, and with the limits stated in the first three lines. Not a tool, not a demo, not a request for a free accessibility review. Their remit is Scottish education, their time is public money, and we are not owed an answer.

**Trigger, and the honest default.** Send it only if the operator wants to be on the record with it, and only after the piece has survived a re-read in a week's time. If nothing happens, the default is that it becomes an internal statement of purpose and the question stays open — which is a perfectly good outcome, because the statement was the thing this silo was missing.

**What we would not do.** Offer the tool to their audience (wrong platform; and it would turn a personal practice into an expectation of support). Present it as assistive technology for children (it is not, and it would invite a compliance and data-protection conversation this project cannot carry). Or treat a national advisory service as a distribution channel.
