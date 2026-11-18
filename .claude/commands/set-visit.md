---
description: Confirm or cancel a guest commitment
---

# Confirm or cancel a guest commitment

Read the current records first. Use actual identifiers and evidence supplied by the operator. Show the result and any unresolved records. Never invent a source fact.

```bash
npm run festival -- set-visit TRANSFER1 --status=confirmed --reason="Coordinator confirmed" --actor="Your name"
```

Use --dry-run to preview record changes without committing. Every mutation requires --actor with the real operator label.
