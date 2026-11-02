#!/usr/bin/env bun
// gloam — the same entry point in launcher mode: search the silo, read, loop.
//
//  The mode is declared here rather than sniffed from argv, because a shebang
//  install resolves the bin symlink before we can look at it (see bin/okuda.ts).
//  The compiled binary keeps inferring, via `exec -a gloam` and `just install`.
import { main } from "../src/cli.ts";

await main({ asGloam: true });
