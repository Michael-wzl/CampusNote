# Personal lists validation

26 Oct 2026. Feature issue [#26](https://github.com/Michael-wzl/CampusNote/issues/26), role [#2](https://github.com/Michael-wzl/CampusNote/issues/2). Based on main `8adc1ae` after Watching/Hot #23 and Search #25; only Discover code/docs change.

## Behavior

DS-5's remaining Watching/Liked/History pages join only the current viewer's interactions to `v_live_posts`, apply `VISIBLE` and hydrate at most 20 shared cards. Watch/like time and last visit determine ordering, with post-id ties. Offset pages retain the destination. Cleared history stays out until a new visit; deleted, hidden and inaccessible posts stay out of every list.

The existing My posts route/note/keyset remain intact. Its template now optionally renders the Content-owned Clear history form (CSRF, `data-confirm`) only on non-empty History pages. No application table writes or cross-module imports were added; Content owns all watch/like/clear/view changes.

## Checks

- Eight HTTP/MySQL tests pass: DS-T15/16/18/19/26, exact seed orders, empty actions, interaction-time versus discussion-time order, real watch/like add/remove, clear/revisit with counts preserved and other users unaffected, 25-post paging, same-second ties, exact 20 boundary, malformed/past-end pages, privacy/visibility and Me count agreement.
- Full final combination with Content strict acceptance enabled: 249 cases, 247 pass, zero failures, two coordinator-owned TODO labels. The saved-post personal Watching test and Identity's count-to-list assertions now succeed without editing those modules.
- 240 Chromium layout/state cases pass: five personas, 320/390/768/1440 px, JS on/off, all three lists and past-end states. Correct shell/back navigation, Feed empty action, no document overflow, 44 px targets and visible keyboard focus.
- Four actual browser workflows pass at 390/1440 px with JS on/off: post → watch/like → Me lists → remove → History → clear → revisit. JS-enabled tests cancel the confirmation first, then confirm. Forms and flash/empty states work without JS.
- 80 original My posts browser layout regressions pass after the template change. Native 200% zoom passes all three lists and empty History, with real card/back navigation.
- Thirteen screenshots in `img/me-*` cover each list at 390/768/1440, each Newbie empty state, and History after clear. Phone History and desktop Liked were visually inspected; links are in USER_GUIDE.
- ESLint and whole-tree Prettier pass (`--end-of-line auto` for Windows checkout).
- Final 20,000-post load test: median HTTP My posts 15 ms, Watching 6 ms, Liked 8 ms, History 8 ms; every smoke page under 300 ms locally. Seed restored afterwards.

See [CP2_INTEGRATION_VALIDATION.md](CP2_INTEGRATION_VALIDATION.md) for the whole-project regression and remaining coordinator-owned TODO labels.
