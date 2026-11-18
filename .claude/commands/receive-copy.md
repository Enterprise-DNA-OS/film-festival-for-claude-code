---
description: Record a copy receipt
---

# Record a copy receipt

Read the current records first. Use actual identifiers and evidence supplied by the operator. Show the result and any unresolved records. Never invent a source fact.

```bash
npm run festival -- receive-copy NEW-FILM --evidence="Delivery receipt reference" --actor="Your name"
```

Use --dry-run to preview record changes without committing. Every mutation requires --actor with the real operator label.
