In the lineage of internet communication protocols, **Gemini** (`gemini://`) is the direct spiritual successor to Gopher and the antithesis of the modern Web.

Created in 2019 by a pseudonymous developer named **Solderpunk** and a community of protocol designers, it takes its name from Project Gemini (NASA’s bridge program between Mercury/Gopher and Apollo/the Web).

Its explicit mission: **"Heavier than Gopher, lighter than the Web."**

---

### 1. Architectural Design

Gemini solves the security and formatting pitfalls of Gopher without inheriting the runaway complexity of modern HTTP/HTML:

| Feature | Gopher (1991) | Gemini (2019) | Modern HTTP / Web |
| :--- | :--- | :--- | :--- |
| **Port** | 70 | 1965 *(year of Gemini 3 launch)* | 80 / 443 |
| **Encryption** | Plaintext (none) | **Mandatory TLS 1.2+** | Optional / HTTPS |
| **Trust Model** | None | **TOFU** (Trust-On-First-Use) & CAs | Centralized X.509 CAs |
| **Markup** | Menus (`0`, `1`, `7`) | **Gemtext** (`text/gemini`) | HTML5 + CSS + JavaScript |
| **Links** | Menu entries | **Line-only links** (`=>`) | Arbitrary inline `<a>` |
| **Tracking/Cookies** | None | **Forbidden / Absent** | Cookies, Fingerprinting, LocalStorage |
| **Auth** | None / Custom | **Client TLS Certificates** | Cookies, Bearer Tokens, OAuth |

---

### 2. The Protocol Flow: Radical Simplicity

A Gemini interaction is a clean, stateless exchange:

1. **Client connects over TLS** to TCP port 1965.
2. **Client sends URL:** `<URL>\r\n` (max 1024 bytes).
3. **Server sends 1-line header:** `<2-Digit Status><SPACE><META>\r\n`
4. **Server streams payload** (if status is `20`) and closes the connection.

#### The 2-Digit Status Code Families:
* `1x` — **Input Expected** (e.g., `10 Enter search query:`)
* `2x` — **Success** (`20 text/gemini`)
* `3x` — **Redirect** (`30 gemini://new-location.org`)
* `4x` — **Temporary Failure** (`40 Server unavailable`)
* `5x` — **Permanent Failure** (`51 Not found`)
* `6x` — **Client Certificate Required** (`60 Certificate required for login`)

---

### 3. Gemtext (`text/gemini`): The Anti-Distraction Format

Gemtext is a line-oriented markup language designed so that a parser can understand any line from its first 1–3 characters without maintaining complex parse trees:

```gemtext
# Heading 1
## Heading 2
### Heading 3

Regular paragraph text flows naturally. The client determines word-wrap,
margins, fonts, and colors. There are NO inline style tags (no bold, italic,
colors, or font switches).

* Bullet list item 1
* Bullet list item 2

> Blockquote line

=> gemini://geminiprotocol.net Project Gemini Home
=> /search?q=rfc Search RFCs
=> https://wikipedia.org An external Web link

```c
// Preformatted code blocks
int main() {
    printf("Hello Gemini\n");
    return 0;
}
```

#### The "No Inline Links" Rule
In Gemtext, **links must occupy their own line (`=>`)**. You cannot embed a clickable blue link in the middle of a sentence.
* **The Rationale:** Inline links disrupt reading flow and induce "hyperlink anxiety" (the urge to click away before finishing a thought). Separating text from navigation keeps reading calm and focused.

---

### 4. Interactivity & Identity in Geminispace

Gemini achieves rich interactivity without cookies or JavaScript:

1. **User Input (`1x` Status):**
   * Client requests `gemini://station.box/search`.
   * Server returns `10 Enter search terms:`.
   * Client shows a native dialog prompt to the user, then queries `gemini://station.box/search?query+terms`.
   * Status `11` signals sensitive input (like a password) so the client masks characters.

2. **Identity via Client Certificates (`6x` Status):**
   * If a service requires authentication (e.g., an interactive forum, wiki, or microblog), the server requests a Client TLS Certificate.
   * The client generates an ad-hoc or persistent cryptographic key pair.
   * The certificate's fingerprint becomes the user's pseudo-anonymous identity. No accounts, passwords, or data leaks.

---

### 5. Opinion: Why Geminispace Matters

* **The Sovereign User Agent:** On the Web, authors dictate layout, inject JavaScript, and track behavior. In Gemini, the **reader's client is sovereign**—it decides typography, colors, padding, and rendering.
* **Immunity to Enshittification:** Because the protocol physically cannot execute client scripts, load external trackers, render popups, or stream invasive autoplay video, it is structurally immune to the economic forces that degraded the modern Web.
* **The "Cozy Web":** Geminispace feels like the 1990s internet built with 2020s cryptography: home to developer logs, quiet essays, philosophical journals, and decentralized discussion boards, completely free of search-engine spam and algorithmic feeds.