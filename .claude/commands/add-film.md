---
description: Add a film submission
---

# Add a film submission

Read the current records first. Use actual identifiers and evidence supplied by the operator. Show the result and any unresolved records. Never invent a source fact.

```bash
npm run festival -- add-film --code=NEW-FILM --name="New submission" --edition=FEST27 --minutes=90 --country="New Zealand" --language=English --owner="Programme lead" --synopsis="Provided by filmmaker" --actor="Your name"
```

Use --dry-run to preview record changes without committing. Every mutation requires --actor with the real operator label.
