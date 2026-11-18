---
description: Request a projection copy
---

# Request a projection copy

Read the current records first. Use actual identifiers and evidence supplied by the operator. Show the result and any unresolved records. Never invent a source fact.

```bash
npm run festival -- request-copy NEW-FILM --format=DCP --due=2027-02-25 --actor="Your name"
```

Use --dry-run to preview record changes without committing. Every mutation requires --actor with the real operator label.
