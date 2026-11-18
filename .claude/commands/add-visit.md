---
description: Add a guest commitment
---

# Add a guest commitment

Read the current records first. Use actual identifiers and evidence supplied by the operator. Show the result and any unresolved records. Never invent a source fact.

```bash
npm run festival -- add-visit --code=TRANSFER1 --name="Station pickup" --guest=GUEST2 --starts=2027-03-01T16:00+13:00 --ends=2027-03-01T17:00+13:00 --location="Central station" --actor="Your name"
```

Use --dry-run to preview record changes without committing. Every mutation requires --actor with the real operator label.
