# The cahier — a claim with its evidence attached

> Status: **aligned**. Human-facing explainer. Read this if you have ever
> sent someone a document and then spent the next hour sending them the
> documents it referred to.

## The problem it solves

You write something. It refers to other things — a decision, a brief, a
source file, a record. You send it. Then the questions arrive: *where is
that? can you send me the other one? which version?*

So you send the folder. Now the folder has to travel intact, the links
have to be relative and correct, and the moment someone moves a file the
whole thing quietly breaks — not with an error, but with a link that
looks fine and goes nowhere.

**A cahier is the answer to that.** One file. The document, and everything
it refers to, already inside it.

## What it is

A **cahier** is a single HTML file holding a document and its references.
You open it in a browser. You read. When you reach a reference, you click
it and the referenced document opens over the page. You read that. You
close it, and you are exactly where you were.

That is the whole idea. Everything else is detail.

## The two things it does that a web page does not

**It dereferences in place.** A normal link is a door: you walk through
it and you are somewhere else, and the thing you were reading is gone.
A cahier's reference is a *panel* — it slides over the page, and closing
it puts you back. You never lose your place, and you never lose the
thread.

**It keeps your place in every reference.** Open one reference, scroll
halfway down, close it, open another, scroll, close that, and go back to
the first: it is still where you left it. Each reference remembers its
own position, because it was never destroyed — only moved aside.

Neither of those is possible with ordinary links, and both are things you
would expect from a book with your finger in it.

## What it will not do

**It will not go deeper than one level.** A reference's own references
are plain text. This is deliberate: a document that can dereference
forever is a document you get lost in, and the whole point is that you
can hold it in one hand. One level is the depth at which a map is still
a map.

**It will not need the network.** No fonts, no images, no scripts
fetching anything. Open it on a plane, in ten years, from a USB stick.
It will work.

**It will not clutter your back button.** Opening and closing references
does not add history entries, because you have not gone anywhere — you
are still in the same document, looking at one of its references.

## How to make one

```sh
just html docs/style-guide.md
```

That writes `html/2026-08-28-style-guide.html`. The date is the
document's own — the day it was written, not the day you published it —
so publishing it again gives the same name.

To look at what you have made:

```sh
just serve-html
```

That serves the folder with a listing, newest first, and you can click
through everything you have published.

## What it costs

Bytes, in proportion to what it holds. A cahier of the eighty decision
records is about 690 KiB and opens in twenty milliseconds. A cahier of
one document with five references is a few hundred.

For comparison: a typical blog post's header image is 150–300 KiB and
carries nothing at all. A cahier carries the argument *and* the evidence,
and works without a connection.

## Why it is called a cahier

A *cahier* is a gathering of leaves bound together — the unit a bookbinder
sews, and the word English borrowed as *quire*. It is also, in French,
an exercise book: the thing you are given to read and then say something
about.

Both senses are the point. It is bound — everything it needs is inside
it — and it is meant to be read and answered.

The full reasoning, including the names that lost, is in
[the naming record](../docs/2026-11-05-naming-the-cahier.md).

## Where to go next

- [The terminal](the-terminal.md) — why this silo lives in the glass, and
  what a cahier is a departure from
- [Colour](colours.md) — the palette a cahier inherits, and why half of it
  is yours
- [The reference record](../docs/2026-11-05-the-cahier.md) — the
  guarantees, the checks, and the pipeline, for when you need the detail
