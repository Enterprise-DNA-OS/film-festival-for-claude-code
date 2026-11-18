---
description: Review guest information use
---

# Review guest information use

Read the current records first. Use actual identifiers and evidence supplied by the operator. Show the result and any unresolved records. Never invent a source fact.

```bash
npm run festival -- review-guest GUEST2 --purpose="Festival discussion" --basis="Guest confirmed sharing scope" --review-date=2027-03-20 --reason="Reviewed with guest" --actor="Your name"
```

Use --dry-run to preview record changes without committing. Every mutation requires --actor with the real operator label.
