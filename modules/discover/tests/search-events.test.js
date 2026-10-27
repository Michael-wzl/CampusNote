const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { resetDb, agentAs, q } = require('../../../test/helpers');
beforeEach(resetDb);

test('DS-4 integration: Search -> Campus events -> Film night -> booking -> My tickets', async () => {
  const viewer = await agentAs('newbie0hk');
  const search = await viewer.page('/search');
  const events = await viewer.page(search.$('.discover-search a[href="/events"]').attr('href'));
  assert.equal(events.status, 200);
  assert.ok(events.$('a[href="/events/1"]').length);
  const detail = await viewer.page('/events/1');
  assert.equal(detail.status, 200);
  assert.ok(detail.$('form[action="/events/1/book"]').length);
  assert.equal((await viewer.form('/events/1/book')).status, 303);
  const ticket = await q.one('SELECT ticket_code FROM tickets WHERE user_id=6 AND event_id=1');
  assert.ok(ticket);
  const tickets = await viewer.page('/me/tickets');
  assert.equal(tickets.status, 200);
  assert.ok(tickets.text.includes(ticket.ticket_code));
});
