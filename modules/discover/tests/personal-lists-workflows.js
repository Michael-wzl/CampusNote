// Real browser forms across Content, Discover and Identity, with and without JavaScript.
const assert = require('node:assert/strict');

module.exports = async function checkListWorkflows(browser, { baseURL, screenshotDir }) {
  const results = [];
  for (const javaScriptEnabled of [true, false]) {
    for (const width of [390, 1440]) {
      const context = await browser.newContext({
        javaScriptEnabled,
        viewport: { width, height: 900 },
      });
      try {
        const page = await context.newPage();
        await page.goto(`${baseURL}/dev/login-as/newbie0hk`);
        const visit = (path) => page.goto(baseURL + path);
        const clear = async () => {
          const button = page.getByRole('button', { name: 'Clear history', exact: true });
          if (javaScriptEnabled) {
            await button.click();
            await Promise.all([
              page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
              page.locator('dialog.confirm button.ok').click(),
            ]);
          } else {
            await Promise.all([
              page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
              button.click(),
            ]);
          }
          assert.equal(await page.locator('.discover-my-list .post-card').count(), 0);
        };
        await visit('/me/history');
        if (await page.getByRole('button', { name: 'Clear history', exact: true }).count())
          await clear();
        await visit('/posts/600004');
        for (const action of ['watch', 'like']) {
          const button = page.locator(`form[action="/posts/600004/${action}"] button`);
          assert.equal(await button.getAttribute('aria-pressed'), 'false');
          await button.click();
          await page
            .locator(`form[action="/posts/600004/${action}"] button[aria-pressed=true]`)
            .waitFor();
        }
        for (const [kind, action] of [
          ['watching', 'watch'],
          ['likes', 'like'],
        ]) {
          await page.getByRole('link', { name: 'Me', exact: true }).click();
          await page.locator(`main a[href="/me/${kind}"]`).last().click();
          assert.equal(
            await page.locator('.post-card').first().getAttribute('href'),
            '/posts/600004',
          );
          await page.locator('.post-card').first().click();
          await page.locator(`form[action="/posts/600004/${action}"] button`).click();
          await page
            .locator(`form[action="/posts/600004/${action}"] button[aria-pressed=false]`)
            .waitFor();
          await visit(`/me/${kind}`);
          assert.equal(await page.locator('.discover-my-list .post-card').count(), 0);
        }
        await visit('/me/history');
        assert.equal(
          await page.locator('.post-card').first().getAttribute('href'),
          '/posts/600004',
        );
        if (javaScriptEnabled) {
          await page.getByRole('button', { name: 'Clear history', exact: true }).click();
          await page.locator('dialog.confirm button.cancel').click();
          assert.equal(await page.locator('.post-card').count(), 1);
        }
        await clear();
        assert.equal(
          await page.getByRole('button', { name: 'Clear history', exact: true }).count(),
          0,
        );
        if (screenshotDir && javaScriptEnabled && width === 390)
          await page.screenshot({ path: `${screenshotDir}/me-history-cleared-390.png` });
        await visit('/posts/600004');
        await visit('/me/history');
        assert.equal(await page.locator('.post-card').count(), 1);
        assert.equal(await page.locator('.post-card').getAttribute('href'), '/posts/600004');
        results.push({
          width,
          javaScriptEnabled,
          workflow: 'watch/unwatch, like/unlike, clear/cancel/revisit via real forms',
        });
        await clear();
      } finally {
        await context.close();
      }
    }
  }
  return results;
};
