// Placeholder routes for the discover module. Replace each one with the real page from
// docs/modules/discover/DEV_GUIDE.md; keep the paths (docs/team/WORK_DIVISION.md §3).
const express = require('express');
const { requireRole } = require('../../core/auth');
const { int, oneOf } = require('../../core/validate');
const { byIds, findVisible } = require('../../core/cards');
const ref = require('../../core/ref');
const { notFound } = require('../../core/errors');
const queries = require('./queries');
const { toBooleanQuery } = require('./search');

const router = express.Router();

const placeholder = (page) => (req, res) =>
  res.page('discover/placeholder', { module: 'discover', ...page });

// DS-1/DS-2: chronological feeds use keysets; activity and Hot use offset pages.
router.get('/feed', async (req, res) => {
  const choices = [
    { code: 'watching', label: '👀' },
    { code: 'hot', label: '🔥' },
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
    title: 'Campus Notes',
    tab: 'feed',
    scripts: ['/m/discover/feed.js'],
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

router.get(
  '/me/watching',
  placeholder({
    feature: 'DS-5',
    title: 'Watching',
    tab: 'me',
    back: '/me',
    what: 'Posts you watch (the star), latest watch first.',
  }),
);

router.get(
  '/me/likes',
  placeholder({
    feature: 'DS-5',
    title: 'Liked',
    tab: 'me',
    back: '/me',
    what: 'Posts you like (the heart), latest like first.',
  }),
);

router.get(
  '/me/history',
  placeholder({
    feature: 'DS-5',
    title: 'History',
    tab: 'me',
    back: '/me',
    what: 'Posts you opened, latest visit first, with "Clear history".',
  }),
);

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

router.get(
  '/admin/announcements',
  requireRole('admin'),
  placeholder({
    feature: 'DS-7',
    title: 'Announcements',
    tab: null,
    back: '/me',
    what: 'Create, edit and delete the banners at the top of the feed.',
  }),
);

module.exports = router;
