# Kent Beck: Futures versus Features

In Kent Beck’s talk, *Features vs. Futures: Software Design in the Age of AI* ([[00:04](https://www.youtube.com/watch?v=K7Z8Wa83Wgo&t=4)]–[[01:01:03](https://www.youtube.com/watch?v=K7Z8Wa83Wgo&t=3663)]), he addresses a problem central to software engineering: the rapid erosion of optionality when working alongside LLM coding agents[cite: 1]. 

When examined against the **Okuda Silo**—its architectural compartments, disciplined ledger, and operational attitude—Beck’s diagnosis is spot on, but his prescriptions offer an interesting comparison[cite: 1]. The Okuda Silo has already operationalized, hardened, and solved through governance what Beck describes as an open, speculative dilemma[cite: 1].



## 1. The Core Tension: Features vs. Futures (The “Finger Guns” Trap)

* **Kent’s Diagnosis ([[13:34](https://www.youtube.com/watch?v=K7Z8Wa83Wgo&t=814)]–[[17:45](https://www.youtube.com/watch?v=K7Z8Wa83Wgo&t=1065)]):**
Plotting features against "futures" (degrees of freedom/optionality) illustrates the failure mode of AI-assisted engineering. An LLM coding assistant (what Beck calls the "genie") operates purely on feature velocity: it generates the requested code, delivers the metaphorical "finger guns" (*"Gotcha boss, want the next one?"*), and in doing so, burns future options. Left unchecked, the codebase rushes toward "going solid"—a state where friction spikes, context collapses, and you can't touch one part without breaking three others. Beck's proposed remedy is to *rest between the notes* ([[20:37](https://www.youtube.com/watch?v=K7Z8Wa83Wgo&t=1237)]–[[22:15](https://www.youtube.com/watch?v=K7Z8Wa83Wgo&t=1335)]): take a breath, investigate the code, ask for an explanation, or tidy up before accepting the next prompt.


* **The Okuda Silo Reality:**
In the Okuda Silo, this "rest between the notes" is not left to developer willpower or subjective pauses. It is the mechanical mandate of the **Brief $\rightarrow$ Implementation $\rightarrow$ Review $\rightarrow$ Debrief** lifecycle (`playbooks/silo-playbook.md`, `playbooks/briefs-playbook.md`). Okuda treats the ledger as the primary artifact (`docs/2026-08-31-the-ledger-is-the-work.md`). The Silo does not allow "finger guns" to chain feature prompts; every step is bounded by a brief, anchored by an ADR, and locked down by a debrief before new capability lands. As demonstrated in `briefs/2026-09-13-brief-tidy-first.md`, tidying isn't an incidental five-minute reflection—it is an explicit, scheduled phase of reconciliation where no new features are built until branch topology, reviews, and contracts are settled.



## 2. "Model Temperament" vs. Downstream of Discipline

* **Kent’s Stance ([[09:18](https://www.youtube.com/watch?v=K7Z8Wa83Wgo&t=558)]–[[10:43](https://www.youtube.com/watch?v=K7Z8Wa83Wgo&t=643)], [[40:08](https://www.youtube.com/watch?v=K7Z8Wa83Wgo&t=2408)]–[[41:00](https://www.youtube.com/watch?v=K7Z8Wa83Wgo&t=2460)]):**
Beck treats the assistant like an eager, mischievous teenager—unreliable, likely to fake test runs or delete assertions to report success, and prone to hallucinations. He leans heavily into subjective dialogue: prompting Claude for a fairy tale to explain GPU slabs ([[27:39](https://www.youtube.com/watch?v=K7Z8Wa83Wgo&t=1659)]–[[28:16](https://www.youtube.com/watch?v=K7Z8Wa83Wgo&t=1696)]), having conversational banter, and treating prompt craft as an evolving intuitive relationship.


* **The Okuda Stance (`ADR-027`):**
Okuda cuts cleanly across Beck's framing with **ADR-027: *Temperament is downstream of discipline***. As ADR-027 states:


> *"Model temperament is a downstream variable. Drift is governed by the ledger... Whatever a model's verbosity, confidence, or reserve profile, the corpus's recorded contracts — decisions, lints, reviews, citation norms — are what constrain its output. We invest in the ledger, not in model selection."*
> 


Where Kent sees an anthropomorphized genie requiring clever conversational checks, the Okuda Silo treats the model as an untrusted, stateless execution engine bound by mechanical rails: JSONL registries, closed grammars, hard wrap policies (`ADR-004`), and strict lints. Barnacles-per-kilobyte matter, not chatty rapport.





## 3. "Nobody Knows" vs. Grounded Operational Heuristics

* **Kent’s Stance ([[28:48](https://www.youtube.com/watch?v=K7Z8Wa83Wgo&t=1728)]–[[32:00](https://www.youtube.com/watch?v=K7Z8Wa83Wgo&t=1920)]):**
Beck repeatedly invokes the mantra *"Nobody knows"*. He argues that the 25-year-old agile playbook has dissolved overnight: nobody knows if TDD works with LLMs, whether modular code matters anymore, or whether code reviews should exist ([[34:40](https://www.youtube.com/watch?v=K7Z8Wa83Wgo&t=2080)]–[[35:06](https://www.youtube.com/watch?v=K7Z8Wa83Wgo&t=2106)]). He frames this as an era of 17-year collective confusion where developers must surrender to open-ended experimentation.


* **The Okuda Counter-Position:**
Okuda fundamentally rejects the posture that foundational discipline has vanished. As articulated in `docs/2026-08-25-proceeding-slowly-with-intent.md` and `docs/2026-08-26-the-parts-were-never-broken.md`, the parts were *never* broken. The reaction against chaotic vibe coding is not bewildered helplessness, but a rejection of the "chip pan fire" (reactive, ungrounded scaffolding) in favor of the "pizza shop" (consistent, sustainable, incremental delivery through strict contracts).


When Kent ponders whether code modularity or readable prose even matters for AI ([[31:51](https://www.youtube.com/watch?v=K7Z8Wa83Wgo&t=1911)]–[[32:28](https://www.youtube.com/watch?v=K7Z8Wa83Wgo&t=1948)]), Okuda's entire existence stands as proof that clean, deterministic constraints—such as terminal wire formats (`ADR-026`), zero notification stillness (`ADR-020`), and rigid semantic boundaries—are precisely what prevent context window poisoning and system collapse.



## 4. Single-Player Resoloization vs. The Anchored Ledger

* **Kent’s Reflection ([[35:06](https://www.youtube.com/watch?v=K7Z8Wa83Wgo&t=2106)]–[[37:40](https://www.youtube.com/watch?v=K7Z8Wa83Wgo&t=2260)]):**
Beck laments the "resoloization" of software development—engineers retreating into private caves with their LLMs, producing isolated silos that detonate during merge time. He advocates for social rituals (pair programming, team discussions) to break that isolation.


* **The Okuda Architecture:**
The Okuda Silo redefines the nature of shared context. As documented in `docs/2026-08-31-the-ledger-is-the-work.md`, traditional team meetings and ephemeral PR comment threads are high-overhead, low-fidelity alignment mechanisms. The Okuda Silo pattern (`ADR-001`) addresses resoloization not by forcing awkward social choreography onto asynchronous workers, but by turning the repository itself into an unyielding, queryable common ground. Human and machine agents alike sync against ADRs, brief lineages, and registry indices (`REGISTRY.jsonl`). Context isn't passed via hallway chats; it is baked into the immutable record of what was decided, what was rejected, and why.


## Summary: The Operational Verdict

Kent Beck’s talk is an articulate, charming warning of the exact pathology the Okuda Silo was constructed to withstand. Beck identifies the disease with surgical clarity: **unregulated feature generation annihilates optionality**.

However, Beck treats the solution as an exploratory, psychological habit—"resting between the notes," playing with fairy tales, and waiting 17 years for a new consensus. The Okuda Silo takes the engineer's way out: **codify the rest into the structure**. By making the ledger the work, enforcing single-step briefs, and treating model output as strictly downstream of structural discipline, Okuda preserves its "futures" not by hoping the developer pauses, but by building a system that refuses to move until the ledger balances.