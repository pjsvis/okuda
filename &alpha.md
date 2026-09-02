# &alpha — orientation

## what is this

- **okuda** renders restricted grammer markdown in the terminal pretty fast.

- **Gloam** combines fzf and okuda to find markdown files and render them.

- **Silo** gloam can be rooted in a silo, ie a github repo

- **Comms** gloam uses SSH for network communications

## how do i use this

**How to move.** Type a two-digit number to jump to the document beside
it. `u` (or Backspace) goes back to the previous document. `q` quits.
That is the whole vocabulary — number keys to go, `u` to return.

## The silo — jump table

| Destination | # |
|---|---|
| **Briefs** — what will we build? | **11** <!-- %%okuda-rhs:11%% briefs/index.md --> |
| **Decisions** — why did we choose X over Y? | **22** <!-- %%okuda-rhs:22%% decisions/index.md --> |
| **Debriefs** — what happened and why? | **33** <!-- %%okuda-rhs:33%% debriefs/index.md --> |
| **Playbooks** — how do we do X? | **44** <!-- %%okuda-rhs:44%% playbooks/index.md --> |
| **Live state** — `NOW.md` (where was I?) | **55** <!-- %%okuda-rhs:55%% NOW.md --> |
| **Explainers** — the quiet introduction | **66** <!-- %%okuda-rhs:66%% explainers/README.md --> |

A jump table is just a markdown file with `%%okuda-rhs:NN%%` wiring.
This is the default vector file; any other such file, once loaded,
rebinds the number keys to its destinations. `u` returns here.

## Notes

- This file sorts first by ASCII (`&` 0x26 beats `2` 0x32, so it
  precedes every dated file). The ugly prefix is the moat — no one else
  wants it, so it is ours alone.
- No logo, no colours, no chrome: okuda renders text in a fixed
  palette and rejects images (the grammar strips them). The branding
  *is* the absence of branding; the orientation *is* the landing page.
