**Title:** The Shape Nobody Wrote Down

**Author:** Bruno Baketarić

**Date:** 05/09/2026

**Source:** [https://medium.com/@__bbak/the-shape-nobody-wrote-down-905382f7537f](https://medium.com/@__bbak/the-shape-nobody-wrote-down-905382f7537f)

---

# Page Structure Map
```text
The Shape Nobody Wrote Down
├── What the Text Does Not Contain
├── Built by Deciding
├── What Turned Out to Matter
├── A Record of Survivors
├── Told Only When Asked
└── Where the Documents Come From
```

---

12 min read

3 days ago

In 1985 Peter Naur described a case he had either witnessed or heard about first hand.¹ One team had built a compiler for a programming language, running on a particular machine. It worked well. A second team, elsewhere, was given the job of building a compiler for a modestly extended version of the same language, targeting a different machine. The new team decided that the original compiler was a sensible starting point and arranged for support: full documentation, annotated program texts, a great deal of additional written design discussion, and personal advice from the people who had built the thing.

The arrangement worked. The new team got their compiler. But during the design phase something kept happening. They would work out how to accommodate the language extensions and submit the proposal to the original team for review, and in several major cases the original team found that the solution made no use of facilities that were already there in the structure of the existing compiler. Those facilities were not obscure. They were discussed at length in the documentation the new team had been given. The proposals instead added to the structure from outside, in the form of patches that destroyed its power and its simplicity. The original team could see these cases immediately, and could propose simple solutions that sat entirely inside the existing design.

Ten years later, after the compiler had passed to other programmers in the same organisation without the original team’s involvement, someone from that original team looked at what had become of it. The original structure was still visible. It had been rendered completely ineffective by amorphous additions of many different kinds.

Everything that could be written down had been written down. It did not transmit. So what was the original team holding?

## What the Text Does Not Contain

Open any codebase of consequence and look for the file that states its decomposition. There is not one. There are names, directory layouts, import graphs, conventions that most of the team follow most of the time, and perhaps a diagram that was accurate at some point. None of these is the shape of the system. They are the particulars from which the shape is read.

Michael Polanyi gave the general form of this relation.² We recognise a face without being able to say what makes it recognisable: the set of the eyes, the line of the jaw, the proportions between them. We are aware of those particulars, and we are attending, through them, to the face. What we cannot articulate is the particulars. What we have instead is the face, which appears on no list of them.

The shape of a system sits in that relation to its code. You attend from the names and the call sites and the module boundaries to the shape, and the shape is what you then reason with. It is not recorded anywhere, and this is not an oversight that better tooling would fix. The shape is produced by an integration that a reader performs. Until someone performs it, the shape exists in nobody.

David Parnas made the same point from the other direction thirteen years earlier.³ Comparing two very different decompositions of the same system, he observed that both could produce an identical running program. The algorithms might be the same. The compiled result might be the same. What differs is not visible in the thing that runs, because the runnable form is only needed for running; the other forms are what you use for changing, documenting and understanding. Which means no test tells you your decomposition is wrong. Nothing checks this for you.

Return to the new team with that in hand. They were not short of documents. They read the same text the original team had written, assembled a different shape from it, and then reasoned correctly from the shape they had.

## Built by Deciding

The two teams differed in one respect. One of them had built the original compiler. Everything else, the text, the annotations, the design discussion, the direct access to the people who wrote it, the other team had too.

Building is a sequence of decisions, and a decision has a property that reading does not. When you decide, you form an expectation and then find out what you got. The gap between the two is information, and it is information nobody else can receive, because the expectation was yours and it was never written down. A reader of the finished artefact gets the result without the expectation, which is to say a proposition rather than a discrepancy. Do this a few thousand times over the life of a system and you have a great deal that the artefact cannot supply.

Naur’s word for what a modification demands, first of all, is a confrontation between the existing solution and what the change requires. The word is well chosen. Something has to be held up against something else, and one of the two things is not in the repository.

This has a consequence worth stating once. Code you did not decide is inherited, and the ordinary difficulties of working on somebody else’s system apply, whoever or whatever wrote it. The condition that defines a legacy system is not its age. It is that nobody now working on it holds the shape, and a system can satisfy that condition from its first week.⁴

## What Turned Out to Matter

Knowing what the parts are for is one face of holding the shape. The other is knowing what has already been pushed against it and did not go in.

Nobody holds the history of a system. Not the people who built it, not the ones who inherited it, and not any conceivable reader of its records. Three years of a mid-sized system is more decisions, incidents, arguments and reversals than any mind can carry.

What a senior engineer carries is a paragraph. We tried splitting that module around two years ago. It failed because the two halves kept needing the same data and we never found a clean line. Then the team that owned the second half was reorganised away partway through. By the time both of those were clear, the half-finished split was worse than either version we had started from. Four sentences covering a year.

That paragraph is not a summary of the records. Nobody sat down with the tickets and condensed them. It is a residue, and it has a specific history.

At the time, all hundred things looked like candidates. The coupling between the two halves was not visible from either side. The team was intact and nobody expected it to move. What puts these into the paragraph and leaves the other ninety-odd out is that later events said so, and nothing available at the time could have said it. Then the selection reopened. Something the following year turned out to bear on the same decision, and the paragraph was revised to carry it. It will reopen again the next time somebody proposes something adjacent. The residue is the current state of a selection that has been made repeatedly, each time in the light of what had happened since.

Which inverts the way capacity usually gets discussed. The head’s inability to hold everything looks like the handicap here, the reason we need artefacts at all. It is also what forces the selection, and the selection is where the judgment lives. Remembering less, correctly, is the skill, and the correctness was bought by having been wrong repeatedly.

This is worth separating from something it resembles. A system that can hold the whole history in view can produce a summary of it on demand, tailored to whatever question you ask. That is a different operation from what the senior did. Summarising is compression against a current query. The paragraph is compression against a long sequence of outcomes, each of which revised what the previous compression had kept. Anything that has never been forced to choose what to keep has only ever performed the first.

The same mechanism has a second face. Compressed judgment and settled prejudice are produced by the same process and feel identical from the inside, which is why “we tried that and it did not work” is simultaneously the most valuable and the most obstructive sentence available in a design discussion. There is no internal test that separates them, and anyone who believes they can tell the difference in their own case has supplied the evidence against themselves.

## A Record of Survivors

Suppose you set out to capture the paragraph in the repository. Two things stand in the way, and they are independent of each other.

The first is that its content is counterfactual. It failed because the halves kept needing the same data and the team was reorganised away says that had those things not obtained, the split might have held. That is a claim about a world that did not happen. Records contain what happened. There is no amount of diligence in recording events that yields a claim about the ones that did not occur, because the claim is a judgment made in the light of subsequent events, and the judgment is the thing being sought.

The second is that the assets contain only survivors. Paint keeps its revisions. Under multispectral imaging the Mona Lisa still holds its transferred charcoal underdrawing, the repositioned hands, the adjusted horizon, dozens of thin glaze layers laid one over another.⁵ Overpainting covers without destroying, so the history remains in the object and can be recovered five centuries later. Code looks like it has an equivalent, and a better one. Version control keeps every state that was ever committed, and a deletion can be recovered years afterwards by anyone who knows where to look. The difference is in what gets preserved without anyone choosing to preserve it. Overpainting keeps the discarded attempt because covering something does not remove it. A repository keeps what somebody decided to record, and a dead end is the least likely thing to be recorded.

The revisions that carried the most reasoning were mostly never committed at all. The branch abandoned after two days. The approach tried for twenty minutes in the editor and reverted. The design considered over coffee and dismissed for a reason nobody thought to write down because at that moment it was obvious to everyone present. So the record is not merely incomplete. It is incomplete in exactly the dimension that carries the rationale, and it is systematically biased toward what worked, which is the part you can already see in the code.

Commit messages have their own version of this. They are thin on why, and not primarily through carelessness. At the moment of committing, the why is self-evident to the author, and nobody records what they currently find obvious. So the record is thinnest precisely where the writer’s understanding is thickest, which is the inverse of what a later reader needs.

Architectural decision records are the deliberate remedy and they invert the problem without dissolving it. An ADR captures the reasoning at the moment of deciding, which is before the decision has met anything. The paragraph is post-hoc, and the post-hoc part is the valuable part. By the time the outcome is known, the document has stopped being edited.

## Told Only When Asked

Watch how this knowledge moves between people, because it does move, reliably, and the mechanism is not documentation.

Somebody new joins. They are given a small change. They start work, hit something that makes no sense, and ask why it is like this. Somebody who knows tells them, in about ninety seconds, and the answer sticks. Repeat for six months and they can modify the system safely. This is the normal path, it is how it has always worked, and it is worth saying plainly that this is a practitioner’s observation rather than a measured result; the research on onboarding tends to measure time to first commit, which is a different and easier thing than time to change something without breaking it.

Two things about that exchange matter. The knowledge transferred was not inexpressible. It went into words easily, in a sentence or two, and would have been perfectly clear written down. It was simply never told in advance, because nobody knew which of ten thousand possible things this particular person needed told until they tripped over one of them.

And the transfer was pull-based. The question was generated by an attempt, and the answer landed because it met a confusion the asker was already holding. The same sentence, delivered in week one as part of an onboarding pack, passes straight through. It has nothing to attach to.

Naur reaches the same conclusion about how a new programmer comes to hold what he calls the theory of an existing program: access to the program text and the documentation is insufficient, and what is required is working in close contact with people who already have it, doing the relevant things under guidance. That is a claim about the form of the transmission, not its volume.

An objection is due here, and it comes from Polanyi rather than against him. He is explicit that where the relations between the parts of something can be stated explicitly, they should be, and that explicit integration of this kind reaches further than tacit integration does. His example is a machine: the person who can operate it skilfully knows less about it than the engineer who understands its construction. So this is no argument for leaving things unwritten. Write down every relation that will go into words.

The answer is the compiler case. Those relations were written down, at length, and the new team still assembled a different shape and reasoned from it. Explicit statement is worth doing and it does not substitute, because what fails to transmit is not a set of statements.

## Where the Documents Come From

Which brings the remedy into view, and its problem.

Every document that would let someone inherit the shape is written by someone who holds it. The architectural notes, the decision records, the account of what was considered and rejected and why, the paragraph itself if anyone ever writes it down: all of it is produced by people who came to know these things by having done the deciding. The documentation is a by-product of the activity. It is not an input to it.

So under an arrangement where the deciding is delegated, everything downstream fails together and for one reason: nobody accumulates the shape. Because nobody accumulates it, nobody writes the documents that would transmit it. Because nobody holds it, there is nobody to answer the question when the newcomer trips over something in week three. The documentation strategy does not fail because documentation is weak. It fails because its supply came from the activity that was removed.

This is where the current moment enters, and it enters as an application rather than a complaint. Coding agents have improved quickly along a particular axis. Context windows have grown. Models read existing code before changing it, and read it well. Retrieval and tool access make system state, past decisions and architectural notes available to them. These are real improvements and they are all improvements at consuming the record. None of them produces it.

Persistence is the interesting case, because it looks like the answer. An agent with long-term memory of a system is present across the interval, which is the thing a fresh session lacks. But presence is not what generates the paragraph. The paragraph comes from having committed to something, having been wrong, and having revised what was worth keeping. An observer who did not decide accumulates a record. That is the artefact problem again, at a different location. And if some future arrangement does produce an agent that has accumulated the residue over years, the shape now resides in something an organisation cannot question counterfactually, cannot promote, and cannot ask to explain itself to a newcomer at the moment of confusion. That is a relocation of the problem rather than a solution to it, and arguably a worse position than the one it replaced.

None of this rules anything out. It leaves two questions, which any arrangement for building software has to answer, and which are the same two whatever writes the code.

Does the process stay open to signals that only arrive later?

And is there anybody still present who can act on them and pass them on?