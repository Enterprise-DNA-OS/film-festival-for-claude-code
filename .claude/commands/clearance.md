---
description: Record rights and classification evidence
---

# Record rights and classification evidence

Read the current records first. Use actual identifiers and evidence supplied by the operator. Show the result and any unresolved records. Never invent a source fact.

```bash
npm run festival -- clearance NEW-FILM --jurisdiction=NZ --from=2027-03-01 --to=2027-03-10 --rights="Private licence reference" --limit=2 --route=classified --label="Verified label" --evidence="Private classification reference" --conditions="Exact applicable conditions" --actor="Your name"
```

Use --dry-run to preview record changes without committing. Every mutation requires --actor with the real operator label.
