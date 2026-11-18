---
description: Correct film details
---

# Correct film details

Read the current records first. Use actual identifiers and evidence supplied by the operator. Show the result and any unresolved records. Never invent a source fact.

```bash
npm run festival -- edit-film NEW-FILM --minutes=91 --reason="Verified final runtime" --actor="Your name"
```

Use --dry-run to preview record changes without committing. Every mutation requires --actor with the real operator label.
