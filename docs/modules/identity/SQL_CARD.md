# Identity SQL preparation card

This is technical handoff material for code review and questions. It is not an additional required live slide; the team selects a few readable SQL examples after the source baseline is ready. Statements below reflect `modules/identity/queries.js` and `secrets.js`.

## 1. Exact university-domain lookup

```sql
SELECT d.university_id, u.code AS university_code
FROM university_domains d
JOIN universities u ON u.university_id = d.university_id
WHERE d.domain = ?;
```

The route trims/lowercases and validates the ASCII email, then passes its domain as a value. `university_domains.domain` has a binary-collated primary key, so this is an exact allowed-domain lookup, not suffix matching or accent folding. A subdomain such as `cs.hku.hk` is not accepted unless separately listed. This table is the relational mapping of university's multivalued `{domain}` attribute.

## 2. A code can be consumed only once

```sql
UPDATE email_codes
SET consumed_at = UTC_TIMESTAMP()
WHERE code_id = ?
  AND consumed_at IS NULL
  AND attempts < 5
  AND expires_at > UTC_TIMESTAMP();
```

The route validates the newest code's format/hash/state before entering sign-up or reset. The transaction repeats the state check in this conditional `UPDATE`; only a nonzero affected-row count permits the account/password write. Competing tabs cannot both consume the same code. A transaction failure rolls back its consume and related writes. The code table stores a SHA-256 digest, and user passwords are bcrypt hashes. In local development the one plaintext code copy is the outgoing message in the development mailbox; configuring SMTP prevents retaining that message text in `outbox`.

## 3. Me counts are derived and visibility-aware

`meStats(userId, universityId)` executes one `SELECT` with four scalar count subqueries. My posts counts live posts owned by the viewer; Watching counts the viewer's watches joined to `v_live_posts`; Comments counts the viewer's nondeleted comments on visible live posts; Viewed counts uncleared history rows on visible live posts. The shared visibility predicate is:

```sql
(p.visibility = 'all' OR p.author_university_id = ?)
```

The seven bound parameters are `[userId, userId, universityId, userId, universityId, userId, universityId]`. Counts are computed rather than stored counters. The mandatory CP2 check compares seeded Me counts against their actual linked lists; another verifies clearing history changes Viewed without deleting the accumulated visit history.

Three talking points: exact domain identity, atomic check-and-change under concurrency, and keeping display counts consistent with shared visibility/deletion rules. Use the source queries and actual fresh-seed results when answering questions; do not display real verification codes or password material.
