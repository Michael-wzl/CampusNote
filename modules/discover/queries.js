// Every SQL statement of the discover module (docs/modules/discover/queries.sql has them with checks).
const { q } = require('../../core/db');
const { VISIBLE } = require('../../core/cards');

// DS-1, BR-5, BR-11: the All tab, every live post I can see, newest first; 21 ids, so the route
// knows whether there is a next page. Deleted and hidden posts are already gone in v_live_posts.
async function feedAllIds(myUniversityId, before) {
  const rows = await q(
    `SELECT p.post_id FROM v_live_posts p
     WHERE ${VISIBLE} AND p.post_id < ?
     ORDER BY p.post_id DESC LIMIT 21`,
    [myUniversityId, before ?? 4294967295],
  );
  return rows.map((r) => r.post_id);
}

// DS-1, BR-5, BR-11: my university's live posts, including both audience settings.
async function feedUniIds(myUniversityId, before) {
  const rows = await q(
    `SELECT p.post_id FROM v_live_posts p
     WHERE ${VISIBLE} AND p.author_university_id = ? AND p.post_id < ?
     ORDER BY p.post_id DESC LIMIT 21`,
    [myUniversityId, myUniversityId, before ?? 4294967295],
  );
  return rows.map((r) => r.post_id);
}

// DS-1, BR-5, BR-8, BR-9: topic filtering never bypasses visibility or the live-post view.
async function feedTopicIds(myUniversityId, topicId, before) {
  const rows = await q(
    `SELECT p.post_id FROM v_live_posts p
     WHERE ${VISIBLE} AND p.topic_id = ? AND p.post_id < ?
     ORDER BY p.post_id DESC LIMIT 21`,
    [myUniversityId, topicId, before ?? 4294967295],
  );
  return rows.map((r) => r.post_id);
}

// DS-5, BR-6/8/9: only my live posts, including anonymous ones; ownership implies same university.
async function myPostIds(userId, before) {
  const rows = await q(
    `SELECT p.post_id FROM v_live_posts p
     WHERE p.author_id = ? AND p.post_id < ?
     ORDER BY p.post_id DESC LIMIT 21`,
    [userId, before ?? 4294967295],
  );
  return rows.map((r) => r.post_id);
}

// DS-6: public profile fields only; status controls Message availability, not page existence.
async function userByHandle(handle) {
  return q.one(
    `SELECT u.user_id, u.handle, u.role, u.status, u.avatar_code, u.bio,
            un.code AS university_code, o.display_name, o.description, o.logo_path
     FROM users u
     JOIN universities un ON un.university_id = u.university_id
     LEFT JOIN organizations o ON o.user_id = u.user_id
     WHERE u.handle = ?`,
    [handle],
  );
}

// DS-6, BR-5/6/8/9: only this author's named, live posts visible to the viewer; page ids first.
async function userPostIds(userId, myUniversityId, before) {
  const rows = await q(
    `SELECT p.post_id FROM v_live_posts p
     WHERE p.author_id = ? AND p.is_anonymous = 0 AND ${VISIBLE} AND p.post_id < ?
     ORDER BY p.post_id DESC LIMIT 21`,
    [userId, myUniversityId, before ?? 4294967295],
  );
  return rows.map((r) => r.post_id);
}

// DS-1, BR-5/8/9/11: watched live posts by latest non-deleted comment, including hidden activity.
async function feedWatchingIds(userId, myUniversityId, offset) {
  const rows = await q(
    `SELECT p.post_id FROM post_watches w JOIN v_live_posts p ON p.post_id = w.post_id
     WHERE w.user_id = ? AND ${VISIBLE}
     ORDER BY COALESCE((SELECT MAX(c.created_at) FROM comments c
                        WHERE c.post_id = p.post_id AND c.deleted_at IS NULL), p.created_at) DESC,
              p.post_id DESC LIMIT 21 OFFSET ?`,
    [userId, myUniversityId, offset],
  );
  return rows.map((r) => r.post_id);
}

// DS-2, BR-5/8/9/10/12: seven-day ranking; deleted and hidden comments do not earn points.
async function hotIds(myUniversityId, offset) {
  const rows = await q(
    `SELECT p.post_id,
       ((SELECT COUNT(*) FROM post_likes l WHERE l.post_id = p.post_id)
        + 2 * (SELECT COUNT(*) FROM comments c
               WHERE c.post_id = p.post_id AND c.deleted_at IS NULL
                 AND NOT EXISTS (SELECT 1 FROM hidden_content h
                                 WHERE h.target_type = 'comment' AND h.target_id = c.comment_id))
        + 3 * (SELECT COUNT(*) FROM post_watches w WHERE w.post_id = p.post_id) + 1)
       / POW(TIMESTAMPDIFF(MINUTE, p.created_at, UTC_TIMESTAMP()) / 60 + 2, 1.5) AS hot_score
     FROM v_live_posts p WHERE ${VISIBLE}
       AND p.created_at >= UTC_TIMESTAMP() - INTERVAL 7 DAY
     ORDER BY hot_score DESC, p.post_id DESC LIMIT 21 OFFSET ?`,
    [myUniversityId, offset],
  );
  return rows.map((r) => r.post_id);
}

// DS-4, BR-5/8/9, D17/18: required-word ngram search; select/order are fixed SQL choices only.
async function searchIds(expr, myUniversityId, topicId, sort, offset) {
  const newest = sort === 'newest';
  const select = newest
    ? 'p.post_id'
    : 'p.post_id, MATCH(p.body) AGAINST (? IN BOOLEAN MODE) AS relevance';
  const order = newest ? 'p.post_id DESC' : 'relevance DESC, p.post_id DESC';
  const rows = await q(
    `SELECT ${select} FROM v_live_posts p
     WHERE MATCH(p.body) AGAINST (? IN BOOLEAN MODE) AND ${VISIBLE}
       AND (? IS NULL OR p.topic_id = ?) ORDER BY ${order} LIMIT 21 OFFSET ?`,
    [...(newest ? [] : [expr]), expr, myUniversityId, topicId, topicId, offset],
  );
  return rows.map((row) => row.post_id);
}

// DS-4, BR-5/6/8/9: organization discovery must never identify an anonymous club post.
async function orgPostIds(myUniversityId) {
  const rows = await q(
    `SELECT p.post_id FROM v_live_posts p JOIN users u ON u.user_id = p.author_id
     WHERE u.role = 'organization' AND p.is_anonymous = 0 AND ${VISIBLE}
     ORDER BY p.post_id DESC LIMIT 10`,
    [myUniversityId],
  );
  return rows.map((row) => row.post_id);
}

// DS-5, BR-5/8/9: my saved posts by watch time, distinct from the feed's activity order.
async function myWatchingIds(userId, myUniversityId, offset) {
  const rows = await q(
    `SELECT p.post_id FROM post_watches w JOIN v_live_posts p ON p.post_id = w.post_id
     WHERE w.user_id = ? AND ${VISIBLE}
     ORDER BY w.created_at DESC, p.post_id DESC LIMIT 21 OFFSET ?`,
    [userId, myUniversityId, offset],
  );
  return rows.map((row) => row.post_id);
}

// DS-5, BR-5/8/9: only my likes on posts I may still see, newest interaction first.
async function myLikedIds(userId, myUniversityId, offset) {
  const rows = await q(
    `SELECT p.post_id FROM post_likes l JOIN v_live_posts p ON p.post_id = l.post_id
     WHERE l.user_id = ? AND ${VISIBLE}
     ORDER BY l.created_at DESC, p.post_id DESC LIMIT 21 OFFSET ?`,
    [userId, myUniversityId, offset],
  );
  return rows.map((row) => row.post_id);
}

// DS-5, CT-6, BR-5/8/9/10: cleared history stays out until Content records another visit.
async function myHistoryIds(userId, myUniversityId, offset) {
  const rows = await q(
    `SELECT p.post_id FROM post_views v JOIN v_live_posts p ON p.post_id = v.post_id
     WHERE v.user_id = ? AND v.cleared_at IS NULL AND ${VISIBLE}
     ORDER BY v.last_viewed_at DESC, p.post_id DESC LIMIT 21 OFFSET ?`,
    [userId, myUniversityId, offset],
  );
  return rows.map((row) => row.post_id);
}

module.exports = {
  feedAllIds,
  feedUniIds,
  feedTopicIds,
  myPostIds,
  userByHandle,
  userPostIds,
  feedWatchingIds,
  hotIds,
  searchIds,
  orgPostIds,
  myWatchingIds,
  myLikedIds,
  myHistoryIds,
};
