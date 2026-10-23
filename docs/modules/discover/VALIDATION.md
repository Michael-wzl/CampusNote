# CP1 Feed validation — 23 Oct 2026

Scope: DS-1's All, university and seven topic tabs, keyset paging, empty states and shared post cards. Refs [Michael-wzl/CampusNote#2](https://github.com/Michael-wzl/CampusNote/issues/2). This delivery does not complete DS-1 or the whole CP1: Watching/Hot and the My posts/public user pages remain pending.

## HTTP and database checks

Node 24.19.0 and portable Oracle MySQL 8.4.13 on IPv4 loopback port 13378, with separate development, test and SQL scratch databases. No system database service or project dependency was changed.

- `npm test -- modules/discover`: **9 pass, 0 fail, 0 TODO**. Covers DS-T01's CP1 tab subset, DS-T02–DS-T05, and the built-tab portions of DS-T19/DS-T26.
- Exact seed order for all three universities and seven topics; anonymous authors remain unnamed; hidden/deleted posts stay absent. Newbie/Admin are included.
- 25-post pagination for All/university/topic filters; correct next cursor and no repeated cards; exactly 20 results have no next link. Invalid, repeated and out-of-range parameters fall back safely.
- Filter-specific empty states, the empty All page's compose link, and escaped stored text are asserted.
- Full application suite on Windows: **168 cases, 161 pass, 1 fail, 6 existing TODOs**. The sole failure is `test/core/reset.test.js`: it compares a slash-delimited trigger path against Windows `path.join` output. The same test fails on an untouched archive of baseline `995b84d`; no shared test or reset code was changed. The six TODOs still await the remaining Discover/Messages integration.
- SQL suite: **456 PASS**, ending `ALL SQL CHECKS PASSED`, including alias and booking races.
- Whole-tree ESLint passes. Prettier passes both with `--end-of-line auto` in the Windows checkout and with default settings on a separate LF source snapshot containing the Feed changes. The Windows checkout has CRLF in existing files, while the default check expects LF. No shared files were reformatted. The PR's standard Linux CI must confirm the committed tree.

## Browser checks

`modules/discover/tests/browser-checks.js` accepts an existing Playwright browser and `{ baseURL, screenshotDir }`; it adds no application dependency. Run it against a fresh development seed with the existing development login shortcuts enabled.

Chromium 151 on Windows: **160 page layout checks pass** (five personas × four viewport widths × JavaScript on/off × four Feed states). Viewports: 390×844, 768×1024, 1440×900 and 320×720. Personas: Mandy, Wing, Jason, Newbie and Admin.

Checks include document overflow, 44 px Feed tab targets, active tab, desktop versus compact navigation, topic empty state, real topic-link navigation with JavaScript disabled, visible keyboard focus and absence of page script errors. Browser checks do not change seed data.

- [Phone](img/feed-390.png)
- [Tablet](img/feed-768.png)
- [Desktop](img/feed-1440.png)

Screenshots were visually inspected. This is desktop Chromium with viewport emulation, not physical phone, Safari or Firefox evidence.

A separate no-JavaScript workflow published a maximum-length 750-character unbroken post through the real Content form. Feed wrapping passed at 320, 390, 720, 768 and 1440 CSS px. The 720 px check is a narrow-viewport check, not proof of 200% browser zoom; actual 200% zoom remains a manual verification item in the headless environment.

## Pending module acceptance

Watching, Hot, announcements, search, personal lists and user pages are outside this Feed PR. Full DS-T01 and DS-T19/DS-T26 across all future Discover pages are not claimed as passed. No TODOs in another owner's tests were removed. No load-test benchmark is claimed in this delivery.
