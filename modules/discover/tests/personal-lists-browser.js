/* global document, getComputedStyle */
const assert = require('node:assert/strict');

module.exports = async function checkPersonalLists(browser, { baseURL, screenshotDir }) {
  const results = [];
  for (const javaScriptEnabled of [true, false]) {
    for (const handle of ['mandy0hku', 'wing0cuhk', 'jason0ust', 'newbie0hk', 'admin0000']) {
      const context = await browser.newContext({ javaScriptEnabled });
      try {
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));
        await page.goto(`${baseURL}/dev/login-as/${handle}`);
        for (const [width, height] of [
          [320, 720],
          [390, 844],
          [768, 1024],
          [1440, 900],
        ]) {
          await page.setViewportSize({ width, height });
          for (const kind of ['watching', 'likes', 'history']) {
            for (const suffix of ['', '?page=999']) {
              const path = `/me/${kind}${suffix}`;
              assert.equal((await page.goto(baseURL + path)).status(), 200);
              const layout = await page.evaluate(() => ({
                documentWidth: document.documentElement.scrollWidth,
                targets: [
                  ...document.querySelectorAll('.discover-my-list a,.discover-my-list button'),
                ].map((a) => a.getBoundingClientRect().height),
              }));
              assert.ok(layout.documentWidth <= width, `${width} ${path}: overflow`);
              assert.ok(
                layout.targets.every((h) => h >= 44),
                '44px targets',
              );
              assert.equal(await page.locator('.desktop-sidebar').isVisible(), width >= 1024);
              assert.equal(await page.locator('.tabbar').isVisible(), width < 1024);
              const count = await page.locator('.discover-my-list .post-card').count();
              assert.equal(
                await page.locator('form[action="/me/history/clear"]').count(),
                kind === 'history' && count > 0 ? 1 : 0,
              );
              if (suffix || handle === 'newbie0hk') assert.equal(count, 0);
              if (
                screenshotDir &&
                javaScriptEnabled &&
                handle === 'mandy0hku' &&
                width !== 320 &&
                !suffix
              )
                await page.screenshot({
                  path: `${screenshotDir}/me-${kind}-${width}.png`,
                  fullPage: width === 1440,
                });
              if (
                screenshotDir &&
                javaScriptEnabled &&
                handle === 'newbie0hk' &&
                width === 390 &&
                !suffix
              )
                await page.screenshot({ path: `${screenshotDir}/me-${kind}-empty-390.png` });
              results.push({ handle, width, javaScriptEnabled, path, ...layout });
            }
            await page.getByRole('link', { name: 'Browse the feed', exact: true }).click();
            assert.equal(new URL(page.url()).pathname, '/feed');
            await page.goBack();
            await page.getByRole('link', { name: 'Back', exact: true }).click();
            assert.equal(new URL(page.url()).pathname, '/me');
            await page.keyboard.press('Tab');
            const focus = await page.evaluate(() => {
              const s = getComputedStyle(document.activeElement);
              return [s.outlineStyle, s.outlineWidth];
            });
            assert.notEqual(focus[0], 'none');
            assert.notEqual(focus[1], '0px');
          }
        }
        assert.deepEqual(errors, []);
      } finally {
        await context.close();
      }
    }
  }
  return results;
};
