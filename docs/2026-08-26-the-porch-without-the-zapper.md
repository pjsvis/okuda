# The Porch Without the Zapper

*2026-08-26. Lore, not law — but it explains three laws we'd already written.*

## The scene

Citizen Ruth (1996), Alexander Payne's first film. Ruth Stoops, the
paint-huffing heroine courted by both sides of the abortion wars, is out
on a porch at night with a beer, staring at a bug zapper. Someone asks
her a question. She can't answer — she's entranced. The bug circles;
the light promises; zap. It's a redneck Saturday night: beer, porch,
a light engineered to attract attention and convert it, on a loop,
forever.

(Paraphrase, from memory — the moment, not the verbatim script. The
moment is what matters: nothing happens, and everything is
communicated. Beer, porch, zapper, a question that cannot penetrate.)

## The reading

That scene is the business model we declined. The bug zapper is the
infinite feed — a light built to attract attention and convert it into a
small dead pile, endlessly. Someone asks you a question; you can't
disengage; zap; another arrives. 1996's porch was the prototype; twenty
years of platform engineering industrialised it. "Read next."
Related posts. The KPI that dare not speak its name: time-on-site.
Ruth is every user. The zapper is engagement metrics. The beer is free
because *you're* the product being processed.

## The porch we built instead

Okuda/Gloam and the gopher feed are an anti-zapper, mostly by refusing
things:

- **A post has a bottom.** `G` jumps to it, and it exists. The
  document ends; the reader hands you back to a picker showing a finite
  list on one screen — not a stream with no floor.
- **Esc drops the connection.** Every exit is one keystroke and always
  works.
- **The server cannot measure entrancement even if it wanted to.** No
  analytics, no session metrics, no time-on-site. A connection, a PTY,
  some bytes. The impartial spectator keeps no dossier.
- **Nothing in the reader shouts.** The palette census — headings the
  only loudest, URLs at 27% luminance, bold's weight discount with its
  floor — was unwittingly a campaign against the porch light. Chrome
  that permits, never demands.

Hume: custom is the great guide of life — the zapper works because
habit walks you back to the light. The counter isn't willpower; it's
architecture. Finite documents. Chrome that permits. A palette where
nothing grabs the eye and holds it against the will.

## The claim

When the feed is up and a stranger SSHes in at 2am, the honest claim is
not "we built a gopher server." It is: **we built the porch without the
zapper.** The beer, the stars, the conversation — and when the post
ends, the only light left on is the one you brought.

## Notes

- Operational home: the restraint ledger and census in
  `playbooks/chrome-playbook.md`; the refusals live there, the story
  lives here.
- Feeds the forthcoming ADR-011 (gopher-serve as origin) — v1 of
  `briefs/2026-08-26-brief-ssh-blog-feed.md`.
- Distribution surfaces (Medium, Substack, GitHub Pages) are renders;
  the blog-posts folder is the origin. This doc is why the origin is
  worth pointing at.
