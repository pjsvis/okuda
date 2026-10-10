# templates/ — a stamper, not a mirror

`templates/silo/` is the **skeleton** a new silo is stamped from. It is not a silo
and nothing runs from here directly.

## The stamper

```bash
just new-silo <target-dir> "<Silo Name>" "<one-line description>"
```

`scripts/new-silo.sh` (in the incubator silo, invoked by that recipe) reads this
template, substitutes the placeholders — `__SILO__`, `__SLUG__`, `__DESC__`,
`__DATE__` — and then copies the **canonical** items, the Protocol and the
registry tooling, from the incubator's **live** files at stamp time.

It creates the target directory, so it must run before anything else touches the
path. It tolerates an existing *empty* directory and refuses a populated one. It
does **not** create the remote.

## Stamp, don't mirror

There is one authority for the Protocol and the registry tooling. A checked-in
copy of `system.md`, `reg-sync.ts` or `reg-list.ts` under `templates/` would
drift the moment either side was edited — *less imposed* quietly becoming *more
duplicated*. The template ships only what is silo-**specific**; everything shared
is copied from the source at stamp time.

## The procedure

`playbooks/commissioning-playbook.md` (PLY-COMMISSION) owns the checklist: name
and scope, stamp, remote, amend the founding record, `just check`, orient, push,
the visitor test. `playbooks/silo-playbook.md` owns what a silo *is*.
