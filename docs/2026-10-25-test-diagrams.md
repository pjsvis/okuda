# test diagrams

[Ref](https://medium.com/@yugenelee/your-markdown-diagrams-could-look-like-this-12-mermaid-tricks-worth-copying-bd7eac85e1dd)

## Reserch Diagram

```mermaid
flowchart LR
    subgraph research[Research]
        direction TB
        collect[Collect sources] --> verify[Verify claims]
        verify --> outline[Build outline]
        outline --> brief[Ready to write]
    end
    subgraph author[Author]
        direction TB
        draft[Write draft] --> demo[Build examples]
        demo --> images[Capture diagrams]
        images --> edit[Edit package]
    end
    subgraph editor[Editor]
        direction TB
        check{Approved?} -->|Yes| publish[Publish]
        check -->|No| revise[Request changes]
        revise --> check
        publish --> archive[(Source archive)]
        publish --> inspect[Check live page]
    end
    research --> author --> editor
    classDef work fill:#dff4fb,stroke:#2086a7,color:#15324a;
    classDef gate fill:#fff1ba,stroke:#bd911d,color:#433211;
    classDef change fill:#ffe0cd,stroke:#cf773a,color:#4a2918;
    class collect,verify,outline,brief,draft,demo,images,edit,publish,inspect work;
    class check gate;
    class revise change;
```

## Clients Diagram

```mermaid
flowchart TB
    subgraph clients[Clients]
        web[Web app]
        desktop[Desktop app]
        script[Automation]
    end
    subgraph services[Application services]
        gateway[API gateway] --> auth[Access check]
        auth --> upload[Import service]
        auth --> search[Search service]
        jobs[Indexer]
    end
    subgraph storage[Storage]
        files[(Source files)]
        queue[(Job queue)]
        index[(Search index)]
    end
    web --> gateway
    desktop --> gateway
    script --> gateway
    upload -->|Store| files
    upload -->|Enqueue| queue
    queue --> jobs
    jobs -->|Update| index
    search -->|Query| index
    search -. Retrieve .-> files
```

## Release Pipeline

```mermaid
flowchart TB
    push([Commit]) --> build[Build package]
    build --> unit[Unit tests]
    build --> integration[Integration tests]
    build --> docs[Docs check]
    build --> scan[Dependency scan]
    unit --> gate{All checks pass?}
    integration --> gate
    docs --> gate
    scan --> gate
    gate -->|No| blocked[Block release]
    blocked --> fix[Fix and recommit]
    gate -->|Yes| staging[Deploy staging]
    staging --> smoke[Smoke test]
    smoke --> healthy{Healthy?}
    healthy -->|Yes| release[Release]
    healthy -->|No| rollback[Roll back staging]
    rollback --> staging
    classDef test fill:#e0e7ff,stroke:#6472bf,color:#202d56;
    classDef good fill:#dcfce7,stroke:#328356,color:#16442b;
    classDef issue fill:#ffe1d4,stroke:#c76b3a,color:#512d1b;
    class unit,integration,docs,scan,smoke test;
    class release good;
    class blocked,fix,rollback issue;
```

## Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Reader
    participant App
    participant Cache
    participant API
    participant Store
    Reader->>App: Open document
    App->>Cache: Find preview
    alt Cached preview exists
        Cache-->>App: Preview
    else Cache miss
        loop Up to two source attempts
            App->>API: Request document
            API->>Store: Read source
            Store-->>API: Source or error
            API-->>App: Result
        end
        alt Source received
            App->>App: Render Markdown
            App->>Cache: Save preview
        else Attempts failed
            App->>App: Prepare recovery message
        end
    end
    App-->>Reader: Preview or recovery action
```

## CSV Processing FLow

```mermaid
flowchart TB
    csv[CSV upload] --> intake[Receive records]
    api[API input] --> intake
    intake --> queue[(Input queue)]
    queue --> parse[Parse and normalise]
    parse --> valid{Valid record?}
    valid -->|No| rejected[(Rejected records)]
    rejected --> repair[Inspect and repair]
    repair --> intake
    valid -->|Yes| transform[Transform fields]
    transform --> archive[(Original archive)]
    transform --> data[(Working dataset)]
    data --> index[Build index]
    data --> report[Build report]
    index --> search[Search results]
    report --> dashboard[Dashboard]
    archive -. Audit .-> dashboard
```

## Request Processing

```mermaid
flowchart TB
    request([New request]) --> parse[Read details]
    parse --> rules[Run rule checks]
    rules --> eligible{Eligible?}
    eligible -->|No| reject[Explain rejection]
    eligible -->|Yes| risk[Check exceptions]
    risk --> normal{Standard case?}
    normal -->|Yes| prepare[Prepare result]
    normal -->|No| expert[Specialist review]
    expert --> approval{Approved?}
    approval -->|No| followup[Request more detail]
    followup --> expert
    approval -->|Yes| prepare
    prepare --> complete([Ready to deliver])
    reject --> closed([Closed])
    classDef automated fill:#dbeafe,stroke:#4775bd,color:#183357;
    classDef manual fill:#fef3c7,stroke:#ad8826,color:#443512;
    classDef terminal fill:#dcfce7,stroke:#3d8a5b,color:#173e28;
    classDef exception fill:#ffedd5,stroke:#bf783a,color:#4e3019;
    class parse,rules,risk,prepare automated;
    class expert,approval manual;
    class complete,closed terminal;
    class reject,followup exception;
```

## Gateway Processing

```mermaid
flowchart TB
    subgraph request[Request path]
        client[Client] --> gateway[Gateway]
        gateway --> service[Document service]
        service --> cache{Cached?}
        cache -->|Yes| response[Build response]
        cache -->|No| storage[(Document store)]
        storage --> response
        response --> reader[Reader]
    end
    subgraph signals[Supporting signals]
        logs[(Request log)] --> trace[Trace view]
        metrics[(Metrics)] --> alerts[Alert rules]
        events[(Event stream)] --> audit[Audit view]
    end
    gateway -. Log .-> logs
    service -. Measure .-> metrics
    response -. Publish event .-> events
    alerts -. Notify .-> operator[Operator]
    classDef signal fill:#ede9fe,stroke:#8b74bf,color:#382b58;
    class logs,trace,metrics,alerts,events,audit signal;
```

## State Diagram V2

- What is the `stateDiagram-v2` diagram type?

```mermaid
stateDiagram-v2
    direction LR
    [*] --> Draft
    Draft --> Review: submit
    state Review {
        direction TB
        [*] --> Technical
        Technical --> Editorial: checks pass
        Technical --> Corrections: changes needed
        Corrections --> Technical: resubmit
        Editorial --> Ready: approved
        Ready --> [*]
    }
    Review --> Scheduled: review complete
    Scheduled --> Live: release
    state Live {
        direction TB
        [*] --> Serving
        Serving --> Degraded: errors
        Degraded --> Recovering: rollback
        Recovering --> Serving: healthy
    }
    Live --> Archived: retire
    Archived --> [*]
```

## ER Diagram

```mermaid
erDiagram
    WORKSPACE ||--o{ DOCUMENT : contains
    AUTHOR ||--o{ DOCUMENT : writes
    DOCUMENT ||--o{ REVISION : has
    DOCUMENT ||--o{ DOC_TAG : classified_by
    TAG ||--o{ DOC_TAG : used_in
    WORKSPACE {
        string workspace_id PK
        string name
    }
    AUTHOR {
        string author_id PK
        string display_name
    }
    DOCUMENT {
        string document_id PK
        string workspace_id FK
        string author_id FK
        string title
    }
    REVISION {
        string revision_id PK
        string document_id FK
        int version
    }
    TAG {
        string tag_id PK
        string label
    }
    DOC_TAG {
        string document_id FK
        string tag_id FK
    }
```

## Markdown Process


```mermaid
flowchart TB
    notes[Local Markdown] --> load[Read source]
    repo[Repository file] --> load
    ai[AI-generated file] --> load
    load --> validate[Validate assets]
    validate --> parser[Parse document]
    parser --> renderer[Shared renderer]
    assets[(Image folder)] -. Resolve .-> renderer
    theme[(Theme settings)] -. Style .-> renderer
    renderer --> screen[Screen preview]
    renderer --> html[HTML output]
    renderer --> pdf[PDF output]
    screen --> inspect[Inspect content]
    html --> share[Share package]
    pdf --> share
    inspect --> revise[Revise source]
    revise -. Next revision .-> load
    classDef shared fill:#dff5f2,stroke:#338a7b,color:#173f39;
    classDef output fill:#e0e7ff,stroke:#6b78be,color:#28355c;
    class renderer shared;
    class screen,html,pdf output;
```

## Mind Map (unsupported)

```mermaid
mindmap
  root((Release plan))
    scope[Committed scope]
      Editing
        Toolbar
        Shortcuts
      Export
        Images
        Page layout
    gate{{Quality gate}}
      Tests pass
      Links checked
      Assets included
    questions)Open questions(
      Final approver
      Release date
      Migration notes
    outputs[Deliverables]
      App package
      User guide
      Release notes
```

## Documentation Release Plan (unsupported)

```mermaid
gantt
    title Documentation release plan
    dateFormat YYYY-MM-DD
    axisFormat %d %b
    todayMarker off
    section Prepare
    Research          :done, research, 2026-11-02, 2d
    Outline           :done, outline, after research, 1d
    section Create
    Draft copy        :active, draft, after outline, 3d
    Build diagrams    :diagrams, after outline, 2d
    Capture screens   :screens, after diagrams, 2d
    section Review
    Copy review       :crit, copyreview, after draft, 2d
    Technical review  :technical, after screens, 2d
    Approval          :crit, approval, after copyreview technical, 1d
    section Publish
    Release           :milestone, release, after approval, 0d
    Inspect live page :crit, inspect, after release, 1d
    Review feedback   :feedback, after inspect, 1d
```






