---
description: Register a projection venue
---

# Register a projection venue

Read the current records first. Use actual identifiers and evidence supplied by the operator. Show the result and any unresolved records. Never invent a source fact.

```bash
npm run festival -- add-venue --code=ROOM1 --name="Main cinema" --formats=DCP,ProRes --turnaround=20 --actor="Your name"
```

Use --dry-run to preview record changes without committing. Every mutation requires --actor with the real operator label.
