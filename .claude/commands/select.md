---
description: Record a selection decision
---

# Record a selection decision

Read the current records first. Use actual identifiers and evidence supplied by the operator. Show the result and any unresolved records. Never invent a source fact.

```bash
npm run festival -- select NEW-FILM --status=selected --reason="Selection meeting decision" --actor="Your name"
```

Use --dry-run to preview record changes without committing. Every mutation requires --actor with the real operator label.
