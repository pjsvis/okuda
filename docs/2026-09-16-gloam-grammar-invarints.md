**Title:** ‎Gemini – direct access to Google AI
  
**Source:** [https://gemini.google.com/share/ebf8003ae7d1?skid=89d95120-ba52-4a10-b037-a5858f932bf7](https://gemini.google.com/share/ebf8003ae7d1?skid=89d95120-ba52-4a10-b037-a5858f932bf7)

---

##### You said - how can we provide discovery for the grammar - currently our process is to just show a list of the…

> how can we provide discovery for the grammar

> currently our process is to just show a list of the markdown files in the root CWD, that's it

> a document file can contain single-level references to other files

> these references can be dereferenced and rendered, without further references

> opinion

Dumping an unorganized flat list of files at the root throws away the very coordinate system you built. It forces the human eye or ear to parse raw filenames instead of communicating what the system actually understands.

To provide discovery for both speech and visual UI without breaking your performance envelope, exploit two boundaries you already have: the **finite category vocabulary** and the **one-level document reference graph**.

### 1\. Zero-Query Landing: Expose Affordances, Not File Dumps

When GLoam launches in a repository root, the default view (and spoken prompt) should communicate the grammar's entry points.

-   **For the Ear:** A brief audio prompt establishing state and categories:

    > _"Connected to repo. Seven playbooks, twelve decisions, three advisories. What are you looking for?"_ This implicitly teaches the user the allowed nouns (`playbooks`, `decisions`, `advisories`) without a tutorial.

-   **For the Eye (Okuda UI):** A horizontal billboard or card rack showing the top-level categories and their newest additions:

| Category | Count | Latest Entry |
| --- | --- | --- |
| **playbooks/** | 7 | `2026-09-12-failover-drills.md` |
| **decisions/** | 12 | `2026-09-02-streaming-rpc.md` |
| **advisories/** | 3 | `2026-08-15-deprecate-v1-api.md` |

This turns discovery from a messy directory dump into a menu of valid grammar tokens.

### 2\. Exploiting Single-Level References (The Flat Star Graph)

A document pointing to other documents with a hard guarantee of **no nested references** forms a trivial star graph:

```
[ Root / Focal Doc ]
       ├── Reference A (leaf)
       ├── Reference B (leaf)
       └── Reference C (leaf)
```

Because references are strictly leaf nodes with recursion depth = 1:

-   **Bounded Bundle Resolution:** Dereferencing is pure and bounded. If a document references three others, the engine resolves a fixed set of four files. There is zero risk of cycle detection, stack overflow, or runaway traversals.

-   **Discovery via "See Also" Spoken Affordances:** When reading a document aloud, the audio renderer can append immediate next actions:

    > _"...end of decision. Related documents: Playbook for failover drills, and Advisory on deprecation. Say 'read failover' to switch."_

-   **Compound Okuda Rendering:** Visually, Okuda can stitch these references into a single composite view: the primary document occupies the center panel, while the dereferenced leaves render as preview ribbons or adjacent cards, ready to read without navigation.

### 3\. Syntax for References

Since your filenames are canonical coordinates, references inside Markdown should stay equally strict:

Markdown

```

# Decision: Streaming RPC

Adopt gRPC streams for telemetry.

## Related
- [playbooks/2026-09-12-failover-drills.md]
- [advisories/2026-08-15-deprecate-v1-api.md]
```

By enforcing that links use the explicit `category/YYYY-MM-DD-slug.md` format:

-   Dereferencing is a single string lookup.

-   The parser never executes a filesystem search to resolve a link.

-   If a link points to a file with further references, the engine simply ignores them, honoring the depth-1 invariant.

Discovery stops being a blind crawl across the disk. The root shows the valid categories, the categories expose recent slugs, and the documents themselves supply bounded paths to their immediate neighbors.





### (GLoam) for rendering (Okuda) markdown files and in the browser there i…

\- we have a document browser (GLoam) for rendering (Okuda) markdown files and in the browser there is a search mechanism for all markdown files in the folders below CWD

\- now let's consider some system invariants and boundary conditions

\- too many docs and the search gets slow because we are doing a full text search as well

\- the fact that we prepend our filenames with ISO-date-strings seems to have been really successful

\- if we start the GLoam in the root of a machine it is immediately unusable

\- from a human factors point of view we are designing things pretty much speech first, then considering the visual UI

\- so we have linear stream of text and we have humans to assimilate the rendered audio streams

\- what constraints can we exploit to turn our variables into parameters to feed into pure functions

\- how can we ensure that when we fire up GLoam we never encounter the Computer Says No issue right from the get go

\- opinion

### Gemini said

Running full-text search across an unbounded directory tree from `/` isn't a search problem; it's a boundary failure. By applying the Operational Heuristic—looking strictly at what the system physically does across time, storage, and audio bandwidth—we can turn those chaotic variables into bounded parameters for pure functions.

### 1\. Exploiting Invariants into Pure Function Parameters

To make the search pipeline a pure function `search(query, corpus_slice, limits) -> results`, we need to freeze the environment into deterministic inputs.

-   **The ISO-Date Prefix as a Temporal Partition:** Since filenames start with `YYYY-MM-DD`, you have an instant cheap index baked into the path strings without reading file descriptors or inodes.

    -   _Constraint transformation:_ Do not treat time as an open query. Treat it as a window parameter: `TimeWindow(start, end)`.

    -   _Mechanism:_ A pure filter function selects candidate file paths purely on string lexicography before a single byte of disk I/O occurs.

-   **The "Speech-First" Invariant (The Ear is Narrower than the Eye):** Visual UI tolerates 200 fuzzy hits in a scroll pane. Speech tolerates roughly 3 to 5 chunks before working memory evaporates.

    -   _Constraint transformation:_ Unbounded search results are meaningless in an audio-first system. The return parameter is strictly clamped: `K_MAX = 5`.

    -   _Pure reduction:_ The search function does not emit an array of every hit; it folds over the corpus and terminates evaluation early once confidence thresholds or top-K bounds are satisfied.

-   **Folder Depth and Subtree Volume Boundaries:** Instead of recursively walking until the OS cries, pass a hard structural envelope: `MaxDepth = 3`, `MaxFiles = 500`. Anything beyond that threshold is discarded as an out-of-bounds candidate before touching file contents.

### 2\. Eliminating the "Computer Says No" on Startup

The "Computer Says No" state happens when the application eagerly tries to index an infinite space, blocks the main thread, runs out of memory, or returns an un-parseable dump of 50,000 files.

To guarantee instant utility at startup—even in `/`:

-   **Lazy Shell, Not Eager Indexer:** GLoam should start instantaneously with zero background disk reads. On launch, the initial state is empty, valid, and responsive.

-   **Strict Scope Invariants (The Root Trap):** Introduce a boot-time check on `CWD`:

    -   If `CWD` is root (`/`), a mount point, or home (`~`), GLoam refuses to recurse blindly.

    -   Instead of failing or halting, it sets the operational scope to a safe default: either _immediate directory only_ (`depth=1`), or prompts the speech interface: _"Current working directory is root. Scope to recent notes, or name a subdirectory?"_

-   **Two-Tier Search Pipeline (Name First, Content on Demand):** Never run full-text search across an unverified volume.

    -   **Tier 1 (Instant):** Regex/prefix filter on filename strings (exploiting the ISO date and slug). This runs in single-digit milliseconds across millions of paths.

    -   **Tier 2 (Deferred):** Full-text grep inside the Okuda markdown body runs _only_ on the files that survive Tier 1, or within an explicitly bounded sub-tree (`N < 100` docs).

### Operational Architecture

```
[ CWD ] ---> ( Scope Guard ) 
                   │
         [ Valid Bounded Path ]
                   │
           ( ISO-Date Filter )  <--- Temporal Parameter (e.g., Last 30 Days)
                   │
           [ Candidate Paths ]  (Max N = 100)
                   │
           ( Full-Text Grep )   <--- Pure function over memory-mapped strings
                   │
           ( Top-K Reducer )    <--- Audio Bandwidth Constraint (K = 3 to 5)
                   │
          [ Synthesizer Feed ]
```

### Strategic Take

If your primary interface is speech, **full-text search across arbitrary depths is an anti-pattern**. Humans searching by ear do not want grep output; they want orienting landmarks.

Lean completely on your ISO dates and top-level directory names to segment the corpus horizontally. Search should default to _"what was I doing last week in project X?"_ rather than _"find every instance of the word 'the' on the NVMe drive."_ By enforcing that the system only processes files matching a known temporal bracket or naming pattern, search remains sub-10ms, deterministic, and tailored to human auditory limits.

##### You said - we have top folders called briefs, debriefs, decisions, playbooks, and docs, advisories, and expla…

\- we have top folders called briefs, debriefs, decisions, playbooks, and docs, advisories, and explainers, and there could be others eventually

\- the folder structure in our Silo repos is pretty flat and we only deal with \*.md files

\- dates and folder names sounds like a grammar that could come together

\- opinion

###### Gemini said

You don't just have a folder convention here; you accidentally built a deterministic coordinate system.

When you combine a flat tree, known document classes, and ISO-8601 prefixes, you eliminate the need for fuzzy heuristics. You can treat file resolution as parsing an unambiguous formal grammar, perfectly tailored for spoken command streams.

### The Grammar: Document Coordinate Space

Because a speech interface needs rapid disambiguation without back-and-forth roundtrips, every document can be expressed as a tuple:

In speech and path terms, this maps directly to:

Plaintext

```
[Repository/Silo] / [Document Class] / [YYYY-MM-DD]-[Slug].md
```

#### Lexical Tokens

-   **Classes ():** `briefs`, `debriefs`, `decisions`, `playbooks`, `docs`, `advisories`, `explainers` (extensible set).

-   **Temporal Anchors ():** `latest`, `yesterday`, `last week`, `last quarter`, `March 2026`, or explicit `YYYY-MM-DD`.

-   **Entity / Topic ():** Keyword tokens matching the slug or frontmatter.

#### Spoken Utterance Mapping

Because the grammar is orthogonal, speech inputs map deterministically to parameter filters:

-   _"Play the latest advisory on ingestion"_

    `filter(class='advisories', sort=DESC, topic='ingestion', limit=1)`

-   _"What decisions did we make last month?"_

    `filter(class='decisions', window='2026-08', limit=5)`

-   _"Open the playbook for schema migration"_

    `filter(class='playbooks', topic='schema-migration', limit=1)`

### Why This Wins

-   **Zero I/O Routing:** If the utterance specifies or implies an intent class (`playbook`, `decision`, `brief`), you immediately prune 85%+ of the search space before touching disk. You only scan the directory corresponding to that token.

-   **Speech Alignment (Natural Verbs to Nouns):** Human speech maps neatly to these categories:

    -   _“What was decided…”_ `decisions/`

    -   _“How do we run…”_ `playbooks/`

    -   _“Summarize the post-mortem…”_ `debriefs/` The vocabulary of your workflow doubles as the navigation syntax.

-   **Extensibility Without Architecture Churn:** When a new class arrives (e.g., `specs/` or `audits/`), you don't rewrite search heuristics. You register a new token in the parser's category enum and mount the folder.

### The Boundary Trap to Avoid

Keep the folders strictly **categorical, not thematic**.

-   **Good:** `decisions/2026-09-02-streaming-rpc.md` (Type = Decision, Topic = Streaming RPC).

-   **Bad:** `streaming-rpc/decisions/2026-09-02.md` (Theme as top-level).

Once folders become themes or projects, hierarchies proliferate, depth becomes unbounded, and the speech parser loses its clear structural anchor. Keep the top level flat and restricted to _form/genre_, let the ISO date handle _when_, and let the filename slug handle _what_.

##### You said - lets write that EBNF grammar

\- lets write that EBNF grammar

###### Gemini said

An EBNF grammar defining both the physical file-coordinate path structure and the spoken utterance domain that maps directly onto it.

EBNF

```
(* ========================================================================= *)
(* 1. Top-Level Utterance Stream                                            *)
(* ========================================================================= *)

SpokenQuery         ::= [ ActionPhrase ] DocumentSpec [ FullTextFilter ] EOF ;

ActionPhrase        ::= "read" | "play" | "open" | "find" | "summarize" 
                      | "what was" | "what did we" | "how do we" ;

(* ========================================================================= *)
(* 2. Semantic Document Coordinates                                         *)
(* ========================================================================= *)

DocumentSpec        ::= ( CategorySelector [ TemporalSelector ] [ TopicSelector ] )
                      | ( TemporalSelector CategorySelector [ TopicSelector ] )
                      | ( [ TemporalSelector ] TopicSelector CategorySelector ) ;

CategorySelector    ::= "brief"       | "briefs"
                      | "debrief"     | "debriefs"
                      | "decision"    | "decisions"
                      | "playbook"    | "playbooks"
                      | "doc"         | "docs"
                      | "advisory"    | "advisories"
                      | "explainer"   | "explainers"
                      | DynamicClass ;

DynamicClass        ::= Identifier ;

(* ========================================================================= *)
(* 3. Temporal Expressions (Transforms into ISO Prefix Bounds)              *)
(* ========================================================================= *)

TemporalSelector    ::= RelativeAnchor | ExplicitDate | CalendarWindow ;

RelativeAnchor      ::= "latest" | "last" | "recent" | "yesterday" | "today" ;

CalendarWindow      ::= "last week" | "this week" 
                      | "last month" | "this month" 
                      | MonthName [ Year ]
                      | Year ;

ExplicitDate        ::= Year "-" Month "-" Day ;  (* Literal ISO token: 2026-09-16 *)

(* ========================================================================= *)
(* 4. Content Selectors                                                      *)
(* ========================================================================= *)

TopicSelector       ::= [ "about" | "on" | "for" ] TopicSlug ;

TopicSlug           ::= Word { "-" Word | " " Word } ;

FullTextFilter      ::= ( "mentioning" | "containing" | "with" ) SearchTerms ;

SearchTerms         ::= Word { " " Word } ;

(* ========================================================================= *)
(* 5. Physical Filesystem Coordinate Target                                 *)
(* ========================================================================= *)

StoragePath         ::= SiloRoot "/" CategoryFolder "/" FileTarget ".md" ;

SiloRoot            ::= { "/" | PathSegment } ;

CategoryFolder      ::= "briefs" | "debriefs" | "decisions" | "playbooks" 
                      | "docs" | "advisories" | "explainers" | DynamicClass ;

FileTarget          ::= IsoDatePrefix "-" FileSlug ;

IsoDatePrefix       ::= Year "-" Month "-" Day ;

FileSlug            ::= SlugSegment { "-" SlugSegment } ;

(* ========================================================================= *)
(* 6. Primitives & Lexemes                                                   *)
(* ========================================================================= *)

Year                ::= Digit Digit Digit Digit ;
Month               ::= "0" Digit | "1" ( "0" | "1" | "2" ) ;
Day                 ::= ( "0" | "1" | "2" ) Digit | "3" ( "0" | "1" ) ;

MonthName           ::= "january" | "february" | "march"     | "april" 
                      | "may"     | "june"     | "july"      | "august" 
                      | "september" | "october" | "november" | "december" ;

PathSegment         ::= AlphaNum { AlphaNum | "_" | "-" } ;
SlugSegment         ::= AlphaNum { AlphaNum } ;
Word                ::= Letter { Letter } ;
AlphaNum            ::= Letter | Digit ;
Digit               ::= "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" ;
Letter              ::= "a" | ... | "z" | "A" | ... | "Z" ;
Identifier          ::= Letter { AlphaNum | "_" } ;
```

### AST Target Output

Evaluating `SpokenQuery` produces a compact intermediate representation to parameterize the file walk:

JSON

```
{
  "category": "playbooks",
  "temporal": {
    "anchor": "LATEST",
    "range": null
  },
  "slug_filter": "schema-migration",
  "body_filter": null,
  "top_k": 1
}
```

-   If `category` is present, scan depth is limited strictly to `CWD//`.

-   If `temporal` is specified, files outside the lexicographical ISO prefix range are skipped before reading inodes or text content.

-   If `body_filter` is null, no full-text grep runs; resolution terminates at the filename level.


### Gemini said

Here is the AST lowering engine. It compiles the AST query directly into bounded filesystem operations using three stages: **Directory Pruning**, **Lexicographical Temporal Culling**, and **Slug/Body Filtering**.

Python

```
from dataclasses import dataclass
from datetime import date, timedelta
from enum import Enum, auto
import os
import re
from typing import Iterator, List, Optional, Tuple

# =====================================================================
# 1. AST Definition
# =====================================================================

class TemporalAnchor(Enum):
    ALL = auto()
    LATEST = auto()
    EXPLICIT_RANGE = auto()

@dataclass(frozen=True)
class DateRange:
    start: str  # Inclusive ISO format: "YYYY-MM-DD"
    end: str    # Inclusive ISO format: "YYYY-MM-DD"

@dataclass(frozen=True)
class QueryAST:
    category: Optional[str] = None          # e.g., "playbooks", "decisions"
    anchor: TemporalAnchor = TemporalAnchor.ALL
    date_range: Optional[DateRange] = None  # e.g., DateRange("2026-08-01", "2026-08-31")
    slug_tokens: Tuple[str, ...] = ()       # e.g., ("schema", "migration")
    body_query: Optional[str] = None        # Grep query string
    limit: int = 5                          # Clamped audio output budget

# =====================================================================
# 2. Lowered Execution Plan
# =====================================================================

@dataclass(frozen=True)
class ExecutionPlan:
    target_dirs: Tuple[str, ...]
    min_date_prefix: str
    max_date_prefix: str
    slug_patterns: Tuple[str, ...]
    body_query: Optional[str]
    limit: int
    reverse_sort: bool

def lower_ast(ast: QueryAST, cwd: str, known_categories: Tuple[str, ...], today: Optional[date] = None) -> ExecutionPlan:
    """Compiles the AST into an execution plan with concrete boundaries."""
    today = today or date.today()

    # Boundary 1: Scope Target Directories
    if ast.category:
        target_dirs = (os.path.join(cwd, ast.category),)
    else:
        # Prevent root-walk: restrict only to existing known class subdirectories
        target_dirs = tuple(
            os.path.join(cwd, cat) 
            for cat in known_categories 
            if os.path.isdir(os.path.join(cwd, cat))
        )

    # Boundary 2: Temporal ISO Limits
    reverse_sort = False
    if ast.anchor == TemporalAnchor.LATEST:
        min_prefix = "0000-00-00"
        max_prefix = "9999-99-99"
        reverse_sort = True
    elif ast.anchor == TemporalAnchor.EXPLICIT_RANGE and ast.date_range:
        min_prefix = ast.date_range.start
        max_prefix = ast.date_range.end
        reverse_sort = True
    else:
        min_prefix = "0000-00-00"
        max_prefix = "9999-99-99"

    return ExecutionPlan(
        target_dirs=target_dirs,
        min_date_prefix=min_prefix,
        max_date_prefix=max_prefix,
        slug_patterns=ast.slug_tokens,
        body_query=ast.body_query,
        limit=ast.limit,
        reverse_sort=reverse_sort
    )

# =====================================================================
# 3. Pure Evaluation Engine
# =====================================================================

_ISO_DATE_REGEX = re.compile(r"^(\d{4}-\d{2}-\d{2})-(.+)\.md$")

def execute_plan(plan: ExecutionPlan) -> List[str]:
    """
    Executes the plan without deep recursion or unbounded file loading.
    Disk reads are performed only on survivors of Tier-1 string pruning.
    """
    candidates: List[Tuple[str, str, str]] = [] # (date_prefix, full_path, filename)

    for directory in plan.target_dirs:
        if not os.path.exists(directory):
            continue

        # Flat scan: depth is bounded to 1 inside category folders
        try:
            with os.scandir(directory) as entries:
                for entry in entries:
                    if not entry.is_file() or not entry.name.endswith(".md"):
                        continue

                    match = _ISO_DATE_REGEX.match(entry.name)
                    if not match:
                        continue

                    file_date, file_slug = match.groups()

                    # Boundary Check: Lexicographical date filter (Zero disk I/O)
                    if not (plan.min_date_prefix <= file_date <= plan.max_date_prefix):
                        continue

                    # Boundary Check: Slug keyword filter (Zero disk I/O)
                    if plan.slug_patterns:
                        if not all(token.lower() in file_slug.lower() for token in plan.slug_patterns):
                            continue

                    candidates.append((file_date, entry.path, entry.name))
        except (PermissionError, FileNotFoundError):
            continue

    # Order candidates chronologically or reverse-chronologically
    candidates.sort(key=lambda item: item[0], reverse=plan.reverse_sort)

    # Tier 2: Body Grep (Deferred until candidate pool is bounded)
    resolved_files: List[str] = []
    for _, file_path, _ in candidates:
        if len(resolved_files) >= plan.limit:
            break

        if plan.body_query:
            if not _file_contains(file_path, plan.body_query):
                continue

        resolved_files.append(file_path)

    return resolved_files

def _file_contains(filepath: str, query: str) -> bool:
    """Reads lines lazily and aborts on first match."""
    query_lower = query.lower()
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                if query_lower in line.lower():
                    return True
    except OSError:
        return False
    return False
```

### How It Enforces Operational Boundaries

1.  **Root Trap Neutralization:** If `CWD` is `/` and `ast.category` is `None`, `target_dirs` does not walk the filesystem. It builds paths exclusively from the allowed categorical tokens (e.g., `//playbooks`, `//decisions`), which will fail fast or match only valid silo mounts.

2.  **Lexicographical Date Comparison:** `plan.min_date_prefix <= file_date <= plan.max_date_prefix` leverages the ISO-8601 invariant. No timestamp parsing, epoch calculation, or file metadata stat calls occur.

3.  **Lazy Grep:** `_file_contains` opens files line-by-line and terminates immediately upon the first match. Candidate files that failed the slug or date match are never touched by disk read heads.

4.  **Early Termination:** As soon as `len(resolved_files) == plan.limit`, the loop terminates. For audio responses, `limit` remains clamped (default ).

##### You said - this is sounding good - the variables of the folders and their contents are now invariants IE part…

\- this is sounding good

\- the variables of the folders and their contents are now invariants IE parts of our grammar

\- one additional thing to consider is we can move old unused files in to a .archive folder

\- this means that we can prune the size of our live document set

\- opinion

###### Gemini said

Using a `.archive` folder is an excellent operational boundary, but _how_ you position it makes the difference between maintaining a clean grammar and breaking your invariants.

### The Operational Heuristic: Keep It Sibling-Flat, Not Nested

There are two ways to implement this, and one is significantly better for the parser:

-   **Anti-Pattern (Nested archives):**

    `decisions/.archive/2024-01-10-old-db.md`

    _Problem:_ This re-introduces directory recursion. Your depth invariant of breaks, and your fast `scandir()` loop now has to check whether each entry is a directory or branch down a subtree.

-   **Correct Pattern (Horizontal archive domain or root sibling):**

    Either a top-level `.archive/` directory mirroring the categories:

    Plaintext

    ```
    .archive/
    ├── decisions/
    │   └── 2024-01-10-old-db.md
    └── playbooks/
        └── 2023-11-05-deploy-v1.md
    ```

    Or simply tagging the folder as another category class, or treating `.archive/` as a secondary CWD scope.

### Why the Dot Prefix (`.archive`) Is a Free Win

1.  **Automatic Exclusion via POSIX Convention:** By prepending the dot (`.`), you exploit standard Unix filesystem conventions. Standard directory walks and wildcards naturally ignore hidden directories unless explicitly opted into.

2.  **Deterministic Tiering (Hot vs. Cold Storage):**

    -   **Hot Tier (Default):** The live category folders. High temporal relevance, scanned in single-digit milliseconds, tiny memory footprint.

    -   **Cold Tier (`.archive`):** Ignored by default during general speech requests.

### Extending the Grammar with a "Cold" Modifier

Instead of cluttering the live search space, the presence of an archive allows you to add an explicit speech token that toggles the root boundary:

EBNF

```
ScopeModifier       ::= "archive" | "historical" | "old" ;
```

-   **Spoken:** _"What was the playbook for Postgres migration?"_

    Scans `./playbooks/` (Hot tier only). Fast, returns current standard operating procedures.

-   **Spoken:** _"Check the **archive** for playbooks on Postgres migration"_

    Shifts root scope to `./.archive/playbooks/`.

### Boundary Conditions to Enforce

-   **Unidirectional Flow:** Files move into `.archive/`, but the live app never writes to it. It remains read-only to GLoam.

-   **Preserve the Invariant:** When moving files to `.archive/decisions/`, the filename `YYYY-MM-DD-slug.md` must stay intact. The temporal pruning logic remains identical whether evaluating hot or cold tiers—only the root directory path changes.

By keeping `.archive` structurally segregated, your "hot" corpus stays bounded, speech queries remain snappy, and users don't accidentally execute a deprecated 2023 playbook because the search engine found a fuzzy keyword hit.

##### You said - how can we provide discovery for the grammar - currently our process is to just show a list of the…

\- how can we provide discovery for the grammar

\- currently our process is to just show a list of the markdown files in the root CWD, that's it

\- a document file can contain single-level references to other files

\- these references can be dereferenced and rendered, without further references

\- opinion

###### Gemini said

Dumping an unorganized flat list of files at the root throws away the very coordinate system you built. It forces the human eye or ear to parse raw filenames instead of communicating what the system actually understands.

To provide discovery for both speech and visual UI without breaking your performance envelope, exploit two boundaries you already have: the **finite category vocabulary** and the **one-level document reference graph**.

### 1\. Zero-Query Landing: Expose Affordances, Not File Dumps

When GLoam launches in a repository root, the default view (and spoken prompt) should communicate the grammar's entry points.

-   **For the Ear:** A brief audio prompt establishing state and categories:

    > _"Connected to repo. Seven playbooks, twelve decisions, three advisories. What are you looking for?"_ This implicitly teaches the user the allowed nouns (`playbooks`, `decisions`, `advisories`) without a tutorial.

-   **For the Eye (Okuda UI):** A horizontal billboard or card rack showing the top-level categories and their newest additions:

| Category | Count | Latest Entry |
| --- | --- | --- |
| **playbooks/** | 7 | `2026-09-12-failover-drills.md` |
| **decisions/** | 12 | `2026-09-02-streaming-rpc.md` |
| **advisories/** | 3 | `2026-08-15-deprecate-v1-api.md` |

This turns discovery from a messy directory dump into a menu of valid grammar tokens.

### 2\. Exploiting Single-Level References (The Flat Star Graph)

A document pointing to other documents with a hard guarantee of **no nested references** forms a trivial star graph:

```
[ Root / Focal Doc ]
       ├── Reference A (leaf)
       ├── Reference B (leaf)
       └── Reference C (leaf)
```

Because references are strictly leaf nodes with recursion depth = 1:

-   **Bounded Bundle Resolution:** Dereferencing is pure and bounded. If a document references three others, the engine resolves a fixed set of four files. There is zero risk of cycle detection, stack overflow, or runaway traversals.

-   **Discovery via "See Also" Spoken Affordances:** When reading a document aloud, the audio renderer can append immediate next actions:

    > _"...end of decision. Related documents: Playbook for failover drills, and Advisory on deprecation. Say 'read failover' to switch."_

-   **Compound Okuda Rendering:** Visually, Okuda can stitch these references into a single composite view: the primary document occupies the center panel, while the dereferenced leaves render as preview ribbons or adjacent cards, ready to read without navigation.

### 3\. Syntax for References

Since your filenames are canonical coordinates, references inside Markdown should stay equally strict:

Markdown

```

# Decision: Streaming RPC

Adopt gRPC streams for telemetry.

## Related
- [playbooks/2026-09-12-failover-drills.md]
- [advisories/2026-08-15-deprecate-v1-api.md]
```

By enforcing that links use the explicit `category/YYYY-MM-DD-slug.md` format:

-   Dereferencing is a single string lookup.

-   The parser never executes a filesystem search to resolve a link.

-   If a link points to a file with further references, the engine simply ignores them, honoring the depth-1 invariant.

Discovery stops being a blind crawl across the disk. The root shows the valid categories, the categories expose recent slugs, and the documents themselves supply bounded paths to their immediate neighbors.

##### You said - we also give each document a unique call-sign which can be used to dereference the file path - our…

\- we also give each document a unique call-sign which can be used to dereference the file path

\- our render process dynamically injects rubricated silcrows for references

\- the referenced document os rendered on actuation of the silcrow

\- a backspace returns to the main document

\- opinion

###### Gemini said

Using unique call-signs alongside rubricated pilcrows/silcrows () is a brilliant tactile and auditory affordance. It neatly solves both the human factors and state machine problems.

Here is the operational breakdown of why this works, where the boundaries need defending, and how to keep it rock-solid.

### 1\. Call-Signs as Compact Coordinate Hashes

Spoken filenames like `2026-09-16-distributed-telemetry-failover.md` are terrible for speech and memory. Call-signs (e.g., `ALPHA-4`, `PB-102`, `DEC-44`, or two-word NATO/phonetic handles) give you:

-   **Low Cognitive & Auditory Load:** The ear retains a call-sign effortlessly compared to an ISO slug.

Reverse-Lookup Index: A tiny in-memory hash map `callsign -> relative_path` (e.g., `{"PB-102": "playbooks/2026-09-16-failover.md"}`) built at startup or category scan time.

-   **Dual Speech Input Modes:** A user can say either the semantic phrase (_"read failover playbook"_) or the direct index handle (_"jump to Bravo 2"_). Both route to the exact same execution pipeline.

### 2\. Rubricated Silcrows () & Dynamic Injection

Using red/highlighted section markers () creates an unmistakable visual anchor in Okuda that directly bridges text to audio.

-   **Audio Alignment:** When rendering to audio/TTS, the injection point of the silcrow is an explicit operational hook:

    -   _Visual:_

    -   _Speech earcon:_ Emit a subtle, non-intrusive sound cue (a quiet mechanical click or chime) or inline cue: _"\[reference: Failover Drills, call-sign PB-102\]"_.

-   **Pure Transform Pipeline:** The markdown file on disk remains clean. The injector function is a pure transform:

No mutating the source markdown files.

### 3\. The 1-Level Navigation State Machine (The Bounded Stack)

Your rule that **"a backspace returns to the main document"** with **"no nested references"** fundamentally protects your system from becoming an unmanageable web browser.

Because nesting is forbidden, your navigation state is **not an arbitrary stack**; it is a strict **two-register latch**:

```
State A: [ Primary Document Register ]
                │
         (Actuate § / Call-sign)
                │
                ▼
State B: [ Reference Document Register ]   (Disabled: further § actuation)
                │
         (Backspace / Dismiss)
                │
                ▼
State A: [ Primary Document Register ]
```

#### Invariants to Enforce

1.  **Suppress References in State B:** When viewing the referenced document via a silcrow hop, dynamically strip or deactivate any silcrows in that child document. This structurally enforces the 1-level limit without edge cases.

2.  **Deterministic Backspace:** Backspace is strictly an idempotent return to State A. It never cascades backwards through an infinite history of stale hops.

3.  **Scroll Memory:** Returning to State A via backspace must restore cursor/reading position right at the actuated silcrow, preserving continuity for both eye and audio stream.

### The Operational Take

You've avoided the classic trap of building a miniature web browser inside a markdown renderer.

By constraining links to:

1.  Short call-sign aliases,

2.  Injected visual/auditory cues (), and

3.  A strict 2-state latch (Primary Reference),

GLoam remains predictable, keyboard-driven, fast to synthesize for audio, and impossible to get lost in.
