#!/usr/bin/env bun
// okuda — the reader. See bin/gloam.ts for the same entry point in launcher mode.
//
//  Two files rather than one, because a shebang install cannot tell them apart:
//  the kernel resolves npm's bin symlink before the interpreter runs, so argv[0]
//  is the interpreter and argv[1] the real script — the bin name is gone by the
//  time we could read it (measured 2026-11-02). The entry point therefore
//  declares its mode instead of having it inferred from a filename.
import { main } from "../src/cli.ts";

await main();
