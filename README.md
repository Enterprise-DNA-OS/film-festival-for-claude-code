# Film Festival for Claude Code

Film selections, screening schedules, exhibition evidence, projection copies and guest itineraries in a database you own. Run the internal programme office in plain language.

## Three ways to use it

**Do it yourself.** Free under MIT. Install, try the fictional edition and map your film export. Works with Claude Code, Codex, OpenCode or Cursor. Hosting and your coding agent have their own costs.

**We customise it.** Enterprise DNA brings your Eventival records across, adds your programme rules, documents and connections, and builds a web front end if needed. A different stack is available. One setup fee, then a retainer.

**We run it for you.** Omni by Enterprise DNA installs and operates your version, with access, backups, retention and ongoing changes agreed. One setup fee, then a monthly retainer. [Book a 30-minute call](https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=eventival&utm_medium=github).

## Try a fictional festival

Node 20 or 22, Windows or Linux.

```bash
npm install
npm test
npm run demo
```

The demo ignores DATABASE_URL and creates a separate temporary workspace whose path is printed. Tests remove their temporary workspace. For a persistent local demo:

```bash
npm run migrate
npm run seed
npm run festival -- attention
npm run view
npm run docs
```

Migrate without seed for real records. DATABASE_URL selects PostgreSQL; otherwise DATA_DIR selects PGlite. Shared seeding requires --demo-database. Never seed a working production database.

## What ships

38 CLI commands and 40 slash commands. Five weekly rituals are selection-meeting, screening-schedule, copy-traffic, rights-desk and guest-itinerary. Weekly-review combines selection, screening readiness and delivery. Three read-only dashboards and three document types produce the programme view, copy traffic, control exceptions, screening sheets, guest itineraries and selection records. Set your business name, colours and logo in brand.json.

Screening checks include venue turnaround, format support, licensed dates and screening counts, classification evidence, and checked projection copies. A different operator signs off clear screenings. Its evidence fingerprint becomes stale when underlying facts change. Imported rows remain intact and changes are logged. Nothing is sent, published, sold or screened by the software.

## Bring Eventival film records across

```bash
npm run festival -- import eventival examples/eventival-films.csv --edition=DEMO --map=examples/eventival-film-map.json --actor="Operator" --dry-run
```

Preview, reconcile, then repeat without --dry-run. Eventival documents spreadsheet exports but no universal column layout. The sample is an explicit mapping fixture. Additional records require mapping; media, rights and historical decisions are not inferred. [Full switching guide](docs/replace-eventival.md).

## Ten questions to ask today

Run `npm run festival -- insights`. Every question runs a real query. These are the custom cross-record questions this desk answers; they are not claims that Eventival cannot be configured to answer them.

1. Which submissions still have no selector review?
2. Which selected films have no screening?
3. Which films divide the selection panel?
4. Which owners are waiting on overdue copies?
5. Which screening slots clash after turnaround is allowed for?
6. Which signed-off sessions need a new evidence review?
7. Which films exceed their licensed screening allowance?
8. Which guests have overlapping commitments?
9. Which programme owners have the most blocked screenings?
10. Which screening days have the most programmed minutes?

## Your first hour: ten things to ask for

1. Show the next edition and its screening programme.
2. Find rooms booked before turnaround finishes.
3. List films awaiting their first selection review.
4. Show overdue projection copies by owner.
5. Read the licence and classification references for one film.
6. Move a draft screening and check the resulting conflicts.
7. Find guests with overlapping commitments.
8. Draft an evidence chase without sending it.
9. Put our name and colours on the screening sheet.
10. Add our field with /customise and a report with /new-view.

## Operating scope

This is a trusted operator workspace. Actor labels are self-declared attribution. Shared operation needs authenticated access, appropriate database roles, protected documents, backups and a retention process. Database owners bypass row security. Guest records and full exports are private.

The free base manages the internal programme office. Public submissions, browser collaboration, ticketing, payments, media playback, hosting and live integrations need separately agreed systems. It holds one current copy and clearance per film, with old values retained in history. The projection team and festival operator remain responsible for the actual film, licence, classification conditions and guest arrangements. [Recorded controls](docs/compliance.md) and [scope](docs/why-no-front-end.md).

## Verification

The smoke suite exercises all 38 CLI commands and checks invalid transitions, source preservation, import preview/replay/rollback, room and guest conflicts, approval changes, complete exports and HTML escaping. The manual CI workflow covers Windows and Linux on Node 20/22 and disposable PostgreSQL. A workflow file is not evidence that all environments have passed; consult actual run results.

[CLI reference](docs/cli.md) · [Research and scores](docs/research.md).

MIT. Copyright (c) 2026 Enterprise DNA. Not affiliated with Eventival. All demo records are fictional.
