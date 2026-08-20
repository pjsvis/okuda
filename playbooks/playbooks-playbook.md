# Playbook for Playbooks

## Purpose

A **Playbook** is a codified set of instructions, patterns, or standards for a specific repeatable task. It exists to reduce cognitive load, ensure consistency, and capture "tribal knowledge" into an explicit protocol.

## When to Write a Playbook

1. **Repeatability:** If a task will be done more than twice, write a playbook.
2. **Complexity:** If a task involves >3 steps or critical constraints, write a playbook.
3. **Discovery:** If you solve a novel problem ("First Contact"), write a playbook to guide future agents.
4. **Standards:** If there is a "Right Way" to do something (e.g., File Naming, Front-Matter Format), write a playbook.

## The Structure of a Playbook

Every playbook should follow this structure:

### 1. Title & Purpose

* **H1 Title:** Clear, operational title (e.g., "Export Playbook").
* **Purpose:** A single sentence explaining *what* this does and *why*.

### 2. Context & Prerequisites

* What tools are needed?
* What state must the system be in?
* Reference other playbooks if necessary.

### 3. The Protocol (The "How-To")

This is the core. Use numbered lists. Be imperative.
* **Step 1:** Do X.
* **Step 2:** Check Y.
    * *Constraint:* Watch out for Z.

### 4. Standards & Patterns (Optional)

If the playbook defines a *style* rather than a *process*, list the rules here.
* "Always use YAML front-matter."
* "Never rename Jekyll underscore directories."

### 5. Validation (How do I know I'm done?)

* Clear acceptance criteria.
* "The export script runs without error."
* "The post renders correctly on GitHub Pages."

## Maintenance

* Playbooks are living documents.
* If a playbook fails, **update it**. Do not bypass it and leave it broken.
* **Deprecation:** If a playbook is obsolete, add a `> **DEPRECATED**` banner at the top and link to the successor.
* **Review after use:** If you discover a gap while following a playbook, fix it and commit.

## The Knowledge System

Playbooks are part of a three-tier knowledge architecture:

| Tier | Directory | Contains | Answers |
|------|-----------|----------|---------|
| **Briefs** | `briefs/` | Work proposals and post outlines | "What should we write?" |
| **Playbooks** | `playbooks/` | Operational protocols and standards | "How do we do X?" |
| **Decisions** | `decisions/` | Architecture decision records | "Why did we choose X over Y?" |
| **Debriefs** | `debriefs/` | Retrospectives and lessons learned | "What happened and why?" |

Playbooks sit in the middle — they capture *how*, while the other tiers capture *what*, *why*, and *what happened*.

## Location

All playbooks reside in `playbooks/`.

Filename convention: `topic-playbook.md` or `topic-subtopic-playbook.md`.

## Related Playbooks

| Playbook | When to read |
|----------|-------------|
| `td-playbook.md` | Session startup and task management |
| `briefs-playbook.md` | Before drafting a post |
| `debriefs-playbook.md` | After publishing a post |
| `decisions-playbook.md` | When making a significant choice |
| `conventions-playbook.md` | Active conventions and barnacle removal |
| `barnacle-playbook.md` | How to identify and remove barnacles |
| `export-playbook.md` | Multi-platform distribution workflow |
| `blog-posts-playbook.md` | Jekyll pipeline reference |