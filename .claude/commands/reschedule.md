---
description: Change screening timing
---

# Change screening timing

Read the current records first. Use actual identifiers and evidence supplied by the operator. Show the result and any unresolved records. Never invent a source fact.

```bash
npm run festival -- reschedule SHOW1 --starts=2027-03-02T19:00+13:00 --qa=20 --reason="Programme revision" --actor="Your name"
```

Use --dry-run to preview record changes without committing. Every mutation requires --actor with the real operator label.
