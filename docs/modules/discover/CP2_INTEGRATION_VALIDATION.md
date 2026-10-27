# Discover CP2 integration validation

26 Oct 2026. Owner hX1-dev, role [#2](https://github.com/Michael-wzl/CampusNote/issues/2). CP2 completes the Discover Must scope; announcements and presentation materials retain the later milestone.

## Delivery boundaries

| Feature | Delivery | Evidence |
| --- | --- | --- |
| DS-1 All/university/topic feeds | CP1 #14 | [CP1 record](CP1_INTEGRATION_VALIDATION.md) |
| DS-1 Watching and DS-2 Hot | #23, issue #22 | [Watching/Hot](WATCHING_HOT_VALIDATION.md) |
| DS-4 Search and discovery | #25, issue #24 | [Search](SEARCH_VALIDATION.md) |
| DS-5 My posts | CP1 #16, issue #15 | [My posts](MY_POSTS_VALIDATION.md) |
| DS-5 Watching/Liked/History | issue #26, final CP2 delivery | [Personal lists](PERSONAL_LISTS_VALIDATION.md) |
| DS-6 public student/organization pages | CP1 #18, issue #17 | [Public profiles](USER_PAGE_VALIDATION.md) |

All changes remain under `modules/discover/` and `docs/modules/discover/`. Schema, shared files, other owners' modules, names and dependencies are untouched. All new application queries are read-only named functions, use placeholders and shared live visibility, then hydrate shared cards by id. Content owns interaction/history writes; Events owns bookings. PRs use the personal fork, required CI and normal protected-main merge endpoints.

## Combined evidence

- Native Windows/MySQL 8.4 full regression with `CONTENT_STRICT_ACCEPTANCE=1`: 249 cases, 247 pass, zero failures, two existing shared TODO labels. Content's saved-post Watching check passes in strict mode; Identity's Me count-to-list assertions also pass under its unchanged TODO label. Standard CI retains three labels because strict mode is not set there.

- 50 Discover test cases (49 HTTP/MySQL cases and one Unicode/Boolean-query unit case) cover every Must acceptance item DS-T01–08, DS-T10–19 and DS-T26, plus CP1 public profiles. Numeric jumps, organization anonymity, comment activity versus Hot scoring, offset/keyset boundaries, cleared history and other-persona isolation are exercised through real routes.
- 600 new Chromium layout/state cases: Watching/Hot 160, Search 200, personal lists 240. Five personas, 320/390/768/1440 CSS px, JavaScript on/off, populated/empty/help states, long query text, focus, touch targets, actual navigation and no document overflow.
- 80 My posts layout regressions pass after its shared module template gains optional History controls.
- Four browser interaction workflows pass: watch/unwatch, like/unlike, clear/cancel/revisit at phone/desktop widths with JS on/off. A separate HTTP workflow covers Search → Events → booking → My tickets.
- Twelve native Chrome 200% zoom page/state checks pass across the three deliveries. This changes actual browser page zoom (709 CSS px at DPR 2); it is not a CSS transform or emulated device scale. Zoom reset afterwards.
- Full 20,000-post smoke timing passes the 300 ms local budget; detailed Hot/search measurements and known broad-word search cost are recorded per feature. The worst seven-day Hot query measured 63 ms with all 20,000 extra posts in the window.

## Shared integration tests

The Content suite already offers `CONTENT_STRICT_ACCEPTANCE=1`, which makes its saved-post → personal Watching → remove test mandatory. The final local full regression enables that mode. Identity's Me count-to-list test is also exercised, but its `todo` label lives in a coordinator-owned module. The shared Events golden-path placeholder is covered by Discover's executable Search/Events integration test. Those metadata labels are not edited from Discover.

## Reproduction

Run the README setup against separate development/test databases, then `npm test -- modules/discover`, `npm test`, `npm run lint` and `npm run check:sql`. For the extra existing strict integration check set `CONTENT_STRICT_ACCEPTANCE=1` before running tests. Browser helpers take an existing Playwright browser and `{ baseURL, screenshotDir }`; no browser dependency is added to the application. `personal-lists-workflows.js` writes only through real local application forms; use development seed personas and restore the development seed afterwards.

This proves the checked local Chromium/MySQL behavior and CI platform results. It does not claim physical-device or Safari/Firefox acceptance, nor announce the later Should features as complete.
