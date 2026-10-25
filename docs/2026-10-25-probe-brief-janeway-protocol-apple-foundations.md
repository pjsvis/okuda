# Probe Brief: On-Device Speech-Actuated Janeway Protocol (Apple Foundation Models)

**Date:** 2026-10-25 **Status:** Open

---

## Context

To realize a deterministic, low-latency "Janeway Protocol" ("On screen, now") without cloud round-trip overhead or UI layout bloat, we need to probe the capabilities of Apple's on-device Foundation Models framework as a local speech-driven actuator.

## Objective

Design and execute a technical smoke test to evaluate whether Apple's on-device model runtime can reliably ingest ambient voice/text commands, map them via typed `@Generable` schemas, and trigger zero-latency workspace state transitions (projections) in a local environment.

## Scope

**In:**

- Local audio/text intent parsing via Apple on-device Foundation Models API.  
- Mapping natural language commands (e.g., "On screen, now", telemetry requests) to strict JSON tool-call payloads.  
- Local execution dispatch loop (the Actuator).  
- Verification of round-trip latency and offline capability.

**Out:**

- Cloud-based LLM routing or external API integrations.  
- Heavy graphical animation pipelines (maintaining Okuda-style static projection).

## Preconditions

- [ ] Target Apple silicon hardware with local Foundation Models support available.  
- [ ] Swift development environment configured with native generative model macros.

## Work Plan

- [ ] Define the strict JSON schema (`@Generable`) for the Janeway intent command space.  
- [ ] Write a minimal local Swift harness to capture text/speech input and pass it directly to the on-device model runtime.  
- [ ] Implement the local command dispatcher to handle state projection triggers (e.g., forcing telemetry grids into the viewport).  
- [ ] Conduct smoke tests measuring execution latency, parsing accuracy under colloquial/profane phrasing, and offline reliability.  
- [ ] Evaluate performance against the O(1) terminal rendering loop.

## Acceptance Criteria

* On-device model parses colloquial commands ("On screen, now") into exact tool payloads with zero cloud latency.  
* Structured typing (`@Generable`) eliminates fallback parsing errors or malformed state transitions.  
* Execution loop acts as a clean, deterministic actuator that respects the Okuda restful UI standard.

## Notes

Ensure the actuator maintains zero-friction 'backtrack' or cancel states to prevent operator lock-in. Keep it light, fast, and local.