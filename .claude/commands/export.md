---
description: Export all business records and history
---

# Export all business records and history

Create the private exports directory first. The output contains guest information, source records and audit history. Keep it outside Git and never overwrite an existing export. Reconcile counts.

```bash
npm run festival -- export --out=exports/festival.json
```

Use --json for structured output.
