# Document Vault

Practice OS Cloud stores task files in the private Supabase Storage bucket:

```text
task-documents
```

Recommended path:

```text
Client Name / FY 2026-27 / Service / Period / File
```

Example:

```text
M-G-Oils/FY-2026-27/GST-Returns-Reconciliations/Jun-2026/1717600000-gstr3b-working.xlsx
```

Use one task as the source of truth for:

- Client data received
- Working papers
- GST/TDS challans
- Return files
- Review sheets
- Client approvals
- Filed returns
- Acknowledgements

Backups:

- PostgreSQL database backup protects file metadata.
- Supabase Storage files should be backed up separately because database backups do not include stored file objects.
