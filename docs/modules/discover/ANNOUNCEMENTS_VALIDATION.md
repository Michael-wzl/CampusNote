# Announcement implementation and focused validation

27 Oct 2026, coordinator source-baseline work after Michael took over all code/repository maintenance. Existing CP1/CP2 contributions remain credited in their dated records. This note covers DS-3/DS-7; it does not certify the final source ZIP or presentation assets.

## Implemented behavior

- Current banners appear only on the first All-feed page, with inclusive start, exclusive end, sort-order/ID ordering, optional image/link and escaped title/subtitle.
- Admin list groups Current, Scheduled and Expired, with None for an empty group. Create/edit/delete use the existing role, CSRF, upload and response contracts.
- Input dates round-trip as HKT and store UTC, including supported DATETIME range boundaries. Fixed eight-hour date arithmetic replaces the reference guide's `CONVERT_TZ`; this does not need timezone tables or change the schema.
- `/` links canonicalize to `/feed`, preserving the root destination while satisfying the existing link CHECK. External/protocol-relative/backslash/whitespace/control-character links are refused.
- Updates/deletes lock the current row. A stale edit does not revive a deleted announcement or overwrite a newer image merely because its form loaded earlier. Uploaded-image cleanup uses the actual prior image path after commit; static seed images are ignored.
- Validation or database failures remove rejected new uploads; a failed replacement retains the previous committed image. Image replacements, removals, deletion and two simultaneous replacements have regression coverage.

## Focused local evidence

- Oracle MySQL **8.4.13**, isolated loopback port 13378; test database `campus_source_discover_test`, separate from the coordinator's other test/browser databases.
- **18/18 announcement cases pass**, 0 fail, 0 skipped, 0 TODO.
- **68/68 Discover cases pass**, 0 fail, 0 skipped, 0 TODO, including all earlier 50 module cases.
- Scoped ESLint and Prettier pass. No schema, shared dependency or other module code was changed by this implementation.
- Two initial test-fixture mistakes were corrected: a trimmed trailing newline is valid trimming, not an invalid interior newline; a raw unsupported-body request must refresh the post-login CSRF token. Production validation/authentication was not weakened.
- The forced-database-failure regression intentionally logs a 500 stack trace while checking cleanup; that is an expected negative fixture, not a failing acceptance case.

Commands used (with the dedicated test connection and upload directory supplied through the environment):

```bash
npm test -- modules/discover/tests/announcements.test.js
npm test -- modules/discover
```

Full-application/SQL, installed-browser, archive rebuild and remote CI results are recorded by the coordinator in [shared validation](../../team/VALIDATION.md). This focused run does not claim those checks, physical devices or other browser engines have passed.
