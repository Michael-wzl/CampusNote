const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { resetDb, agentAs, make, q } = require('../../../test/helpers');
beforeEach(resetDb);
const paths = ['/me/watching', '/me/likes', '/me/history'];
const ids = (p) =>
  p
    .$('.discover-my-list .post-card')
    .map((_, a) => Number(p.$(a).attr('href').split('/').pop()))
    .get();

test('DS-T15: personal lists use exact interaction-time seed orders and History has a protected clear form', async () => {
  const agent = await agentAs('mandy0hku');
  for (const [path, expected, title] of [
    ['/me/watching', [600012, 600004], 'Watching'],
    ['/me/likes', [600012, 600006, 600004, 600003, 600002], 'Liked'],
    ['/me/history', [600012, 600004, 600006, 600002], 'History'],
  ]) {
    const page = await agent.page(path);
    assert.equal(page.status, 200);
    assert.deepEqual(ids(page), expected);
    assert.equal(page.$('.discover-my-list').attr('aria-label'), title);
    assert.equal(page.$('.discover-my-list > .muted').length, 0);
    assert.equal(page.$('.topbar-back').attr('href'), '/me');
    assert.equal(page.$('.load-more').length, 0);
    const form = page.$('form[action="/me/history/clear"]');
    assert.equal(form.length, path === '/me/history' ? 1 : 0);
    if (form.length) {
      assert.equal(form.attr('data-confirm'), 'Clear your history?');
      assert.ok(form.find('[name=_csrf]').val());
    }
  }
});

test('DS-T16: Newbie lists have exact empty states, Feed action and no Clear history', async () => {
  const agent = await agentAs('newbie0hk');
  for (const [i, text] of [
    'Posts you watch (the star) appear here.',
    'Posts you like (the heart) appear here.',
    'Posts you open appear here.',
  ].entries()) {
    const page = await agent.page(paths[i] + '?userId=2&handle=mandy0hku');
    assert.deepEqual(ids(page), []);
    assert.equal(page.$('.empty p').text(), text);
    assert.equal(page.$('.empty a').attr('href'), '/feed');
    assert.equal(page.$('.empty a').text(), 'Browse the feed');
    assert.equal(page.$('form[action="/me/history/clear"]').length, 0);
  }
});

test('DS-5/BR-11: My Watching keeps watch order when the feed changes with new discussion activity', async () => {
  const agent = await agentAs('mandy0hku');
  await make.comment({ post: 600004, author: 'jason0ust' });
  assert.deepEqual(ids(await agent.page('/me/watching')), [600012, 600004]);
  const feed = await agent.page('/feed?tab=watching');
  assert.equal(feed.$('.post-card').first().attr('href'), '/posts/600004');
});

test('DS-5/CT-T22: real watch/unwatch and like/unlike update only the current viewer lists', async () => {
  const agent = await agentAs('newbie0hk');
  for (const [action, field, path] of [
    ['watch', 'watch', '/me/watching'],
    ['like', 'like', '/me/likes'],
  ]) {
    const before = ids(await (await agentAs('mandy0hku')).page(path));
    assert.equal((await agent.form(`/posts/600003/${action}`, { [field]: 1 })).status, 303);
    assert.deepEqual(ids(await agent.page(path)), [600003]);
    await agent.form(`/posts/600003/${action}`, { [field]: 0 });
    assert.deepEqual(ids(await agent.page(path)), []);
    assert.deepEqual(ids(await (await agentAs('mandy0hku')).page(path)), before);
  }
});

test('DS-T18: real Clear history retains view counts, preserves other users, and a revisit restores one item', async () => {
  const agent = await agentAs('mandy0hku');
  const before = await q.one('SELECT SUM(view_count) AS total FROM post_views');
  const other = await q(
    'SELECT post_id,last_viewed_at,cleared_at,view_count FROM post_views WHERE user_id=3 ORDER BY post_id',
  );
  const page = await agent.page('/me/history');
  assert.equal(
    (await agent.form(page.$('form[action="/me/history/clear"]').attr('action'))).status,
    303,
  );
  const empty = await agent.page('/me/history');
  assert.deepEqual(ids(empty), []);
  assert.match(empty.text, /History cleared/);
  assert.equal(empty.$('form[action="/me/history/clear"]').length, 0);
  assert.deepEqual(await q.one('SELECT SUM(view_count) AS total FROM post_views'), before);
  assert.deepEqual(
    await q(
      'SELECT post_id,last_viewed_at,cleared_at,view_count FROM post_views WHERE user_id=3 ORDER BY post_id',
    ),
    other,
  );
  assert.equal((await agent.page('/posts/600004')).status, 200);
  assert.deepEqual(ids(await agent.page('/me/history')), [600004]);
  const after = await q.one('SELECT SUM(view_count) AS total FROM post_views');
  assert.equal(Number(after.total), Number(before.total) + 1);
});

test('DS-5: all offset lists use 20-card pages, deterministic ties, invalid-page defaults and exact boundary', async () => {
  const posts = [];
  for (let i = 0; i < 25; i++)
    posts.push(await make.post({ author: 'newbie0hk', visibility: 'all' }));
  for (const table of ['post_watches', 'post_likes', 'post_views'])
    await q(`INSERT INTO ${table} (user_id,post_id) VALUES ?`, [posts.map((id) => [6, id])]);
  // All interaction timestamps are equal so only the documented post-id tie break decides order.
  await q('UPDATE post_watches SET created_at=UTC_TIMESTAMP() WHERE user_id=6');
  await q('UPDATE post_likes SET created_at=UTC_TIMESTAMP() WHERE user_id=6');
  await q('UPDATE post_views SET last_viewed_at=UTC_TIMESTAMP() WHERE user_id=6');
  const agent = await agentAs('newbie0hk');
  for (const path of paths) {
    const first = await agent.page(path);
    assert.deepEqual(ids(first), posts.slice().reverse().slice(0, 20));
    assert.equal(first.$('.load-more').attr('href'), path + '?page=2');
    const second = await agent.page(first.$('.load-more').attr('href'));
    assert.deepEqual(ids(second), posts.slice(0, 5).reverse());
    assert.equal(second.$('.load-more').length, 0);
    for (const value of ['0', '-1', '1.5', 'bad', '2147483648', '2&page=3'])
      assert.deepEqual(ids(await agent.page(path + '?page=' + value)), ids(first));
    const end = await agent.page(path + '?page=999');
    assert.deepEqual(ids(end), []);
    assert.equal(end.$('form[action="/me/history/clear"]').length, 0);
  }
  await q('UPDATE posts SET deleted_at=UTC_TIMESTAMP() WHERE post_id IN (?)', [posts.slice(0, 5)]);
  for (const path of paths) {
    const page = await agent.page(path);
    assert.equal(ids(page).length, 20);
    assert.equal(page.$('.load-more').length, 0);
  }
});

test('DS-T19/T26: deleted, hidden and newly inaccessible touched posts disappear; anonymous identities remain private', async () => {
  for (const table of ['post_watches', 'post_likes', 'post_views'])
    await q(
      `INSERT INTO ${table} (user_id,post_id) VALUES (6,600008),(6,600009),(6,600010),(6,600004)`,
    );
  const agent = await agentAs('newbie0hk');
  for (const path of paths) assert.deepEqual(ids(await agent.page(path)), [600004]);
  await q("UPDATE posts SET visibility='university' WHERE post_id=600004");
  for (const path of paths) assert.deepEqual(ids(await agent.page(path)), []);
  for (const handle of [
    'mandy0hku',
    'kelvin0hk',
    'wing0cuhk',
    'jason0ust',
    'newbie0hk',
    'admin0000',
  ]) {
    const viewer = await agentAs(handle);
    for (const path of paths) {
      const page = await viewer.page(path);
      assert.equal(page.status, 200);
      assert.doesNotMatch(
        page.$('.discover-my-list').html(),
        /#600009|#600010|kelvin0hk|author_id|connect\.hku\.hk/,
      );
    }
  }
});

test('DS-5 integration: all Me post-list totals agree with their visible destinations', async () => {
  const agent = await agentAs('mandy0hku');
  const me = await agent.page('/me');
  for (const path of ['/me/posts', '/me/watching', '/me/history']) {
    const count = Number(me.$(`a[href="${path}"] .stat-value`).text());
    assert.equal(ids(await agent.page(path)).length, count, path);
  }
});
