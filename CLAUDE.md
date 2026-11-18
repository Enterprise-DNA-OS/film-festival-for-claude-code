# Film Festival for Claude Code: operating instructions

Read README.md, docs/cli.md and docs/compliance.md before changing records. Establish the business, edition, jurisdiction and operator context before using real data.

## Working rules

Read current records before advising. Use the one CLI, show actual results and resolve ambiguous names from the candidate list. Actor labels record attribution, not authenticated identity. Never invent a review, a licence, a classification or a projection check. Source documents remain the authority.

## Recurring work

| Job | Recipe |
|---|---|
| List festival editions | /editions |
| List films and selection progress | /films |
| Read a film and its full evidence | /film-review |
| Review scores and unreviewed submissions | /selection-meeting |
| Read screening times and readiness | /screening-schedule |
| Find room and turnaround conflicts | /venue-conflicts |
| Review projection-copy deliveries | /copy-traffic |
| Read rights and classification records | /rights-desk |
| List guest purposes and review dates | /guest-desk |
| Read a guest itinerary | /guest-itinerary |
| Find overlapping guest commitments | /guest-conflicts |
| Find blocked screenings, overdue copies and quiet films | /attention |
| Check recorded exhibition and guest controls | /compliance |
| Combine selection, schedule readiness and copy traffic | /weekly-review |
| Answer ten cross-festival questions | /insights |
| Read the change history | /activity |
| Export all business records and history | /export |
| Draft a film evidence chase locally | /draft-chase |
| Register an edition | /add-edition |
| Add a film submission | /add-film |
| Correct film details | /edit-film |
| Append a selector review | /review |
| Record a selection decision | /select |
| Register a projection venue | /add-venue |
| Record rights and classification evidence | /clearance |
| Request a projection copy | /request-copy |
| Record a copy receipt | /receive-copy |
| Record a projection check | /check-copy |
| Plan a screening | /schedule |
| Change screening timing | /reschedule |
| Cancel a screening | /cancel |
| Sign off a clear screening as an independent reviewer | /sign-off |
| Register a guest and disclosure purpose | /add-guest |
| Review guest information use | /review-guest |
| Add a guest commitment | /add-visit |
| Confirm or cancel a guest commitment | /set-visit |
| Append a film note | /log |
| Import an Eventival spreadsheet export with an explicit column map | /import |
| Add a field or rule | /customise |
| Add a read-only report | /new-view |

Recipes live only in .claude/commands. CLAUDE.md and AGENTS.md serve the same database and commands.

## Boundaries

Drafts stay in drafts. No messages, public programme publication, payments, ticketing or video delivery. Local HTML is an internal document, never an invitation to share guest details. Keep real records, credentials and exports out of Git. Review licence conditions and the applicable classification process with the responsible operator; software cannot grant exhibition permission.

Changes use numbered migrations and pass npm test. Do not rewrite an applied migration. Preserve imported source rows and append-only audit evidence. Do not seed a real workspace. Authorised code changes stay on main with the trailer Agent: omni-rebuild-strategist.

For shared operation, configure authenticated access, least-privilege roles, backups, recovery and agreed retention. The free base is a trusted operator workspace. A database owner bypasses row security.
