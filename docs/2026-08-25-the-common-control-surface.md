# The common control surface

> A bridge crew operates one interface, under one discipline, and the
> interface's constraints make them legible to each other. That is the
> shape we want for an agent and a human working at a terminal.

## TL;DR

okuda is the LCARS for an agent-and-human bridge crew operating a common
control surface (the OKW silo) under the Edinburgh Protocol (the command
discipline). It renders the workflow's output so both officers can read
it at a glance, foxtrot oscar'ing anything that doesn't earn its place
at the station. This is a note on why that shape works, written in the
house style it argues for.

## The common control surface

- **One interface, not many.** The bridge crew doesn't each bring their
  own console with their own keys and their own palette. They share one
  interface, and the interface's constraints make them legible to each
  other.
- **The ops officer reads tactical at a glance.** Tactical renders the
  same way ops does. That is the stacked comparison without the
  comparison: shared chrome, shared rendering, shared affordances, so one
  crew member can read another's station. The badge says what the
  station is; the layout says what the state is; neither demands
  interpretation.
- **That is environmental readability at crew scale.** Not just
  operator-scale — the legibility extends from one person's screen to
  the crew's shared field. The Gloam badge is the station label; the
  house style is the rendering contract; OKW is the station layout.

## Restraint as interoperability

- **The bridge crew foxtrot oscar's constantly.** They don't add panels
  that don't earn their place. They don't add keys that duplicate another
  station's function. They don't decorate the board with mood lighting.
- **The tactical station has no copy button.** Operations handles data
  transfer. Adding one on tactical would be a second path for the same
  action, and second paths create confusion under pressure.
- **When Worf wants sensor data, he asks ops.** He doesn't build a
  parallel sensor readout on tactical. That is the no-copy-key principle,
  in Starfleet uniform.

> Restraint isn't poverty; it's interoperability. Every foxtrot oscar'd
> feature is a feature that doesn't conflict with another station's
> function.

## Agent and human, the same discipline

- **The agent and the human are the bridge crew.** The control surface
  is the silo — the OKW registries, the markdown documents, the task
  graph, the terminal itself. The agent writes; the human reads; both
  navigate the same registries.
- **Neither owns the surface; both operate it.** The agent's discipline
  (bold leads, hash headers, no raw HTML, soft returns stripped) and the
  human's discipline (quit before copy, view before ship, proceed slowly
  with intent) are the *same discipline* applied at different stations.
- **Shed what doesn't serve, surface what does, share the surface, don't
  duplicate.** That is the command protocol, in one line.

## The mapping, made explicit

- **The Edinburgh Protocol is the command discipline.** Hume's evidence
  over authority, Watt's shed-what-doesn't-serve, Smith's impartial
  spectator — the bridge crew's operating procedure, in Enlightenment
  dress.
- **okuda is the LCARS.** The rendering layer that composes structure,
  colour, and layout into a glanceable surface.
- **OKW is the station layout.** The named standard for the registries
  that make the crew legible to each other — briefs, decisions,
  debriefs, playbooks, each a station with a known function.
- **The house style is the rendering contract.** The author writes bold
  leads; the renderer colours them high-contrast; the calming effect
  lives in the coupling.

## Boldly going, with Hume's razor

> We are not boldly going anywhere. We are making a terminal markdown
> viewer that scans calm.

But the principle of boldly going — a shared mission, a shared surface,
a shared discipline, restraint as a virtue — is the thing instantiated,
even if the mission is "agent and operator can read the same debrief
without either fighting the renderer." A smaller bridge than Voyager's,
but the same shape. The shape is what makes it work.

## The mission, stated

**Proceed slowly with intent** was the method. **A common control
surface for an agent-and-human bridge crew** is the mission — the reason
the method is worth following. The method without the mission is just
caution; the mission without the method is just a wish. The weekend
found both.

Foxtrot oscar to everything else.

## A narrativised bibliography

The ideas are not new. They are old, found again at a terminal.

- **David Hume (1711–1776).** The skeptic. Evidence over inherited
  authority: a thing that had evidence once and has none now, goes. That
  is the foxtrot oscar principle, and it is the soft-returns reversal,
  and it is the setext neutralisation. Hume's razor applied to features:
  prove it earns its place, or it leaves.
- **Adam Smith (1723–1790).** The systems thinker. The Impartial
  Spectator — the check before shipping that catches the wrong root-cause
  hypothesis. The Wealth of Nations' insight that bad systems, not bad
  people, produce bad outcomes. Applied here: the reflow script broke
  numbered lists because the script's `is_structural` was incomplete, not
  because the operator was careless.
- **James Watt (1736–1819).** The improver. The separate condenser; the
  principle that improvement is shedding what does not serve. Every
  foxtrot oscar in the weekend is a Watt move — remove the soft returns,
  remove the setext, remove the borrowed palette, remove the copy key.
- **Michael Okuda (b. 1947).** The art director. LCARS, designed for a
  bridge crew reading status under pressure. Colour as signal, not mood;
  the line as the structure; readable at a glance. The homage is not
  aesthetic; it is constraint-convergent.
- **The Voyager bridge crew (fictional, 1995–2001).** The structuring
  metaphor. A common control surface, a shared discipline, restraint as
  interoperability. Captain Janeway's crew as the model for agent and
  human at a terminal.
- **Pierre de Fermat (1607–1665).** The margin note. "I have discovered
  a truly marvelous proof of this, which this margin is too narrow to
  contain" — the original "left as an exercise," the polite refusal to do
  the work. The authoring playbook inverts it: surface the discovery as a
  key, let the reader choose the doors.
- **The blueline process (diazo reprography, 20th century).** Blue lines
  on white, the standard for engineering drawings and seismic sections.
  The geophysicist traces horizons by eye under economic pressure; the
  blue line is the data. The diagram borders are blueline because the
  topology is the information, and structure should not recede.

The Edinburgh Protocol did not invent these ideas. It named them, and
applied them, at a terminal, on a weekend.
