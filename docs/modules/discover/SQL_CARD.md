# Discover SQL card

Technical preparation for the presentation phase. Michael now maintains the source baseline; hX1-dev's original CP1/CP2 implementation remains credited in its delivery records. Select a readable excerpt for the live talk rather than showing every statement below.

## Suggested main example: Hot ranking

The production `hotIds` query in `modules/discover/queries.js` computes a score rather than storing engagement counters:

```sql
SELECT p.post_id,
  ((SELECT COUNT(*) FROM post_likes l WHERE l.post_id = p.post_id)
   + 2 * (SELECT COUNT(*) FROM comments c
           WHERE c.post_id = p.post_id AND c.deleted_at IS NULL
             AND NOT EXISTS (SELECT 1 FROM hidden_content h
                             WHERE h.target_type = 'comment' AND h.target_id = c.comment_id))
   + 3 * (SELECT COUNT(*) FROM post_watches w WHERE w.post_id = p.post_id) + 1)
  / POW(TIMESTAMPDIFF(MINUTE, p.created_at, UTC_TIMESTAMP()) / 60 + 2, 1.5) AS hot_score
FROM v_live_posts p
WHERE (p.visibility = 'all' OR p.author_university_id = ?)
  AND p.created_at >= UTC_TIMESTAMP() - INTERVAL 7 DAY
ORDER BY hot_score DESC, p.post_id DESC LIMIT 21 OFFSET ?;
```

Parameters are the viewer's university and the page offset. The route hydrates at most 20 returned IDs with `byIds`; a 21st ID means Load more is available. This keeps filtering/paging on `v_live_posts` rather than sorting the more expensive card view.

Three talking points:

1. **Derived counts:** likes/comments/watches are counted from their source rows. A moderator-hidden or deleted comment contributes no Hot points; live-post filtering and university visibility remain shared rules.
2. **Time decay:** the denominator grows with age. The `+1` gives a new post with no engagement a brief chance near the top; ties go to the newer post ID.
3. **Concrete result:** immediately after a seed reset, an HKU viewer sees 600012, 600013, 600011, 600006 and 600004 as the top five. Post 600012 has 3 likes, 4 live comments and 1 watch: score approximately `15 / 5^1.5 = 1.34` at age three hours. Scores naturally change with time.

Watching uses a different definition of activity: the most recent **non-deleted** comment, including hidden comments, or the post's own time. Hidden content never reappears as a visible card; counting activity is distinct from awarding Hot points.

## Search and privacy: useful second excerpt or Q&A

`toBooleanQuery` splits punctuation into word boundaries, keeps up to ten Unicode words of at least two characters, then requires each word in the existing ngram full-text index. For example, `Joy Hing` becomes `+"Joy" +"Hing"` and `叉烧` becomes `+"叉烧"`.

```sql
SELECT p.post_id, MATCH(p.body) AGAINST (? IN BOOLEAN MODE) AS relevance
FROM v_live_posts p
WHERE MATCH(p.body) AGAINST (? IN BOOLEAN MODE)
  AND (p.visibility = 'all' OR p.author_university_id = ?)
  AND (? IS NULL OR p.topic_id = ?)
ORDER BY relevance DESC, p.post_id DESC LIMIT 21 OFFSET ?;
```

The parameters are the same Boolean expression twice, viewer university, optional topic twice, and offset. Newest sorting is a separate fixed SQL choice; user text is never concatenated into SQL. The empty search page shows only named organization posts, since including anonymous organization posts there would reveal their authors.

Fresh seed examples: HKU `library` finds 600001; CUHK `library` finds 600008. Both can find the public Chinese post 600002 with `叉烧`. A post-number jump first uses `findVisible`, so invisible, deleted or hidden targets do not reveal their existence by redirecting.

## Announcements: CRUD and fixed-offset times

The current-banner query uses one UTC clock and an inclusive-start/exclusive-end window:

```sql
SELECT announcement_id, title, subtitle, image_path, link_url
FROM announcements
WHERE starts_at <= UTC_TIMESTAMP() AND UTC_TIMESTAMP() < ends_at
ORDER BY sort_order, announcement_id;
```

Only the first All-feed page requests these rows. Admin create/edit/delete routes check the role and CSRF token; field values are placeholders and the view escapes user text. HKT input uses `DATE_SUB(?, INTERVAL 8 HOUR)` when stored and `DATE_ADD(starts_at, INTERVAL 8 HOUR)` for the edit form. This fixed offset needs no timezone tables and avoids `CONVERT_TZ`'s conversion-range limitations; impossible dates and values that would underflow MySQL DATETIME are rejected before SQL.

Image update/delete transactions lock the announcement row with `FOR UPDATE`. An edit that has no image instruction retains the locked current path, rather than overwriting a concurrent replacement with a stale form value. The helper returns the actual previous path; old upload cleanup runs only after commit. Failed validation/database writes remove new uploads and retain the prior committed image. Seed/static images are never deleted by upload cleanup.

## Reproduction and evidence

Run against dedicated development/test databases as described in the root README:

```bash
npm test -- modules/discover
npm run check:sql
```

The 27 Oct coordinator run passes all **68 Discover cases** (50 earlier cases plus 18 announcement regressions), including English/Chinese search, visibility, activity/ranking distinctions, real cross-module lists/booking, admin CRUD, dates, image failure cleanup and concurrent image replacement. Whole-app, browser and source-ZIP acceptance are recorded by the coordinator separately; see [ANNOUNCEMENTS_VALIDATION.md](ANNOUNCEMENTS_VALIDATION.md) and [shared validation](../../team/VALIDATION.md).
