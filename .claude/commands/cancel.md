---
description: Cancel a screening
---

# Cancel a screening

Read the current records first. Use actual identifiers and evidence supplied by the operator. Show the result and any unresolved records. Never invent a source fact.

```bash
npm run festival -- cancel SHOW1 --reason="Programme decision" --actor="Your name"
```

Use --dry-run to preview record changes without committing. Every mutation requires --actor with the real operator label.
