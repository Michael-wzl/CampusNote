const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { resetDb, agentAs, make, q } = require('../../../test/helpers');

beforeEach(resetDb);

const ids = (page) =>
  page
    .$('.discover-feed .post-card')
    .map((_, a) => Number(page.$(a).attr('href').split('/').pop()))
    .get();

test('DS-T06: Watching follows comment activity, including hidden but excluding deleted comments', async () => {
  const agent = await agentAs('mandy0hku');
  assert.deepEqual(ids(await agent.page('/feed?tab=watching')), [600012, 600004]);
  const comment = await make.comment({ post: 600004, author: 'jason0ust' });
  assert.deepEqual(ids(await agent.page('/feed?tab=watching')), [600004, 600012]);
  await q(
    "INSERT INTO hidden_content (target_type, target_id, hidden_by, reason) VALUES ('comment', ?, 1, 'fixture')",
    [comment],
  );
  assert.deepEqual(ids(await agent.page('/feed?tab=watching')), [600004, 600012]);
  await q('UPDATE comments SET deleted_at = UTC_TIMESTAMP() WHERE comment_id = ?', [comment]);
  assert.deepEqual(ids(await agent.page('/feed?tab=watching')), [600012, 600004]);
  const empty = await (await agentAs('newbie0hk')).page('/feed?tab=watching');
  assert.equal(
    empty.$('.empty p').text(),
    'Tap the star on a post to watch it. Watched posts appear here, the most recently active first.',
  );
  assert.equal(empty.$('#feed-heading').text(), 'Watching posts');
});

test('DS-T07: Hot matches the documented rankings for all three universities', async () => {
  for (const [handle, expected] of [
    ['mandy0hku', [600012, 600013, 600011, 600006, 600004, 600002, 600007, 600001, 600003, 600005]],
    ['wing0cuhk', [600012, 600011, 600006, 600004, 600008, 600002, 600003]],
    ['jason0ust', [600012, 600014, 600011, 600006, 600004, 600002, 600003]],
  ]) {
    const page = await (await agentAs(handle)).page('/feed?tab=hot');
    assert.equal(page.status, 200);
    assert.deepEqual(ids(page), expected);
    assert.equal(page.$('[aria-current=page]').filter('[href="/feed?tab=hot"]').length, 1);
    assert.equal(page.$('#feed-heading').text(), 'Hot posts this week');
  }
});

test('DS-T08: an old popular post stays in All, but leaves the seven-day Hot window', async () => {
  const post = await make.post({
    author: 'mandy0hku',
    visibility: 'all',
    createdAt: new Date(Date.now() - 8 * 86400e3),
  });
  await q('INSERT INTO post_likes (user_id, post_id) VALUES ?', [
    [
      [1, post],
      [2, post],
      [3, post],
      [4, post],
      [5, post],
    ],
  ]);
  const agent = await agentAs('mandy0hku');
  assert.ok(!ids(await agent.page('/feed?tab=hot')).includes(post));
  assert.ok(ids(await agent.page('/feed')).includes(post));
  await q('UPDATE posts SET created_at = UTC_TIMESTAMP() - INTERVAL 8 DAY');
  assert.equal(
    (await agent.page('/feed?tab=hot')).$('.empty p').text(),
    'Nothing is hot this week yet.',
  );
});

test('BR-12: Hot counts live comments, likes and watches and breaks score ties by post id', async () => {
  const a = await make.post({ author: 'newbie0hk', visibility: 'all' });
  const b = await make.post({ author: 'newbie0hk', visibility: 'all' });
  await q('UPDATE posts SET created_at = UTC_TIMESTAMP() - INTERVAL 1 HOUR WHERE post_id IN (?)', [
    [a, b],
  ]);
  const agent = await agentAs('mandy0hku');
  const ahead = async (x, y) => {
    const list = ids(await agent.page('/feed?tab=hot'));
    assert.ok(list.indexOf(x) < list.indexOf(y));
  };
  await ahead(b, a);
  const comment = await make.comment({ post: a, author: 'newbie0hk' });
  await ahead(a, b);
  await q(
    "INSERT INTO hidden_content (target_type, target_id, hidden_by, reason) VALUES ('comment', ?, 1, 'fixture')",
    [comment],
  );
  await ahead(b, a);
  await q("DELETE FROM hidden_content WHERE target_type = 'comment' AND target_id = ?", [comment]);
  await q('UPDATE comments SET deleted_at = UTC_TIMESTAMP() WHERE comment_id = ?', [comment]);
  await ahead(b, a);
  await agent.form(`/posts/${a}/like`, { like: 1 });
  await ahead(a, b);
  await agent.form(`/posts/${b}/watch`, { watch: 1 });
  await ahead(b, a);
});

test('Watching and Hot retain their tab across 20-card pages and reject invalid page values', async () => {
  const posts = [];
  for (let i = 0; i < 25; i++)
    posts.push(await make.post({ author: 'newbie0hk', visibility: 'all' }));
  await q('UPDATE posts SET created_at = UTC_TIMESTAMP() WHERE post_id IN (?)', [posts]);
  await q('INSERT INTO post_watches (user_id,post_id) VALUES ?', [posts.map((id) => [6, id])]);
  const agent = await agentAs('newbie0hk');
  for (const tab of ['watching', 'hot']) {
    const first = await agent.page('/feed?tab=' + tab);
    assert.deepEqual(ids(first), posts.slice().reverse().slice(0, 20));
    assert.equal(first.$('.load-more').attr('href'), `/feed?tab=${tab}&page=2`);
    const second = await agent.page(first.$('.load-more').attr('href'));
    assert.deepEqual(ids(second).slice(0, 5), posts.slice(0, 5).reverse());
    assert.equal(second.$('.load-more').length, 0);
    for (const page of ['0', '-1', '1.5', 'bad', '2147483648', '2&page=3'])
      assert.deepEqual(ids(await agent.page(`/feed?tab=${tab}&page=${page}&before=1`)), ids(first));
    assert.equal(ids(await agent.page(`/feed?tab=${tab}&page=999`)).length, 0);
  }
});

test('DS-T19/CT-T22: real watch/unwatch and visibility changes affect Watching and Hot immediately', async () => {
  const agent = await agentAs('newbie0hk');
  assert.equal((await agent.form('/posts/600004/watch', { watch: 1 })).status, 303);
  assert.deepEqual(ids(await agent.page('/feed?tab=watching')), [600004]);
  await agent.form('/posts/600004/watch', { watch: 0 });
  assert.deepEqual(ids(await agent.page('/feed?tab=watching')), []);
  await q(
    'INSERT INTO post_watches (user_id,post_id) VALUES (6,600008),(6,600009),(6,600010),(6,600004)',
  );
  assert.deepEqual(ids(await agent.page('/feed?tab=watching')), [600004]);
  await q(
    "INSERT INTO hidden_content (target_type,target_id,hidden_by,reason) VALUES ('post',600004,1,'fixture')",
  );
  for (const tab of ['watching', 'hot']) {
    const page = await agent.page('/feed?tab=' + tab);
    assert.ok(!ids(page).includes(600004));
    assert.doesNotMatch(
      page.$('.discover-feed').html(),
      /#600008|#600009|#600010|kelvin0hk|author_id|connect\.hku\.hk/,
    );
  }
});
