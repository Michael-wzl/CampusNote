/* global document, getComputedStyle */
// Pass an existing Playwright browser; this adds no application dependency.
const assert = require('node:assert/strict');

module.exports = async function checkWatchingHot(browser, { baseURL, screenshotDir }) {
  const results = [];
  for (const javaScriptEnabled of [true, false]) {
    for (const handle of ['mandy0hku', 'wing0cuhk', 'jason0ust', 'newbie0hk', 'admin0000']) {
      const context = await browser.newContext({ javaScriptEnabled });
      try {
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(`${baseURL}/dev/login-as/${handle}`);
        for (const [width, height] of [
          [320, 720],
          [390, 844],
          [768, 1024],
          [1440, 900],
        ]) {
          await page.setViewportSize({ width, height });
          for (const tab of ['watching', 'hot']) {
            for (const suffix of ['', '&page=999']) {
              const path = `/feed?tab=${tab}${suffix}`;
              assert.equal((await page.goto(baseURL + path)).status(), 200);
              const layout = await page.evaluate(() => ({
                documentWidth: document.documentElement.scrollWidth,
                targets: [...document.querySelectorAll('.discover-feed a')].map(
                  (a) => a.getBoundingClientRect().height,
                ),
                active: document
                  .querySelector('.discover-feed [aria-current=page]')
                  .getAttribute('href'),
              }));
              assert.ok(layout.documentWidth <= width, `${width} ${path}: overflow`);
              assert.ok(
                layout.targets.every((h) => h >= 44),
                '44px targets',
              );
              assert.equal(layout.active, `/feed?tab=${tab}`);
              assert.equal(await page.locator('.desktop-sidebar').isVisible(), width >= 1024);
              assert.equal(await page.locator('.tabbar').isVisible(), width < 1024);
              if (
                suffix ||
                (tab === 'watching' && ['newbie0hk', 'jason0ust', 'admin0000'].includes(handle))
              )
                assert.equal(await page.locator('.discover-feed .post-card').count(), 0);
              if (
                screenshotDir &&
                javaScriptEnabled &&
                handle === 'mandy0hku' &&
                width !== 320 &&
                !suffix
              )
                await page.screenshot({
                  path: `${screenshotDir}/feed-${tab}-${width}.png`,
                  fullPage: width === 1440,
                });
              if (
                screenshotDir &&
                javaScriptEnabled &&
                handle === 'newbie0hk' &&
                width === 390 &&
                !suffix &&
                tab === 'watching'
              )
                await page.screenshot({ path: `${screenshotDir}/feed-watching-empty-390.png` });
              results.push({ handle, width, javaScriptEnabled, path, ...layout });
            }
          }
          // Use the actual filter and card links; native navigation also works without JS.
          await page.locator('.discover-feed a[href="/feed?tab=hot"]').click();
          assert.equal(await page.locator('#feed-heading').textContent(), 'Hot posts this week');
          await page.locator('.discover-feed .post-card').first().click();
          assert.match(new URL(page.url()).pathname, /^\/posts\/\d+$/);
          await page.goBack();
          await page.keyboard.press('Tab');
          const focus = await page.evaluate(() => {
            const style = getComputedStyle(document.activeElement);
            return { outline: style.outlineStyle, width: style.outlineWidth };
          });
          assert.notEqual(focus.outline, 'none');
          assert.notEqual(focus.width, '0px');
        }
        assert.deepEqual(errors, []);
      } finally {
        await context.close();
      }
    }
  }
  return results;
};
