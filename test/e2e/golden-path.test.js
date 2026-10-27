// The demo's golden path across all modules (PRODUCT_SPEC.md §6).
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { resetDb, anon, agentAs, make, q } = require('../helpers');
const config = require('../../core/config');

// The upload belongs to this test process, separate from demo and other module test files.
const uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'campusnote-golden-path-'));
config.uploadDir = uploadDir;
after(() => fs.rmSync(uploadDir, { recursive: true, force: true }));
const photo = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jN5kAAAAASUVORK5CYII=',
  'base64',
);

before(resetDb);

test('1. Sign up: register, read the code from the mail, choose a password, land on the feed', async () => {
  const sam = anon();
  const email = 'sam@connect.hku.hk';
  const reg = await sam.form('/auth/register', { email });
  assert.equal(reg.status, 303);
  assert.equal(reg.headers.location, '/auth/verify');
  const mail = await q.one(
    'SELECT body_text FROM outbox WHERE to_email = ? ORDER BY mail_id DESC LIMIT 1',
    [email],
  );
  const code = mail.body_text.match(/\b(\d{6})\b/)[1];
  const done = await sam.form('/auth/verify', {
    code,
    password: 'secret123',
    confirm: 'secret123',
  });
  assert.equal(done.status, 303);
  assert.equal(done.headers.location, '/feed');
  const feed = await sam.page('/feed');
  assert.equal(feed.status, 200);
  assert.match(feed.text, /Welcome to Campus Notes\. Your handle is [a-z0-9]{9}\./);
  assert.ok(feed.$('.post-card').length > 0);
});

test('2. Post: + -> text, a photo, Academics, anonymous -> Publish -> the new post page', async () => {
  const mandy = await agentAs('mandy0hku');
  const feed = await mandy.page('/feed');
  const composeLink = feed.$('a[href="/compose"]').first().attr('href');
  assert.equal(composeLink, '/compose');
  const compose = await mandy.page(composeLink);
  assert.equal(compose.status, 200);
  const form = compose.$('form[enctype="multipart/form-data"]');
  assert.equal(form.length, 1);
  const body = 'Study group for the database course, Thursday at the library.';
  const published = await mandy.raw
    .post(form.attr('action'))
    .field('body', body)
    .field('topic', 'academics')
    .field('show_handle', '0')
    .field('all_universities', '0')
    .attach('images', photo, { filename: 'study.png', contentType: 'image/png' });
  assert.equal(published.status, 303);
  assert.match(published.headers.location, /^\/posts\/\d+$/);
  const postId = Number(published.headers.location.split('/').pop());
  assert.deepEqual(
    await q.one(
      `SELECT p.author_id, p.body, p.is_anonymous, p.visibility, t.code AS topic
       FROM posts p JOIN topics t ON t.topic_id = p.topic_id WHERE p.post_id = ?`,
      [postId],
    ),
    { author_id: 2, body, is_anonymous: 1, visibility: 'university', topic: 'academics' },
  );
  assert.deepEqual(
    await q('SELECT user_id, alias_no FROM post_participants WHERE post_id = ?', [postId]),
    [{ user_id: 2, alias_no: 0 }],
  );
  const images = await q('SELECT position, file_path FROM post_images WHERE post_id = ?', [postId]);
  assert.equal(images.length, 1);
  assert.equal(images[0].position, 1);
  assert.deepEqual(
    fs.readFileSync(path.join(uploadDir, images[0].file_path.slice('/uploads/'.length))),
    photo,
  );
  const page = await mandy.page(published.headers.location);
  assert.equal(page.status, 200);
  assert.match(page.text, /Posted/);
  assert.equal(page.$('h1').text(), '#' + postId);
  assert.equal(page.$('.content-post .content-text').first().text(), body);
  assert.match(page.$('.content-post').text(), /Academics/);
  assert.equal(page.$('[data-content-image]').attr('href'), images[0].file_path);
  assert.equal(page.$('[data-content-image] img').attr('src'), images[0].file_path);
  assert.ok(!page.$('.content-post').html().includes('mandy0hku'));
  assert.equal(page.$('.sidebar-account strong').text(), 'mandy0hku');
  // Another HKU viewer sees the anonymous post; a CUHK viewer cannot open it.
  const reader = await (await agentAs('newbie0hk')).page(published.headers.location);
  assert.equal(reader.status, 200);
  assert.ok(!reader.text.includes('mandy0hku'));
  assert.equal((await (await agentAs('wing0cuhk')).page(published.headers.location)).status, 404);
});
const badge = (page) => Number(page.$('a[href="/messages"] .badge').first().text() || 0);

test('3. Discuss: a comment as Alice, the badge, the notification, the Host reply', async () => {
  await resetDb();
  const postId = await make.post({ author: 'newbie0hk', body: 'Which paper should I practise?' });
  const mandy = await agentAs('mandy0hku');
  const host = await agentAs('newbie0hk');
  assert.equal(badge(await host.page('/messages')), 0);
  const post = await mandy.page('/posts/' + postId);
  const action = post.$(`form[action="/posts/${postId}/comments"]`).attr('action');
  assert.ok(action);
  const comment = await mandy.form(action, { body: 'Try the 2024 paper first.' });
  assert.equal(comment.status, 303);
  const commentId = Number(comment.headers.location.split('#c')[1]);
  const thread = await mandy.page('/posts/' + postId);
  assert.equal(thread.$(`#c${commentId} .content-alias`).text(), 'Alice');
  assert.equal(badge(await host.page('/messages')), 1);
  const notifications = await host.page('/messages/notifications');
  const notification = notifications.$(`a[href="/posts/${postId}#c${commentId}"]`);
  assert.equal(notification.length, 1);
  assert.match(notification.text(), /Alice commented on your post/);
  assert.doesNotMatch(notification.html(), /mandy0hku|newbie0hk/);
  assert.equal(badge(notifications), 0);
  assert.equal((await host.page(notification.attr('href'))).status, 200);
  const reply = await host.form(action, {
    body: 'Thanks, I will start there.',
    reply_to: commentId,
  });
  assert.equal(reply.status, 303);
  const replyId = Number(reply.headers.location.split('#c')[1]);
  const repliedThread = await host.page('/posts/' + postId);
  assert.equal(repliedThread.$(`#c${replyId} .content-alias`).text(), 'Host');
  assert.match(repliedThread.$(`#c${replyId}`).text(), /replying to Alice/);
  assert.equal(badge(await mandy.page('/messages')), 5);
  const replyNotification = (await mandy.page('/messages/notifications')).$(
    `a[href="/posts/${postId}#c${replyId}"]`,
  );
  assert.equal(replyNotification.length, 1);
  assert.match(replyNotification.text(), /Host replied to your comment/);
  assert.doesNotMatch(replyNotification.html(), /mandy0hku|newbie0hk/);
});

test('4. Message privately: "Message the host" as Visitor', async () => {
  await resetDb();
  const postId = await make.post({
    author: 'mandy0hku',
    body: 'Can anyone recommend a study room?',
  });
  const visitor = await agentAs('newbie0hk');
  const host = await agentAs('mandy0hku');
  const post = await visitor.page('/posts/' + postId);
  const entry = post.$(`a[href="/messages/new?post=${postId}"]`).attr('href');
  assert.ok(entry);
  const compose = await visitor.page(entry);
  assert.equal(compose.status, 200);
  assert.match(compose.$('main').text(), /You will appear as Visitor/);
  const sent = await visitor.form(compose.$('form[method="post"]').attr('action'), {
    body: 'The fourth floor is quiet in the morning.',
  });
  assert.equal(sent.status, 303);
  const chatUrl = sent.headers.location;
  const id = Number(chatUrl.split('/').pop());
  const visitorChat = await visitor.page(chatUrl);
  assert.equal(visitorChat.$('h1').text(), `Host · Chat #${id}`);
  assert.match(visitorChat.$('.messages-context').text(), /You appear as Visitor/);
  assert.doesNotMatch(visitorChat.$('main').html(), /mandy0hku|newbie0hk|\/u\//);
  const inbox = await host.page('/messages');
  const preview = inbox.$(`a[href="${chatUrl}"]`);
  assert.match(preview.text(), /Visitor/);
  assert.equal(preview.find('.badge').text(), '1');
  const hostChat = await host.page(chatUrl);
  assert.equal(hostChat.$('h1').text(), `Visitor · Chat #${id}`);
  assert.match(hostChat.$('.messages-context').text(), /You appear as Host/);
  assert.doesNotMatch(hostChat.$('main').html(), /mandy0hku|newbie0hk|\/u\//);
  const replied = await host.form(hostChat.$('form[method="post"]').attr('action'), {
    body: 'Thank you, I will try it tomorrow.',
  });
  assert.equal(replied.status, 303);
  const received = await visitor.page(chatUrl);
  assert.match(received.$('.messages-thread').text(), /Thank you, I will try it tomorrow/);
  assert.doesNotMatch(received.$('main').html(), /mandy0hku|newbie0hk|\/u\//);
  assert.equal((await visitor.page(entry)).headers.location, chatUrl);
  const outsider = await agentAs('wing0cuhk');
  assert.equal((await outsider.page(chatUrl)).status, 404);
  assert.equal((await outsider.form(chatUrl, { body: 'I am not a member.' })).status, 404);
  assert.equal(
    (await q.one('SELECT COUNT(*) AS n FROM messages WHERE conversation_id = ?', [id])).n,
    2,
  );
});

test('5. Moderate: report, Hide, "[hidden by a moderator]", restore and preserve the audit', async () => {
  await resetDb();
  const postId = await make.post({
    author: 'mandy0hku',
    body: 'A post for the moderation walkthrough.',
    anonymous: false,
    visibility: 'all',
  });
  const mandy = await agentAs('mandy0hku');
  const newbie = await agentAs('newbie0hk');
  const reporter = await agentAs('kelvin0hk');
  const admin = await agentAs('admin0000');
  const commented = await newbie.form(`/posts/${postId}/comments`, {
    body: 'This comment is being reviewed.',
  });
  assert.equal(commented.status, 303);
  const commentId = Number(commented.headers.location.split('#c')[1]);
  const lists = [
    [reporter, '/feed'],
    [reporter, '/feed?tab=uni'],
    [mandy, '/me/posts'],
    [reporter, '/u/mandy0hku'],
  ];
  async function checkLists(expected) {
    for (const [agent, url] of lists) {
      const page = await agent.page(url);
      assert.equal(page.status, 200, url);
      assert.equal(page.$(`a.post-card[href="/posts/${postId}"]`).length, expected, url);
    }
  }
  await checkLists(1);
  for (const [type, targetId] of [
    ['comment', commentId],
    ['post', postId],
  ]) {
    const page = await reporter.page('/posts/' + postId);
    const link = page.$(`a[href="/report?type=${type}&id=${targetId}"]`).attr('href');
    assert.ok(link);
    const report = await reporter.page(link);
    assert.equal(report.status, 200);
    assert.equal(
      (await reporter.form(report.$('form[method="post"]').attr('action'), { reason: 'spam' }))
        .status,
      303,
    );
    const queue = await admin.page('/admin/reports');
    const target = queue
      .$('.messages-report')
      .filter(
        (_, el) =>
          queue.$(el).find('a').attr('href') ===
          `/posts/${postId}` + (type === 'comment' ? `#c${commentId}` : ''),
      );
    assert.equal(target.length, 1);
    const hideAction = target.find('form[action$="/hide"]').attr('action');
    assert.ok(hideAction);
    const reportId = Number(target.attr('data-report-id'));
    assert.equal((await admin.form(hideAction)).status, 303);
    const hidden = await reporter.page('/posts/' + postId);
    if (type === 'comment') {
      assert.equal(hidden.status, 200);
      assert.match(hidden.$(`#c${commentId}`).text(), /\[hidden by a moderator\]/);
      assert.doesNotMatch(hidden.$(`#c${commentId}`).text(), /This comment is being reviewed/);
      await checkLists(1);
    } else {
      assert.equal(hidden.status, 404);
      await checkLists(0);
    }
    const hiddenQueue = await admin.page('/admin/reports');
    const restoreAction = hiddenQueue.$(`[data-target="${type}/${targetId}"] form`).attr('action');
    assert.ok(restoreAction);
    assert.equal((await admin.form(restoreAction)).status, 303);
    const restored = await reporter.page('/posts/' + postId);
    assert.equal(restored.status, 200);
    if (type === 'comment')
      assert.match(restored.$(`#c${commentId}`).text(), /This comment is being reviewed/);
    await checkLists(1);
    assert.deepEqual(
      await q.one('SELECT resolution, resolved_by FROM reports WHERE report_id = ?', [reportId]),
      { resolution: 'hidden', resolved_by: 1 },
    );
    assert.equal(
      (
        await q.one(
          'SELECT COUNT(*) AS n FROM hidden_content WHERE target_type = ? AND target_id = ?',
          [type, targetId],
        )
      ).n,
      0,
    );
  }
});
test('6. Book a ticket: Search -> Campus events -> Film night -> Book -> My tickets', async () => {
  await resetDb();
  const viewer = await agentAs('newbie0hk');
  const search = await viewer.page('/search');
  assert.equal(search.status, 200);
  const eventsUrl = search.$('.discover-search a[href="/events"]').attr('href');
  assert.equal(eventsUrl, '/events', 'Search must expose the Campus events entry');
  const events = await viewer.page(eventsUrl);
  assert.equal(events.status, 200);
  const filmUrl = events.$('a[href="/events/1"]').first().attr('href');
  assert.equal(filmUrl, '/events/1');
  const detail = await viewer.page(filmUrl);
  assert.equal(detail.status, 200);
  assert.match(detail.$('h1').text(), /Film night/);
  const bookAction = detail.$('form[action="/events/1/book"]').attr('action');
  assert.equal(bookAction, '/events/1/book');
  const before = await q.one('SELECT tickets_left FROM events WHERE event_id = 1');
  const booked = await viewer.form(bookAction);
  assert.equal(booked.status, 303);
  assert.equal(booked.headers.location, filmUrl);
  const ticket = await q.one('SELECT ticket_code FROM tickets WHERE event_id = 1 AND user_id = 6');
  assert.ok(ticket, 'Booking must persist a ticket for the viewer');
  const bookedDetail = await viewer.page(booked.headers.location);
  assert.equal(bookedDetail.status, 200);
  assert.equal(bookedDetail.$('.ticket-code').text().trim(), ticket.ticket_code);
  assert.equal(
    (await q.one('SELECT tickets_left FROM events WHERE event_id = 1')).tickets_left,
    before.tickets_left - 1,
  );
  const meUrl = bookedDetail.$('a[href="/me"]').first().attr('href');
  assert.equal(meUrl, '/me');
  const me = await viewer.page(meUrl);
  assert.equal(me.status, 200);
  const ticketsUrl = me.$('main a[href="/me/tickets"]').attr('href');
  assert.equal(ticketsUrl, '/me/tickets');
  const tickets = await viewer.page(ticketsUrl);
  assert.equal(tickets.status, 200);
  const card = tickets.$('.ticket-card[data-event-id="1"]');
  assert.equal(card.length, 1);
  assert.equal(card.find('.ticket-code').text().trim(), ticket.ticket_code);
  assert.equal(card.find('a[href="/events/1"]').length, 1);
});
