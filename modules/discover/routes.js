// Discover's routes follow the module URL contract (docs/team/WORK_DIVISION.md §3).
const express = require('express');
const { requireRole } = require('../../core/auth');
const { int, oneOf } = require('../../core/validate');
const { byIds, findVisible } = require('../../core/cards');
const ref = require('../../core/ref');
const { notFound } = require('../../core/errors');
const queries = require('./queries');
const { toBooleanQuery } = require('./search');
const uploads = require('../../core/uploads');
const { validateAnnouncement } = require('./announcements');

const router = express.Router();

// DS-1/DS-2: chronological feeds use keysets; activity and Hot use offset pages.
router.get('/feed', async (req, res) => {
  const choices = [
    { code: 'watching', label: '👀 Watching' },
    { code: 'hot', label: '🔥 Hot' },
    { code: 'all', label: 'All' },
    { code: 'uni', label: req.me.universityCode },
    ...ref.topics.map((topic) => ({ code: topic.code, label: topic.name_en })),
  ];
  const selected =
    oneOf(
      req.query.tab,
      choices.map((choice) => choice.code),
    ) ?? 'all';
  const before = int(req.query.before, { min: 1, max: 4294967295 });
  const page = int(req.query.page, { min: 1, max: 2147483647 }) ?? 1;
  const offset = (page - 1) * 20;
  const topic = ref.topic(selected);
  const ids =
    selected === 'watching'
      ? await queries.feedWatchingIds(req.me.userId, req.me.universityId, offset)
      : selected === 'hot'
        ? await queries.hotIds(req.me.universityId, offset)
        : topic
          ? await queries.feedTopicIds(req.me.universityId, topic.topic_id, before)
          : selected === 'uni'
            ? await queries.feedUniIds(req.me.universityId, before)
            : await queries.feedAllIds(req.me.universityId, before);
  // D18: paginate the merged view, then hydrate at most 20 cards, preserving the id order.
  const cards = await byIds(ids.slice(0, 20));
  const nextUrl =
    ids.length > 20
      ? `/feed?tab=${selected}&${['watching', 'hot'].includes(selected) ? `page=${page + 1}` : `before=${ids[19]}`}`
      : null;
  const emptyText =
    selected === 'watching'
      ? 'Tap the star on a post to watch it. Watched posts appear here, the most recently active first.'
      : selected === 'hot'
        ? 'Nothing is hot this week yet.'
        : topic
          ? `No posts in ${topic.name_en} yet.`
          : selected === 'uni'
            ? `No posts from ${req.me.universityCode} yet.`
            : 'No posts yet. Be the first to write one.';
  res.page('discover/feed', {
    title: 'Feed',
    tab: 'feed',
    scripts: ['/m/discover/feed.js'],
    styles: ['/m/discover/announcements.css'],
    announcements: selected === 'all' && !before ? await queries.currentAnnouncements() : [],
    cards,
    nextUrl,
    emptyText,
    canCompose: selected === 'all',
    feedHeading:
      selected === 'all'
        ? 'All posts'
        : selected === 'watching'
          ? 'Watching posts'
          : selected === 'hot'
            ? 'Hot posts this week'
            : `${topic?.name_en ?? req.me.universityCode} posts`,
    feedTabs: choices.map((choice) => ({
      label: choice.label,
      href: `/feed?tab=${choice.code}`,
      active: choice.code === selected,
    })),
  });
});

router.get('/search', async (req, res) => {
  const query = String(req.query.q ?? '')
    .trim()
    .slice(0, 100);
  if (/^#?\d{6,7}$/.test(query)) {
    const id = Number(query.replace('#', ''));
    if (await findVisible(id, req.me)) return res.redirect(303, `/posts/${id}`);
  }
  const sort = oneOf(req.query.sort, ['relevance', 'newest']) ?? 'relevance';
  const topic = ref.topic(req.query.topic);
  const page = int(req.query.page, { min: 1, max: 2147483647 }) ?? 1;
  const expr = toBooleanQuery(query);
  const ids = !query
    ? await queries.orgPostIds(req.me.universityId)
    : expr
      ? await queries.searchIds(
          expr,
          req.me.universityId,
          topic?.topic_id ?? null,
          sort,
          (page - 1) * 20,
        )
      : [];
  const next = new URLSearchParams({
    q: query,
    sort,
    topic: topic?.code ?? '',
    page: String(page + 1),
  });
  res.page('discover/search', {
    title: 'Search',
    tab: 'search',
    styles: ['/m/discover/search.css'],
    query,
    sort,
    selectedTopic: topic?.code ?? '',
    cards: await byIds(ids.slice(0, 20)),
    nextUrl: query && ids.length > 20 ? `/search?${next}` : null,
    emptyText:
      query && !expr ? 'Type at least 2 characters' : 'No posts contain all of these words.',
  });
});

router.get('/me/posts', async (req, res) => {
  const before = int(req.query.before, { min: 1, max: 4294967295 });
  const ids = await queries.myPostIds(req.me.userId, before);
  res.page('discover/my-list', {
    title: 'My posts',
    tab: 'me',
    back: '/me',
    cards: await byIds(ids.slice(0, 20)),
    nextUrl: ids.length > 20 ? `/me/posts?before=${ids[19]}` : null,
    note: 'Anonymous posts show no name to others.',
    emptyText: 'You have not posted yet.',
    emptyHref: '/compose',
    emptyLabel: 'Write a post',
  });
});

for (const [path, title, loadIds, emptyText] of [
  ['/me/watching', 'Watching', queries.myWatchingIds, 'Posts you watch (the star) appear here.'],
  ['/me/likes', 'Liked', queries.myLikedIds, 'Posts you like (the heart) appear here.'],
  ['/me/history', 'History', queries.myHistoryIds, 'Posts you open appear here.'],
]) {
  router.get(path, async (req, res) => {
    const page = int(req.query.page, { min: 1, max: 2147483647 }) ?? 1;
    const ids = await loadIds(req.me.userId, req.me.universityId, (page - 1) * 20);
    const cards = await byIds(ids.slice(0, 20));
    res.page('discover/my-list', {
      title,
      tab: 'me',
      back: '/me',
      cards,
      note: null,
      nextUrl: ids.length > 20 ? `${path}?page=${page + 1}` : null,
      emptyText,
      emptyHref: '/feed',
      emptyLabel: 'Browse the feed',
      canClearHistory: path === '/me/history' && cards.length > 0,
    });
  });
}

router.get('/u/:handle', async (req, res) => {
  const handle = req.params.handle.toLowerCase();
  if (!/^[a-z0-9]{9}$/.test(handle)) throw notFound();
  const profile = await queries.userByHandle(handle);
  if (!profile) throw notFound();
  const before = int(req.query.before, { min: 1, max: 4294967295 });
  const ids = await queries.userPostIds(profile.user_id, req.me.universityId, before);
  const isOwn = profile.user_id === req.me.userId;
  res.page('discover/user', {
    title: profile.role === 'organization' ? profile.display_name : profile.handle,
    tab: null,
    back: '/feed',
    profile,
    isOwn,
    canMessage: !isOwn && profile.status !== 'banned',
    cards: await byIds(ids.slice(0, 20)),
    nextUrl: ids.length > 20 ? `/u/${profile.handle}?before=${ids[19]}` : null,
  });
});

const adminPage = (res, view, locals) =>
  res.page(`discover/${view}`, {
    tab: null,
    styles: ['/m/discover/announcements.css'],
    ...locals,
  });

async function announcement(req, res, next) {
  const id = int(req.params.id, { min: 1, max: 65535 });
  req.announcement = id && (await queries.getAnnouncement(id));
  if (!req.announcement) throw notFound();
  next();
}

async function announcementForm(res, values, errors = {}, item = null) {
  const locals = {
    title: item ? 'Edit announcement' : 'Announcements',
    back: item ? '/admin/announcements' : '/me',
    values,
    errors,
    item,
    action: item ? `/admin/announcements/${item.announcement_id}` : '/admin/announcements',
  };
  if (item) return adminPage(res, 'announcement-edit', locals);
  locals.announcements = await queries.listAnnouncements();
  return adminPage(res, 'announcements', locals);
}

async function saveAnnouncement(req, res) {
  const item = req.announcement || null;
  const values = req.body || {};
  const { fields, errors, removeImage } = validateAnnouncement(values, req.uploadError);
  const uploaded = (req.files || []).map((file) => file.publicPath);
  fields.image_path = uploaded[0] || (removeImage ? null : undefined);
  if (Object.keys(errors).length) {
    uploads.remove(uploaded);
    return announcementForm(res.status(400), values, errors, item);
  }
  let previousImage;
  try {
    if (item) {
      const changed = await queries.updateAnnouncement(item.announcement_id, fields);
      if (!changed) throw notFound();
      if (changed.previousImage !== changed.image) previousImage = changed.previousImage;
    } else await queries.createAnnouncement(fields, req.me.userId);
  } catch (err) {
    uploads.remove(uploaded);
    if ([3819, 1292].includes(err.errno))
      return announcementForm(
        res.status(400),
        values,
        { form: 'Check the link and the times' },
        item,
      );
    throw err;
  }
  uploads.remove(previousImage);
  return res.done({ to: '/admin/announcements', flash: 'Announcement saved' });
}

router.get('/admin/announcements', requireRole('admin'), (req, res) =>
  announcementForm(res, { sort_order: '0' }),
);
router.post(
  '/admin/announcements',
  requireRole('admin'),
  uploads.images({ field: 'image', max: 1 }),
  saveAnnouncement,
);
router.get('/admin/announcements/:id', requireRole('admin'), announcement, (req, res) =>
  announcementForm(
    res,
    {
      ...req.announcement,
      link: req.announcement.link_url,
      starts: req.announcement.starts_local,
      ends: req.announcement.ends_local,
    },
    {},
    req.announcement,
  ),
);
router.post(
  '/admin/announcements/:id',
  requireRole('admin'),
  announcement,
  uploads.images({ field: 'image', max: 1 }),
  saveAnnouncement,
);
router.post('/admin/announcements/:id/delete', requireRole('admin'), async (req, res) => {
  const id = int(req.params.id, { min: 1, max: 65535 });
  const deleted = id && (await queries.deleteAnnouncement(id));
  if (!deleted) throw notFound();
  uploads.remove(deleted.image_path);
  res.done({ to: '/admin/announcements', flash: 'Announcement deleted' });
});

module.exports = router;
