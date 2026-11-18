# Festival CLI

Node 20 or 22 on Windows or Linux. Use npm run festival -- <command>. Read commands accept --json. Mutations require --actor="Your name" and accept --dry-run. A dry run rolls back the entire transaction, including audit rows. Names match case-insensitively; codes and full ids take precedence, followed by name substring and id prefix. Ambiguous matches list candidates and exit 1. Unknown options fail.

All timestamps require an explicit offset. The schedule shows the edition's named timezone; guest itineraries and exports show UTC. Dates must be real calendar dates. Codes use letters, numbers, dot, underscore or hyphen. A copy follows requested, received, checked. A new request invalidates the old projection check. Selection requires a recorded review. Reviews and notes are append-only.

| Command | Purpose | Example arguments |
|---|---|---|
| editions | List festival editions | `editions` |
| films | List films and selection progress | `films` |
| film-review | Read a film and its full evidence | `film-review FILM-01` |
| selection-meeting | Review scores and unreviewed submissions | `selection-meeting` |
| screening-schedule | Read screening times and readiness | `screening-schedule` |
| venue-conflicts | Find room and turnaround conflicts | `venue-conflicts` |
| copy-traffic | Review projection-copy deliveries | `copy-traffic` |
| rights-desk | Read rights and classification records | `rights-desk` |
| guest-desk | List guest purposes and review dates | `guest-desk` |
| guest-itinerary | Read a guest itinerary | `guest-itinerary GUEST-01` |
| guest-conflicts | Find overlapping guest commitments | `guest-conflicts` |
| attention | Find blocked screenings, overdue copies and quiet films | `attention` |
| compliance | Check recorded exhibition and guest controls | `compliance` |
| weekly-review | Combine selection, schedule readiness and copy traffic | `weekly-review` |
| insights | Answer ten cross-festival questions | `insights` |
| activity | Read the change history | `activity` |
| export | Export all business records and history | `export --out=exports/festival.json` |
| draft-chase | Draft a film evidence chase locally | `draft-chase FILM-02` |
| add-edition | Register an edition | `add-edition --code=FEST27 --name="Festival 2027" --from=2027-03-01 --to=2027-03-10 --jurisdiction=NZ --timezone=Pacific/Auckland --actor="Your name"` |
| add-film | Add a film submission | `add-film --code=NEW-FILM --name="New submission" --edition=FEST27 --minutes=90 --country="New Zealand" --language=English --owner="Programme lead" --synopsis="Provided by filmmaker" --actor="Your name"` |
| edit-film | Correct film details | `edit-film NEW-FILM --minutes=91 --reason="Verified final runtime" --actor="Your name"` |
| review | Append a selector review | `review NEW-FILM --score=4 --note="Fits the programme theme" --actor="Your name"` |
| select | Record a selection decision | `select NEW-FILM --status=selected --reason="Selection meeting decision" --actor="Your name"` |
| add-venue | Register a projection venue | `add-venue --code=ROOM1 --name="Main cinema" --formats=DCP,ProRes --turnaround=20 --actor="Your name"` |
| clearance | Record rights and classification evidence | `clearance NEW-FILM --jurisdiction=NZ --from=2027-03-01 --to=2027-03-10 --rights="Private licence reference" --limit=2 --route=classified --label="Verified label" --evidence="Private classification reference" --conditions="Exact applicable conditions" --actor="Your name"` |
| request-copy | Request a projection copy | `request-copy NEW-FILM --format=DCP --due=2027-02-25 --actor="Your name"` |
| receive-copy | Record a copy receipt | `receive-copy NEW-FILM --evidence="Delivery receipt reference" --actor="Your name"` |
| check-copy | Record a projection check | `check-copy NEW-FILM --evidence="Projection, subtitles and playback checked" --actor="Your name"` |
| schedule | Plan a screening | `schedule --code=SHOW1 --name="Opening programme" --film=NEW-FILM --venue=ROOM1 --starts=2027-03-01T19:00+13:00 --qa=15 --actor="Your name"` |
| reschedule | Change screening timing | `reschedule SHOW1 --starts=2027-03-02T19:00+13:00 --qa=20 --reason="Programme revision" --actor="Your name"` |
| cancel | Cancel a screening | `cancel SHOW1 --reason="Programme decision" --actor="Your name"` |
| sign-off | Sign off a clear screening as an independent reviewer | `sign-off SHOW1 --reason="Source evidence and projection conditions reviewed" --actor="Your name"` |
| add-guest | Register a guest and disclosure purpose | `add-guest --code=GUEST2 --name="Guest name" --purpose="Festival discussion" --basis="Agreed sharing with coordinator" --review-date=2027-03-15 --actor="Your name"` |
| review-guest | Review guest information use | `review-guest GUEST2 --purpose="Festival discussion" --basis="Guest confirmed sharing scope" --review-date=2027-03-20 --reason="Reviewed with guest" --actor="Your name"` |
| add-visit | Add a guest commitment | `add-visit --code=TRANSFER1 --name="Station pickup" --guest=GUEST2 --starts=2027-03-01T16:00+13:00 --ends=2027-03-01T17:00+13:00 --location="Central station" --actor="Your name"` |
| set-visit | Confirm or cancel a guest commitment | `set-visit TRANSFER1 --status=confirmed --reason="Coordinator confirmed" --actor="Your name"` |
| log | Append a film note | `log NEW-FILM --text="Distributor confirmed final runtime" --actor="Your name"` |
| import | Import an Eventival spreadsheet export with an explicit column map | `import eventival examples/eventival-films.csv --edition=DEMO --map=examples/eventival-film-map.json --dry-run --actor="Your name"` |

Examples beyond DEMO use a fictional March 2027 edition; replace dates and identifiers for your own records. Create exports before writing to it. A destination file must not already exist. The export contains every domain record, original import row and audit event, plus a format version. It is a data archive, not an automatic restore command; use tested database backups for recovery.

Sign-off refuses blocked screenings and the planner's own actor label. It records the evidence fingerprint. Changes in duration, copy checks, rights, venue settings or edition dates make that approval stale. New conflicts and licence-count excesses block readiness even when evidence has not changed. Cancelling the conflicting session can restore readiness if the reviewed evidence is identical. Human identity and permission are enforced by your deployment, not by a typed label.

The free desk holds one active projection-copy record and one active clearance per film. Updates retain prior versions in activity. Each film belongs to one edition; import the next edition separately. Programme bundles, multiple alternate copies and multi-territory rights need explicit customisation.
