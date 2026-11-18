# Move your film records from Eventival

Sources checked 18 November 2026: [Eventival features](https://eventival.com/features/), [pricing and included export capability](https://eventival.com/pricing/) and [Back Office API](https://developers.eventival.com/api.html). Eventival documents exports to spreadsheets and various formats. Its public material does not define one universal spreadsheet layout. The API is a separate route, not implemented by this CSV importer.

1. In your authorised Eventival Back Office, export the film records for one edition to a spreadsheet. Include a stable film identifier, title, numeric duration in minutes, country, language and the programme owner. Save it as UTF-8 CSV. Keep the untouched export privately. If your workspace cannot supply these fields, obtain the appropriate report before switching.
2. Copy examples/eventival-film-map.json into your private imports folder and map each destination field to the exact header in your export. The example headers are an illustrative mapping fixture, not a claimed Eventival standard. Optional synopsis maps to the supplied synopsis column. Unmapped columns survive in source_record.
3. Create the edition, with its dates and timezone. On the fictional demo, the complete preview is:

```bash
npm run festival -- import eventival examples/eventival-films.csv --edition=DEMO --map=examples/eventival-film-map.json --actor="Operator" --dry-run
```

4. Inspect the preview count, then repeat without --dry-run. The importer preserves the complete original row and its checksum. The stable source identifier is scoped to the edition. Identical replay does nothing; changed source rows, duplicate identifiers, missing fields and malformed duration fail the whole batch. Reconcile film counts and durations against the export before proceeding.
5. Record selection reviews, licences, classification references and copy checks from source documents. Imported films start submitted. A selected label in an export does not establish permission to exhibit. Plan screenings, run venue-conflicts and compliance, and have the responsible independent reviewer sign off the clear sessions.

The one-command import brings across film metadata. Reviews, historical decisions, screenings, guest travel, permission settings, attachments, private screener links and custom workflows require separate mapping. The base does not import media files, issue tickets, process payments or contact guests. Keep existing services until the responsible operators have reconciled records and proven their replacement processes. Enterprise DNA maps the additional records and connections into the installed version.

Use a pilot edition before replacing working operations. Test access controls, a backup restore and the handling of actual licences. Nobody should switch off a live festival system because the demonstration imports cleanly.
