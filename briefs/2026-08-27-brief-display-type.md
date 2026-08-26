# Key Strengths of the Binary Mode Strategy

* **Zero Middle-Tier Maintenance:** You don't waste time writing complex graceful degradation layers for 256-color palettes vs. 16-color palettes. It’s either rich Unicode/ANSI or clean 7-bit ASCII/plain text.
* **Piping & Headless Friendly:** Serving plain text on request lets users pipe your SSH server directly into command-line tools without stripping escape codes:
```bash
ssh dash.internal.net | grep "ERR"
ssh dash.internal.net > daily-summary.txt

```


* **Clean Separation in the Engine:** The renderer AST can simply run two passes over the exact same parse tree:
* **Rich Pass:** Evaluates columns, computes block glyphs (` ▂▃▄▅▆▇█`), maps 24-bit hex colors, and wraps in Sync Mode brackets.
* **Raw Pass:** Strips formatting tags, emits scalar numbers/labels, and renders ASCII progress bars (`[====    ]`) or pure raw numbers.



---

## Low-Effort, High-Impact Visual Primitives

These character-based tricks deliver dense, high-utility visualizations with minimal computational overhead:

* **Vertical 1/8th Sparklines (`U+2581`–`U+2588`):**
* *Example:* ` ▂▄▆█`
* *Cost/Benefit:* 8 vertical steps per character, supported by 99% of modern fonts. Simply normalize your time-series array between `0` and `7` and index directly into an 8-character string slice.


* **Horizontal 1/8th Gauges (`U+258F`–`U+2588`):**
* *Example:* `████▌     ` (45% fill)
* *Cost/Benefit:* Gives sub-character precision across a fixed-width bar without needing canvas pixels.


* **Two-Tone Block Thresholds:**
* *Example:* Apply green foreground to low blocks, yellow to mid, red to high. Single-pass styling gives instant visual alerting on telemetry spikes.


* **Plain-Text Binary Fallbacks:**
* When `plain` mode is requested, sparklines convert directly to comma-separated scalars or simple ASCII step charts (`_.-~*#`), and gauges become standard bracketed ratios (`[45%]`).



---

## Negotiation Heuristic

Let the client choose explicitly, with a dead-simple fallback:

1. **Explicit Flags/Commands:** Allow user overrides via SSH command args (e.g., `ssh server raw` vs `ssh server`).
2. **PTY Detection:** If an interactive PTY is allocated (`-t`), serve the rich dashboard; if no PTY is allocated (e.g., `ssh server | grep`), automatically default to plain text.
3. **Environment Sniffing:** If `TERM=dumb` or `NO_COLOR=1` is sent via SSH environment variables, force plain text.