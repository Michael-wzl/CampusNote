// Every SQL statement of the discover module (docs/modules/discover/queries.sql has them with checks).
const { q, tx } = require('../../core/db');
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

// DS-3: an announcement is current at its inclusive start and before its exclusive end.
async function currentAnnouncements() {
  return q(
    `SELECT announcement_id, title, subtitle, image_path, link_url
     FROM announcements WHERE starts_at <= UTC_TIMESTAMP() AND UTC_TIMESTAMP() < ends_at
     ORDER BY sort_order, announcement_id`,
  );
}

// DS-7, BR-17: SQL determines the state using the same UTC clock as the public banner.
async function listAnnouncements() {
  return q(
    `SELECT *, CASE WHEN UTC_TIMESTAMP() < starts_at THEN 'Scheduled'
                   WHEN UTC_TIMESTAMP() >= ends_at THEN 'Expired' ELSE 'Current' END AS state
     FROM announcements ORDER BY sort_order, announcement_id`,
  );
}

// DS-7, BR-17: fixed-offset arithmetic supports the full valid DATETIME range, without TZ tables.
async function getAnnouncement(id) {
  return q.one(
    `SELECT *, DATE_FORMAT(DATE_ADD(starts_at, INTERVAL 8 HOUR), '%Y-%m-%dT%H:%i') AS starts_local,
               DATE_FORMAT(DATE_ADD(ends_at, INTERVAL 8 HOUR), '%Y-%m-%dT%H:%i') AS ends_local
     FROM announcements WHERE announcement_id = ?`,
    [id],
  );
}

// DS-7: values remain placeholders; the application has validated dates, lengths and links.
async function createAnnouncement(fields, adminId) {
  const result = await q(
    `INSERT INTO announcements
     (title, subtitle, image_path, link_url, starts_at, ends_at, sort_order, created_by)
     VALUES (?, ?, ?, ?, DATE_SUB(?, INTERVAL 8 HOUR), DATE_SUB(?, INTERVAL 8 HOUR), ?, ?)`,
    [
      fields.title,
      fields.subtitle,
      fields.image_path ?? null,
      fields.link_url,
      fields.starts,
      fields.ends,
      fields.sort_order,
      adminId,
    ],
  );
  return result.insertId;
}

// DS-7: lock the current image before changing it, so concurrent saves clean up the real predecessor.
async function updateAnnouncement(id, fields) {
  return tx(async (t) => {
    // DS-7: a deleted row cannot be revived by a stale edit form.
    const previous = await t.q.one(
      'SELECT image_path FROM announcements WHERE announcement_id = ? FOR UPDATE',
      [id],
    );
    if (!previous) return null;
    const image = fields.image_path === undefined ? previous.image_path : fields.image_path;
    // DS-7, BR-17: absent image instructions retain the locked value, not a stale form snapshot.
    await t.q(
      `UPDATE announcements SET title = ?, subtitle = ?, image_path = ?, link_url = ?,
       starts_at = DATE_SUB(?, INTERVAL 8 HOUR), ends_at = DATE_SUB(?, INTERVAL 8 HOUR),
       sort_order = ? WHERE announcement_id = ?`,
      [
        fields.title,
        fields.subtitle,
        image,
        fields.link_url,
        fields.starts,
        fields.ends,
        fields.sort_order,
        id,
      ],
    );
    return { previousImage: previous.image_path, image };
  });
}

// DS-7: return the image from the deleted row; filesystem cleanup happens only after commit.
async function deleteAnnouncement(id) {
  return tx(async (t) => {
    // DS-7: serialize deletion against an image replacement or another deletion.
    const previous = await t.q.one(
      'SELECT image_path FROM announcements WHERE announcement_id = ? FOR UPDATE',
      [id],
    );
    if (!previous) return null;
    // DS-7: a successful delete is a literal database DELETE, with missing targets handled by the route.
    await t.q('DELETE FROM announcements WHERE announcement_id = ?', [id]);
    return previous;
  });
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
  currentAnnouncements,
  listAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
