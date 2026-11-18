---
description: Import an Eventival spreadsheet export with an explicit column map
---

# Import an Eventival spreadsheet export with an explicit column map

Read docs/replace-eventival.md. Inspect the actual exported headers and create an explicit mapping. Run the preview, reconcile counts, then repeat without --dry-run. Original rows are preserved; imported films start submitted. Never infer rights or classifications from selection status.

```bash
npm run festival -- import eventival examples/eventival-films.csv --edition=DEMO --map=examples/eventival-film-map.json --dry-run --actor="Your name"
```

Use --dry-run to preview record changes without committing. Every mutation requires --actor with the real operator label.
