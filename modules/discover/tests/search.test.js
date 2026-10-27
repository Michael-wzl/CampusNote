const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { resetDb, agentAs, make, q, anon } = require('../../../test/helpers');
beforeEach(resetDb);
const ids = (p) =>
  p
    .$('.discover-search .post-card')
    .map((_, a) => Number(p.$(a).attr('href').split('/').pop()))
    .get();

test('DS-T10/11: required-word English/Chinese search respects university and searches only bodies', async () => {
  for (const [handle, query, expected] of [
    ['mandy0hku', 'library', [600001]],
    ['wing0cuhk', 'library', [600008]],
    ['jason0ust', 'library', []],
    ['mandy0hku', '叉烧', [600002]],
    ['mandy0hku', 'main', [600001]],
    ['mandy0hku', 'MAIN', [600001]],
    ['mandy0hku', 'Joy Hing', []],
    ['mandy0hku', "Dragon's Back", [600011]],
    ['mandy0hku', 'book impossible', []],
  ]) {
    const page = await (await agentAs(handle)).page('/search?q=' + encodeURIComponent(query));
    assert.equal(page.status, 200);
    assert.deepEqual(ids(page), expected, handle + '/' + query);
    if (!expected.length)
      assert.equal(page.$('.empty p').text(), 'No posts contain all of these words.');
  }
  const page = await (await agentAs('mandy0hku')).page('/search?q=a');
  assert.equal(page.$('.empty p').text(), 'Type at least 2 characters');
});

test('DS-T12: relevance, newest and topic filtering keep selected controls', async () => {
  const agent = await agentAs('mandy0hku');
  for (const [query, expected, sort, topic] of [
    ['q=book', [600005, 600006], 'relevance', ''],
    ['q=book&sort=newest', [600006, 600005], 'newest', ''],
    ['q=book&topic=trade', [600005], 'relevance', 'trade'],
    ['q=book&topic=trade&sort=newest', [600005], 'newest', 'trade'],
    ['q=book&sort=bad&topic=bad', [600005, 600006], 'relevance', ''],
  ]) {
    const page = await agent.page('/search?' + query);
    assert.deepEqual(ids(page), expected);
    assert.equal(page.$('[name=sort] option:selected').val(), sort);
    assert.equal(page.$('[name=topic] option:selected').val(), topic);
  }
});

test('DS-T13: only live visible six/seven-digit post numbers redirect, without disclosing inaccessible posts', async () => {
  for (const [handle, value, status, location] of [
    ['mandy0hku', '#600012', 303, '/posts/600012'],
    ['mandy0hku', '600012', 303, '/posts/600012'],
    ['wing0cuhk', '#600008', 303, '/posts/600008'],
    ['mandy0hku', '#600008', 200],
    ['mandy0hku', '#600009', 200],
    ['mandy0hku', '#600010', 200],
    ['mandy0hku', '9999999', 200],
  ]) {
    const page = await (await agentAs(handle)).page('/search?q=' + encodeURIComponent(value));
    assert.equal(page.status, status);
    assert.equal(page.headers.location, location);
    if (status === 200) {
      assert.deepEqual(ids(page), []);
      assert.equal(page.$('.empty p').text(), 'No posts contain all of these words.');
    }
  }
});

test('DS-T14: empty search shows events, named organization cards and usable GET filters', async () => {
  const page = await (await agentAs('newbie0hk')).page('/search');
  assert.deepEqual(ids(page), [600011, 600006]);
  assert.equal(page.$('.discover-search a[href="/events"]').length, 1);
  assert.match(
    page.$('.discover-search').text(),
    /Campus events[\s\S]*Film nights, hikes and talks. Book free tickets.[\s\S]*From organizations/,
  );
  assert.equal(page.$('form[method=get][action="/search"]').length, 1);
  assert.equal(page.$('[data-autosubmit]').length, 2);
  assert.equal(page.$('[name=topic] option').length, 8);
  assert.equal(page.$('.load-more').length, 0);
});

test('DS-4/BR-6: organization discovery never identifies anonymous posts and still filters visibility', async () => {
  const anonymous = await make.post({ author: 'filmsoc00', visibility: 'all', anonymous: true });
  const named = await make.post({
    author: 'filmsoc00',
    visibility: 'university',
    anonymous: false,
  });
  const hku = await (await agentAs('mandy0hku')).page('/search');
  const cuhk = await (await agentAs('wing0cuhk')).page('/search');
  assert.deepEqual(ids(hku), [named, 600011, 600006]);
  assert.deepEqual(ids(cuhk), [600011, 600006]);
  assert.ok(!ids(hku).includes(anonymous));
  for (let i = 0; i < 11; i++)
    await make.post({ author: 'filmsoc00', visibility: 'all', anonymous: false });
  assert.equal(ids(await (await agentAs('mandy0hku')).page('/search')).length, 10);
});

test('DS-4: 25 matching posts paginate with encoded query, sort and topic preserved', async () => {
  const posts = [];
  for (let i = 0; i < 25; i++)
    posts.push(
      await make.post({
        author: 'newbie0hk',
        body: '海风 saffron',
        topic: 'food',
        visibility: 'all',
      }),
    );
  const agent = await agentAs('mandy0hku');
  const first = await agent.page(
    '/search?q=' + encodeURIComponent('海风 +saffron') + '&sort=newest&topic=food',
  );
  assert.deepEqual(ids(first), posts.slice().reverse().slice(0, 20));
  const next = first.$('.load-more').attr('href');
  const url = new URL(next, 'http://test');
  assert.equal(url.searchParams.get('q'), '海风 +saffron');
  assert.equal(url.searchParams.get('sort'), 'newest');
  assert.equal(url.searchParams.get('topic'), 'food');
  assert.equal(url.searchParams.get('page'), '2');
  const second = await agent.page(next);
  assert.deepEqual(ids(second), posts.slice(0, 5).reverse());
  assert.equal(second.$('.load-more').length, 0);
  for (const value of ['0', '-1', '1.5', 'bad', '2147483648', '2&page=3'])
    assert.deepEqual(
      ids(await agent.page('/search?q=saffron&sort=newest&page=' + value)),
      ids(first),
    );
  assert.deepEqual(ids(await agent.page('/search?q=saffron&page=999')), []);
});

test('DS-T19/T26: hidden/deleted posts stay out of all search modes; controls and stored text are escaped', async () => {
  for (const handle of [
    'mandy0hku',
    'kelvin0hk',
    'wing0cuhk',
    'jason0ust',
    'newbie0hk',
    'admin0000',
  ]) {
    const agent = await agentAs(handle);
    for (const path of [
      '/search',
      '/search?q=mistake',
      '/search?q=followers',
      '/search?q=book&sort=newest',
    ]) {
      const page = await agent.page(path);
      assert.equal(page.status, 200);
      assert.doesNotMatch(
        page.$('.discover-search').html(),
        /#600009|#600010|kelvin0hk|author_id|connect\.hku\.hk/,
      );
    }
  }
  const text = '<script>alert("saffron")</script>';
  const post = await make.post({ author: 'newbie0hk', body: text, visibility: 'all' });
  const agent = await agentAs('mandy0hku');
  const page = await agent.page('/search?q=' + encodeURIComponent(text));
  assert.equal(page.$('[name=q]').val(), text);
  assert.equal(page.$('.discover-search script').length, 0);
  assert.equal(page.$(`.post-card[href="/posts/${post}"] .post-text`).text(), text);
  await q('UPDATE posts SET deleted_at=UTC_TIMESTAMP() WHERE post_id=?', [post]);
  assert.deepEqual(ids(await agent.page('/search?q=saffron')), []);
  assert.equal((await anon().page('/search')).status, 303);
});

test('DS-4: punctuation, long or repeated inputs remain bounded and cannot inject SQL or boolean syntax', async () => {
  const agent = await agentAs('mandy0hku');
  for (const query of ['+ - () ~ * " @', '" OR 1=1 --', '字'.repeat(120)]) {
    const page = await agent.page('/search?q=' + encodeURIComponent(query));
    assert.equal(page.status, 200);
    assert.ok(page.$('[name=q]').val().length <= 100);
  }
  const repeated = await agent.page(
    '/search?q=book&q=library&sort=newest&sort=relevance&topic=food&topic=trade',
  );
  assert.equal(repeated.status, 200);
  assert.equal(repeated.$('[name=sort] option:selected').val(), 'relevance');
  assert.equal(repeated.$('[name=topic] option:selected').val(), '');
});
