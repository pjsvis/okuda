### 1. SSH (Secure Shell)

**What it is:**  
SSH (defined across RFCs 4251–4254) is a cryptographic network protocol that creates a secure, encrypted transport layer over an insecure network. Developed in 1995 by Tatu Ylönen to replace plaintext legacy utilities (`telnet`, `rlogin`, `rsh`), it has become the default management protocol for modern servers.

**Key Technical Strengths:**
* **Authentication Architecture:** Supports asymmetric public key cryptography (Ed25519, RSA), hardware security tokens (FIDO2/U2F keys via `sk-ssh-ed25519`), SSH certificates (for short-lived, CA-signed access without `authorized_keys` sprawl), and host key verification to defeat MITM attacks.
* **Stream Multiplexing & Tunnels:** A single authenticated SSH transport connection can multiplex multiple logical channels:
  * **Local/Remote Forwarding:** `-L` and `-R` for direct TCP tunneling.
  * **Dynamic SOCKS Proxy:** `-D` creates an ad-hoc SOCKS5 proxy server on the client.
  * **Subsystems:** Pluggable binary channels like SFTP and Git transport.
  * **Unix Domain Socket Forwarding:** Transparently forwarding local agent sockets (`ssh-agent`, GPG, Docker/Podman sockets).
* **Composability:** Because it cleanly bridges standard Unix streams (`stdin`, `stdout`, `stderr`), it functions as a universal pipe: `cat file.tar.gz | ssh remote "tar -xzf -"`.

---

### 2. Gopher

**What it is:**  
Created in 1991 at the University of Minnesota (led by Mark P. McCahill) and formalized in RFC 1436, Gopher is an application-level protocol designed for hierarchical document discovery and retrieval across networks.

**Protocol Characteristics:**
* **Ultra-Lightweight & Stateless:** Operates over TCP port 70. A transaction consists of:
  1. Client connects to server.
  2. Client sends a selector string followed by `CRLF` (e.g. `/docs/origin.txt\r\n`).
  3. Server streams the resource and **immediately closes the connection**.
* **Menu-Driven Information Architecture:** Unlike the Web (where links are embedded arbitrarily inside document prose), Gopher structures information as clean, typed menu listings.
* **Line Protocol:** Gopher menus are simple tab-delimited records with a 1-character type indicator:
  ```text
  <ItemType><User-Visible Label>\t<Selector>\t<Host>\t<Port>\r\n
  ```
  * Common Item Types: `0` (text file), `1` (menu/directory), `7` (search/index query), `i` (informational text line), `h` (HTML link), `9` (binary), `g`/`I` (image).

---

### 3. Interactivity in Gopher

While Gopher is often remembered as static text menus, it was designed with intentional mechanisms for user interaction:

1. **Item Type 7 (Search / Index Queries):**
   * When a user selects a `7` item, the Gopher client opens a prompt for search terms.
   * The client transmits: `<selector>\t<query terms>\r\n`.
   * The server executes the query (originally against search engines like WAIS or Veronica) and returns a dynamically constructed Gopher menu of matching results.

2. **Gopher "Moles" (Dynamic Scripts / CGI Precursors):**
   * Selectors can route to dynamic backend scripts (moles) rather than static files.
   * By parameterizing selectors or chaining Type 7 search queries, developers created interactive bulletin boards, live weather updates, text-based calculators, and even multi-user dungeon / interactive fiction games.

3. **Gopher+ Extensions (1993):**
   * Introduced **`ASK` blocks (interactive forms)**: When requesting an item, the server could send back an `ASK` questionnaire (requesting text inputs, choices, or passwords). The client presented an interactive form modal, collected the user's input, and posted it back to the server.
   * Added metadata queries (`!?`), item attributes, and alternative content representations (e.g. plain text vs PostScript).

4. **The Interaction Constraints:**
   * Gopher has no cookies, no request headers, no inline JavaScript, and no client-side DOM.
   * All state must be encoded into selector paths or managed server-side. Every click is a pure, clean navigation event.

---

### 4. Opinion & Perspective

* **Why HTTP Won over Gopher:**
  * **Document model:** Tim Berners-Lee’s hypermedia model won because arbitrary inline links in prose (`<a>` tags) were vastly more natural for literature, research, and self-expression than rigid menu trees.
  * **Licensing blunder:** In 1993, the University of Minnesota announced commercial licensing fees for their Gopher implementation. CERN immediately placed the World Wide Web software into the public domain (and later open source), cementing the Web's dominance.
* **The Renaissance of Small Internet:**
  * The modern Web is plagued by megabytes of JavaScript, client-side tracking, aggressive cookie banners, and bloated DOM trees.
  * Gopher (and its modern successor, **Gemini** / `gemini://`) represents an inspiring philosophy: **content-first, zero-surveillance, keyboard-driven navigation with negligible compute overhead**. In Gopher and Gemini, the user agent (the browser) retains complete control over typography, presentation, and privacy.
* **SSH as the Pinnacle of Internet Engineering:**
  * If the Web is the internet's billboard, SSH is its nervous system. It represents the best of the Unix philosophy: do one thing (secure transport), do it extraordinarily well, and compose with everything.