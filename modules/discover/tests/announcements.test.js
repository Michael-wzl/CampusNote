const { test, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { resetDb, agentAs, q } = require('../../../test/helpers');
const config = require('../../../core/config');
const uploads = require('../../../core/uploads');
const queries = require('../queries');
const { validHkt, validateAnnouncement } = require('../announcements');

beforeEach(resetDb);
const ownedImages = [];
after(() => uploads.remove(ownedImages));
const format = (value) => new Date(value + 8 * 3600e3).toISOString().slice(0, 16);
const fields = (extra = {}) => ({
  title: 'Exam week quiet hours',
  subtitle: 'Please keep the library quiet.',
  link: '/feed?tab=academics',
  starts: format(Date.now() - 3600e3),
  ends: format(Date.now() + 2 * 86400e3),
  sort_order: '0',
  ...extra,
});
const bannerIds = (page) =>
  page
    .$('.announcement-banner')
    .map((_, element) => Number(page.$(element).attr('data-announcement-id')))
    .get();
const disk = (url) => path.join(config.uploadDir, url.slice('/uploads/'.length));
const files = (dir = config.uploadDir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const name = path.join(dir, entry.name);
        return entry.isDirectory() ? files(name) : [name];
      })
    : [];
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==',
  'base64',
);
async function multipart(admin, pagePath, values, image = png, options = {}) {
  const form = await admin.page(pagePath);
  let request = admin.raw.post(form.$('form[enctype="multipart/form-data"]').attr('action'));
  for (const [key, value] of Object.entries(values)) request = request.field(key, value);
  return request.attach('image', image, {
    filename: options.filename || 'announcement.png',
    contentType: options.contentType || 'image/png',
  });
}

test('DS-T09: only current announcements appear on the first All feed page', async () => {
  const viewer = await agentAs('newbie0hk');
  assert.deepEqual(bannerIds(await viewer.page('/feed')), [1]);
  for (const url of [
    '/feed?tab=hot',
    '/feed?tab=watching',
    '/feed?tab=uni',
    '/feed?tab=food',
    '/feed?tab=all&before=600007',
  ])
    assert.deepEqual(bannerIds(await viewer.page(url)), [], url);
  await q('UPDATE announcements SET ends_at = UTC_TIMESTAMP() WHERE announcement_id = 1');
  assert.deepEqual(bannerIds(await viewer.page('/feed')), []);
});

test('DS-T09: current window includes its start, excludes its end and sorts ties by id', async () => {
  await q(
    'UPDATE announcements SET starts_at = UTC_TIMESTAMP(), ends_at = UTC_TIMESTAMP() + INTERVAL 1 DAY WHERE announcement_id = 1',
  );
  const admin = await agentAs('admin0000');
  assert.equal((await admin.form('/admin/announcements', fields())).status, 303);
  assert.equal((await admin.form('/admin/announcements', fields({ title: 'Second' }))).status, 303);
  assert.deepEqual(bannerIds(await (await agentAs('mandy0hku')).page('/feed')), [3, 4, 1]);
  await q(
    'UPDATE announcements SET starts_at = UTC_TIMESTAMP() + INTERVAL 1 DAY, ends_at = UTC_TIMESTAMP() + INTERVAL 2 DAY WHERE announcement_id = 3',
  );
  assert.deepEqual(bannerIds(await (await agentAs('wing0cuhk')).page('/feed')), [4, 1]);
});

test('DS-T23: admin groups current, scheduled and expired announcements with None states', async () => {
  const page = await (await agentAs('admin0000')).page('/admin/announcements');
  assert.equal(page.status, 200);
  assert.match(page.$('section[aria-label="Current"]').text(), /Film night this Friday/);
  assert.equal(page.$('section[aria-label="Scheduled"] p').text(), 'None');
  assert.match(page.$('section[aria-label="Expired"]').text(), /Welcome week/);
  assert.equal(page.$('form[enctype="multipart/form-data"]').length, 1);
  assert.equal(page.$('[name=image]').attr('type'), 'file');
});

test('DS-T23: every admin operation rejects students and organizations, and POST requires CSRF', async () => {
  for (const handle of ['mandy0hku', 'filmsoc00']) {
    const user = await agentAs(handle);
    for (const url of ['/admin/announcements', '/admin/announcements/1'])
      assert.equal((await user.page(url)).status, 403);
    for (const url of [
      '/admin/announcements',
      '/admin/announcements/1',
      '/admin/announcements/1/delete',
    ])
      assert.equal((await user.form(url, fields())).status, 403);
  }
  const admin = await agentAs('admin0000');
  for (const url of [
    '/admin/announcements',
    '/admin/announcements/1',
    '/admin/announcements/1/delete',
  ])
    assert.equal((await admin.raw.post(url).type('form').send(fields())).status, 403);
  assert.equal((await q.one('SELECT COUNT(*) AS n FROM announcements')).n, 2);
});

test('DS-T24: creation persists HKT inputs as UTC and shows the current banner', async () => {
  const admin = await agentAs('admin0000');
  const values = fields();
  const saved = await admin.form('/admin/announcements', values);
  assert.equal(saved.status, 303);
  assert.equal(saved.headers.location, '/admin/announcements');
  const row = await q.one('SELECT * FROM announcements WHERE announcement_id = 3');
  assert.equal(row.created_by, 1);
  assert.equal(row.starts_at.toISOString(), new Date(values.starts + ':00+08:00').toISOString());
  assert.equal(row.ends_at.toISOString(), new Date(values.ends + ':00+08:00').toISOString());
  const feed = await (await agentAs('mandy0hku')).page('/feed');
  assert.deepEqual(bannerIds(feed), [3, 1]);
  assert.equal(feed.$('.announcement-banner').first().attr('href'), values.link);
  assert.match((await admin.page('/admin/announcements')).text, /Announcement saved/);
});

test('DS-T25: invalid links, fields, impossible times and ordering get feedback without writes', async () => {
  const admin = await agentAs('admin0000');
  for (const [key, value, error] of [
    ['title', '', 'Enter a title'],
    ['title', '字'.repeat(61), 'At most 60 characters'],
    ['subtitle', '😀'.repeat(121), 'At most 120 characters'],
    ...[
      'https://evil.example',
      '//evil.example',
      '/\\evil.example',
      '/two words',
      '/x\ny',
      '/' + 'x'.repeat(255),
      '/x\u0000y',
    ].map((value) => ['link', value, 'Use a link inside Campus Notes']),
    ['starts', '2026-02-30T12:00', 'Enter a date and time'],
    ['starts', '2026-02-29T12:00', 'Enter a date and time'],
    ['starts', '2026-10-27T24:00', 'Enter a date and time'],
    ['starts', '2026-10-27T12:99', 'Enter a date and time'],
    ['starts', '0000-01-01T12:00', 'Enter a date and time'],
    ['starts', '1000-01-01T00:00', 'Enter a date and time'],
    ['sort_order', '-1', 'Use a number from 0 to 255'],
    ['sort_order', '256', 'Use a number from 0 to 255'],
    ['sort_order', '1.5', 'Use a number from 0 to 255'],
  ]) {
    const response = await admin.form('/admin/announcements', fields({ [key]: value }));
    assert.equal(response.status, 400, key + '=' + value);
    assert.ok(response.text.includes(error), error);
    assert.equal((await q.one('SELECT COUNT(*) AS n FROM announcements')).n, 2);
    assert.equal(
      response.$('[name=subtitle]').val(),
      key === 'subtitle' ? value : fields().subtitle,
    );
  }
  const starts = fields().starts;
  const response = await admin.form('/admin/announcements', fields({ starts, ends: starts }));
  assert.equal(response.status, 400);
  assert.match(response.text, /The end must be after the start/);
});

test('DS-T25: Unicode lengths and optional fields are accepted; root link canonicalizes to feed', async () => {
  const admin = await agentAs('admin0000');
  assert.equal(
    (
      await admin.form(
        '/admin/announcements',
        fields({ title: '😀'.repeat(60), subtitle: '', link: '/', sort_order: '255' }),
      )
    ).status,
    303,
  );
  const item = await queries.getAnnouncement(3);
  assert.equal(item.link_url, '/feed');
  assert.equal(item.sort_order, 255);
  assert.equal(
    (await admin.form('/admin/announcements', fields({ title: 'No link', subtitle: '', link: '' })))
      .status,
    303,
  );
  const feed = await (await agentAs('newbie0hk')).page('/feed');
  assert.equal(feed.$('div.announcement-banner[data-announcement-id="4"]').length, 1);
  assert.equal(feed.$('[data-announcement-id="4"]').attr('href'), undefined);
});

test('DS-T27: edit form round-trips HKT and an unchanged save retains its static image', async () => {
  const admin = await agentAs('admin0000');
  const item = await queries.getAnnouncement(1);
  const form = await admin.page('/admin/announcements/1');
  assert.equal(form.$('[name=starts]').val(), item.starts_local);
  assert.equal(form.$('[name=ends]').val(), item.ends_local);
  const saved = await admin.form(
    '/admin/announcements/1',
    fields({
      title: 'Film night: Wake Up',
      starts: item.starts_local,
      ends: item.ends_local,
      link: item.link_url,
      sort_order: String(item.sort_order),
    }),
  );
  assert.equal(saved.status, 303);
  assert.equal((await queries.getAnnouncement(1)).image_path, item.image_path);
  assert.match((await (await agentAs('newbie0hk')).page('/feed')).text, /Film night: Wake Up/);
});

test('DS-T28: deleting an announcement removes its banner and repeated/malformed targets are 404', async () => {
  const admin = await agentAs('admin0000');
  assert.equal((await admin.form('/admin/announcements/1/delete')).status, 303);
  assert.deepEqual(bannerIds(await (await agentAs('newbie0hk')).page('/feed')), []);
  assert.match((await admin.page('/admin/announcements')).text, /Announcement deleted/);
  for (const id of ['1', '999', '0', '-1', '65536', 'bad', '1.5']) {
    assert.equal((await admin.page('/admin/announcements/' + id)).status, 404);
    assert.equal((await admin.form('/admin/announcements/' + id, fields())).status, 404);
    assert.equal((await admin.form('/admin/announcements/' + id + '/delete')).status, 404);
  }
});

test('DS-3/DS-7: stored titles, subtitles and links are escaped in every screen', async () => {
  const admin = await agentAs('admin0000');
  assert.equal(
    (
      await admin.form(
        '/admin/announcements',
        fields({
          title: '<script>x</script>',
          subtitle: '<img src=x onerror=alert(1)>',
          link: '/events/1?x="onmouseover="x',
        }),
      )
    ).status,
    303,
  );
  for (const page of [
    await admin.page('/admin/announcements'),
    await admin.page('/admin/announcements/3'),
    await (await agentAs('newbie0hk')).page('/feed'),
  ]) {
    assert.equal(page.$('main script, main img[onerror], main [onmouseover]').length, 0);
    assert.ok(page.text.includes('&lt;script&gt;x&lt;/script&gt;'));
  }
});

test('DS-7: uploaded images are replaced, removed and deleted only after successful saves', async () => {
  const admin = await agentAs('admin0000');
  assert.equal((await multipart(admin, '/admin/announcements', fields())).status, 303);
  let item = await queries.getAnnouncement(3);
  const first = item.image_path;
  ownedImages.push(first);
  assert.ok(fs.existsSync(disk(first)));
  assert.equal(
    (await multipart(admin, '/admin/announcements/3', fields({ title: 'Replaced' }))).status,
    303,
  );
  item = await queries.getAnnouncement(3);
  ownedImages.push(item.image_path);
  assert.notEqual(item.image_path, first);
  assert.equal(fs.existsSync(disk(first)), false);
  assert.ok(fs.existsSync(disk(item.image_path)));
  const second = item.image_path;
  assert.equal(
    (await admin.form('/admin/announcements/3', fields({ remove_image: '1' }))).status,
    303,
  );
  assert.equal((await queries.getAnnouncement(3)).image_path, null);
  assert.equal(fs.existsSync(disk(second)), false);
  assert.equal((await multipart(admin, '/admin/announcements/3', fields())).status, 303);
  item = await queries.getAnnouncement(3);
  ownedImages.push(item.image_path);
  assert.equal((await admin.form('/admin/announcements/3/delete')).status, 303);
  assert.equal(fs.existsSync(disk(item.image_path)), false);
});

test('DS-T25: refused files and validation failures leave no orphan upload or database row', async () => {
  const admin = await agentAs('admin0000');
  const before = files();
  assert.equal((await multipart(admin, '/admin/announcements', fields({ title: '' }))).status, 400);
  assert.deepEqual(files(), before);
  for (const [image, options] of [
    [Buffer.from('not an image'), { filename: 'bad.txt', contentType: 'text/plain' }],
    [Buffer.from('not a png'), {}],
    [Buffer.alloc(5 * 1024 * 1024 + 1), {}],
  ]) {
    const response = await multipart(admin, '/admin/announcements', fields(), image, options);
    assert.equal(response.status, 400);
    assert.match(response.text, /One image only/);
    assert.deepEqual(files(), before);
  }
  assert.equal((await q.one('SELECT COUNT(*) AS n FROM announcements')).n, 2);
});

test('DS-7: a failed image replacement preserves the committed image and removes the rejected new file', async () => {
  const admin = await agentAs('admin0000');
  assert.equal((await multipart(admin, '/admin/announcements', fields())).status, 303);
  const item = await queries.getAnnouncement(3);
  ownedImages.push(item.image_path);
  const before = files();
  const original = queries.updateAnnouncement;
  queries.updateAnnouncement = async () => {
    throw new Error('Forced announcement save failure');
  };
  try {
    assert.equal((await multipart(admin, '/admin/announcements/3', fields())).status, 500);
    assert.deepEqual(files(), before);
    assert.equal((await queries.getAnnouncement(3)).image_path, item.image_path);
    assert.ok(fs.existsSync(disk(item.image_path)));
  } finally {
    queries.updateAnnouncement = original;
  }
});

test('DS-7: concurrent image replacements leave only the winning committed image', async () => {
  const admin = await agentAs('admin0000');
  const before = files();
  assert.equal((await multipart(admin, '/admin/announcements', fields())).status, 303);
  const outcomes = await Promise.all([
    multipart(admin, '/admin/announcements/3', fields({ title: 'Concurrent A' })),
    multipart(admin, '/admin/announcements/3', fields({ title: 'Concurrent B' })),
  ]);
  assert.deepEqual(
    outcomes.map((response) => response.status),
    [303, 303],
  );
  const item = await queries.getAnnouncement(3);
  ownedImages.push(item.image_path);
  assert.ok(fs.existsSync(disk(item.image_path)));
  assert.deepEqual(
    files().filter((name) => !before.includes(name)),
    [disk(item.image_path)],
  );
});

test('DS-7/BR-17: valid supported date extremes round-trip through UTC without conversion-range surprises', async () => {
  const admin = await agentAs('admin0000');
  for (const [starts, ends] of [
    ['1000-01-01T08:00', '1000-01-02T08:00'],
    ['9999-12-30T23:00', '9999-12-31T23:59'],
  ]) {
    assert.ok(validHkt(starts));
    const values = fields({ starts, ends });
    assert.equal((await admin.form('/admin/announcements', values)).status, 303);
    const item = await q.one(
      'SELECT announcement_id FROM announcements ORDER BY announcement_id DESC LIMIT 1',
    );
    const form = await admin.page('/admin/announcements/' + item.announcement_id);
    assert.equal(form.$('[name=starts]').val(), starts);
    assert.equal(form.$('[name=ends]').val(), ends);
  }
});

test('DS-7: unsupported bodies and invalid field types produce validation feedback', async () => {
  const admin = await agentAs('admin0000');
  await admin.page('/admin/announcements');
  const response = await admin.raw
    .post('/admin/announcements')
    .set('X-CSRF-Token', admin.token)
    .set('Content-Type', 'application/octet-stream')
    .send(Buffer.from('invalid'));
  assert.equal(response.status, 400);
  assert.match(response.text, /Enter a title/);
  assert.ok(validateAnnouncement({ title: ['A', 'B'], starts: {}, ends: [] }).errors.title);
});

test('DS-7: database window/link validation failures return a form error without orphan uploads', async () => {
  const admin = await agentAs('admin0000');
  const before = files();
  const original = queries.createAnnouncement;
  queries.createAnnouncement = async () => {
    throw Object.assign(new Error('Constraint rejected the announcement'), { errno: 3819 });
  };
  try {
    const response = await multipart(admin, '/admin/announcements', fields());
    assert.equal(response.status, 400);
    assert.match(response.text, /Check the link and the times/);
    assert.deepEqual(files(), before);
    assert.equal((await q.one('SELECT COUNT(*) AS n FROM announcements')).n, 2);
  } finally {
    queries.createAnnouncement = original;
  }
});

test('DS-7: deletion between loading and saving cannot revive the row or retain the new upload', async () => {
  const admin = await agentAs('admin0000');
  const before = files();
  const original = queries.updateAnnouncement;
  queries.updateAnnouncement = async (id) => {
    await q('DELETE FROM announcements WHERE announcement_id = ?', [id]);
    return null;
  };
  try {
    assert.equal((await multipart(admin, '/admin/announcements/1', fields())).status, 404);
    assert.equal(await queries.getAnnouncement(1), null);
    assert.deepEqual(files(), before);
  } finally {
    queries.updateAnnouncement = original;
  }
});
