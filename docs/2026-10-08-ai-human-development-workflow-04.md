**Title:** The territory vs. the map — idempotency, restartability, independence
**Source:** cool-pi-extensions silo — `ai-development-workflow-04` (the ancestor corpus)
**Written:** 2026-08-03 · **Landed:** 2026-10-08 (landing date is the record's date; the source date is provenance)
**Response:** `docs/2026-10-08-the-filename-is-a-record.md`
**Correction (2026-10-08):** the contract-vs-reality question below is okuda's **facade** check (Map vs. Territory); the man is **Jacques** Derrida, and the lexicon reserves *the Derrida Question* for the consideration-set gate. See the response.

That is the ultimate architectural checkmate.

When you ground your system in the **actual territory of the repo**, you turn external tooling from an unpredictable dependency into a completely disposable utility layer.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        THIRD-PARTY UNCERTAINTY                         │
│  Edge-Lord Models | Vector DBs | Graph RAG | Proprietary Agent Memory  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Evaluated & Filtered Against
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        REPO GROUND TRUTH (THE TERRITORY)               │
│  Co-Located READMEs | ISO Briefs & Debriefs | Justfile | marcus/td     │
└────────────────────────────────────────────────────────────────────────┘

```

---

## 1. The Territory vs. The Map

Third-party models, vector databases, and vendor-locked agent memories are merely **maps**—and as the epistemic rule goes, *the map is not the territory*.

* **The Third-Party Map:** Proprietary embeddings, vendor memory states, and
  frontier LLM reasoning are probabilistic estimations. They drift, expire, get
  compacted, or go offline.

* **The Repo Territory:** The plain-text source files, co-located invariant
  READMEs, ISO-prefixed briefs/debriefs, and `Justfile` targets are **concrete
  reality**.

If a $200/month edge-lord model or a graph database makes a claim about how a module works, **it has to prove it against the territory**. The repo acts as the supreme court. If the model's output violates a co-located invariant or breaks a `just test` check, the model's output is discarded. You get all the reasoning horsepower of high-end tooling without surrendering system sovereignty.

---

## 2. The Core Operational Properties

By treating software as a continuous process anchored directly in Git, the workflow gains three critical system properties:

### A. Idempotency (Safety Under Retries)

Because work is structured around explicit briefs, `Justfile` targets, and deterministic test passes, running an agent task multiple times produces the exact same system state.

* If an agent crashes halfway through, running `just brief` or re-executing the
  task from `marcus/td` doesn't stack duplicate logic or corrupt the codebase—it
  simply converges back to the declared invariant.

### B. Restartability (Zero Onboarding Latency)

Because context is persisted in `marcus/td` and plain-text ISO logs rather than hidden in a ephemeral agent session, a session can be killed at any moment.

* A new session (or a completely different human/AI operator) opens the repo,
  reads the current task state in $O(1)$ time, and picks up execution
  mid-stride. There is zero context lost and zero need to re-prompt or re-index.

### C. Agent Independence (Vendor Un-locking)

This is the real superpower. Because the interface is a simple `Justfile` and plain-text Markdown, **your workflow does not care which agent touches it**:

* Today you can run Claude Code or a frontier model via stdio.
* Tomorrow you can run a local, quantised 7B model on a laptop.
* Next week you can swap to whatever new tool hits the market.

None of your process changes. The agent is just a temporary worker passing through the workspace; the repo holds the operational memory and the control plane.

---

## 3. Summary Verdict

You can plug in whatever high-cost models, vector indices, or fancy UI harnesses you want. But they no longer own your architecture.

They are constrained to work **for** the repo, executing bounded tasks within explicit guardrails, validated by the continuous **Shannon Checksum**, and audited against the James Watt and Daniel Derrida questions.

If it isn't persisted in the territory, it didn't happen. If it can't survive inspection against the repo, it doesn't ship.