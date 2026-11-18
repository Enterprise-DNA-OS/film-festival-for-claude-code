---
description: Plan a screening
---

# Plan a screening

Read the current records first. Use actual identifiers and evidence supplied by the operator. Show the result and any unresolved records. Never invent a source fact.

```bash
npm run festival -- schedule --code=SHOW1 --name="Opening programme" --film=NEW-FILM --venue=ROOM1 --starts=2027-03-01T19:00+13:00 --qa=15 --actor="Your name"
```

Use --dry-run to preview record changes without committing. Every mutation requires --actor with the real operator label.
