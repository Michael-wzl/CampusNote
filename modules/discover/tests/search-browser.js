/* global document, getComputedStyle */
const assert = require('node:assert/strict');

// Supply Playwright from the caller, keeping browser tooling outside application dependencies.
module.exports = async function checkSearch(browser, { baseURL, screenshotDir }) {
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
          for (const query of [
            '',
            '?q=book',
            '?q=saffron',
            '?q=a',
            '?q=' + encodeURIComponent('字'.repeat(100)),
          ]) {
            const path = '/search' + query;
            assert.equal((await page.goto(baseURL + path)).status(), 200);
            const layout = await page.evaluate(() => ({
              documentWidth: document.documentElement.scrollWidth,
              targets: [
                ...document.querySelectorAll(
                  '.discover-search input,.discover-search select,.discover-search button,.discover-search a',
                ),
              ].map((e) => e.getBoundingClientRect().height),
            }));
            assert.ok(layout.documentWidth <= width, `${width} ${path}: overflow`);
            assert.ok(
              layout.targets.every((h) => h >= 44),
              '44px controls',
            );
            assert.equal(await page.locator('.desktop-sidebar').isVisible(), width >= 1024);
            assert.equal(await page.locator('.tabbar').isVisible(), width < 1024);
            if (query === '?q=a')
              assert.equal(
                await page.locator('.empty p').textContent(),
                'Type at least 2 characters',
              );
            if (query === '?q=saffron')
              assert.equal(
                await page.locator('.empty p').textContent(),
                'No posts contain all of these words.',
              );
            if (
              screenshotDir &&
              javaScriptEnabled &&
              handle === 'mandy0hku' &&
              width !== 320 &&
              ['', '?q=book'].includes(query)
            )
              await page.screenshot({
                path: `${screenshotDir}/search-${query ? 'results' : 'empty'}-${width}.png`,
                fullPage: width === 1440,
              });
            if (
              screenshotDir &&
              javaScriptEnabled &&
              handle === 'mandy0hku' &&
              width === 390 &&
              ['?q=a', '?q=saffron'].includes(query)
            )
              await page.screenshot({
                path: `${screenshotDir}/search-${query === '?q=a' ? 'short' : 'no-results'}-390.png`,
              });
            results.push({ handle, width, javaScriptEnabled, path, ...layout });
          }
          // Real GET form, including progressive autosubmit and the JS-off submit button.
          await page.locator('[name=q]').fill('book');
          await page.getByRole('button', { name: 'Search', exact: true }).click();
          await page.locator('[name=sort]').selectOption('newest');
          if (!javaScriptEnabled)
            await page.getByRole('button', { name: 'Search', exact: true }).click();
          await page.waitForURL((url) => url.searchParams.get('sort') === 'newest');
          await page.locator('[name=topic]').selectOption('trade');
          if (!javaScriptEnabled)
            await page.getByRole('button', { name: 'Search', exact: true }).click();
          await page.waitForURL((url) => url.searchParams.get('topic') === 'trade');
          assert.equal(
            await page.locator('.post-card').count(),
            ['wing0cuhk', 'jason0ust'].includes(handle) ? 0 : 1,
          );
          await page.getByRole('link', { name: 'Clear search', exact: true }).click();
          assert.equal(await page.locator('[name=q]').inputValue(), '');
          await page.locator('.post-card').first().click();
          assert.match(new URL(page.url()).pathname, /^\/posts\/\d+$/);
          await page.goBack();
          await page.locator('[name=q]').focus();
          const focus = await page.evaluate(() => {
            const s = getComputedStyle(document.activeElement);
            return [s.outlineStyle, s.outlineWidth];
          });
          assert.notEqual(focus[0], 'none');
          assert.notEqual(focus[1], '0px');
        }
        assert.deepEqual(errors, []);
      } finally {
        await context.close();
      }
    }
  }
  return results;
};
