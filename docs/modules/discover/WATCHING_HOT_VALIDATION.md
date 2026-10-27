# Watching and Hot validation

26 Oct 2026. Feature issue [#22](https://github.com/Michael-wzl/CampusNote/issues/22), role [#2](https://github.com/Michael-wzl/CampusNote/issues/2). Based on main `3b9c6b7`; only Discover code and documentation change.

## Behavior

Watching orders watched, visible live posts by the newest non-deleted comment, falling back to the post time. Hidden comments count as activity (BR-11). Hot uses the exact BR-12 formula within the last seven days; deleted and hidden comments earn no points. Both break ties by higher post id and fetch 21 ids to display 20 shared cards, with `page` links. Existing chronological feeds retain `before` links.

All reads use `v_live_posts` and `VISIBLE`, then `byIds`; there are no application writes. This does not implement personal Watching (watch-time order), Search, or announcements.

## Checks

- Discover: 32 HTTP/MySQL tests pass, including all 26 CP1 tests and six new acceptance tests (DS-T06/07/08/19 and the CT-T22 watch/unwatch workflow).
- Whole application on native Windows/MySQL 8.4: 231 cases, 228 pass, zero failures and three existing cross-module TODOs. No shared tests were edited.
- New tests cover three-university seed rankings, hidden versus deleted comment activity, score changes from real likes/watches, eight-day-old popular posts, 25-post pagination, invalid/past-end pages, visibility and anonymity.
- Browser helper `modules/discover/tests/watching-hot-browser.js`: 160 Chromium layout/state cases pass. Five viewers (Mandy, Wing, Jason, Newbie, Admin), 320/390/768/1440 px, JavaScript on/off, both tabs and past-end empty states. Actual filter/card/back navigation, visible keyboard focus, 44 px targets, correct shell navigation and no document overflow.
- Phone/desktop screenshots were visually inspected. Screenshots for both tabs at 390/768/1440 px, plus Newbie's empty Watching page, are in `img/` and linked from USER_GUIDE.
- Native Chrome 200% page zoom: both normal tabs and both past-end states have no document overflow (709 CSS px, DPR 2), with real card/back navigation. Browser zoom was reset after testing.
- ESLint and whole-repository Prettier (`--end-of-line auto` for the Windows checkout) pass.
- After `load-test --posts 20000`: median HTTP All 14 ms, Watching 7 ms, Hot 25 ms; all smoke pages below 300 ms on this machine. Additional worst-window fixture moves all 20,000 new posts into the seven-day window: median `hotIds` query 63 ms over seven runs. These are local measurements, not production guarantees. Seed data was restored afterwards.

The shared integration TODOs are owned by the coordinator and remain untouched; the new module test exercises the real Content watch/unwatch routes and verifies Watching immediately adds/removes the card.
