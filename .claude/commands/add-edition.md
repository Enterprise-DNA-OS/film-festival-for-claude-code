---
description: Register an edition
---

# Register an edition

Read the current records first. Use actual identifiers and evidence supplied by the operator. Show the result and any unresolved records. Never invent a source fact.

```bash
npm run festival -- add-edition --code=FEST27 --name="Festival 2027" --from=2027-03-01 --to=2027-03-10 --jurisdiction=NZ --timezone=Pacific/Auckland --actor="Your name"
```

Use --dry-run to preview record changes without committing. Every mutation requires --actor with the real operator label.
