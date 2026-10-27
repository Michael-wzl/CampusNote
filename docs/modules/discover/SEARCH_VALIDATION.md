# Search validation

26 Oct 2026. Feature issue [#24](https://github.com/Michael-wzl/CampusNote/issues/24), role [#2](https://github.com/Michael-wzl/CampusNote/issues/2). Based on main `4f412d2` after Watching/Hot #23. Only Discover code and documentation change.

## Behavior

DS-4 uses the existing MySQL ngram full-text index, with each 2+ character word required, at most ten words and a 100-character query bound. Punctuation and Boolean operators become word boundaries. SQL values are placeholders; the two select/order alternatives are fixed strings. Relevance/newest and optional topics keep their state across 20-card offset pages. Visible post numbers redirect with 303; unavailable numbers use ordinary search without revealing existence.

Empty Search links to Campus events and lists at most ten named live organization posts visible to the viewer. Anonymous organization posts never appear in this section. Empty input, short/punctuation-only input, no matches, past-end pages and malformed parameters have distinct tested behavior. Both selects progressively autosubmit; an explicit GET Search button works without JavaScript.

## Checks

- Nine initial tests pass: Unicode/Boolean query unit test plus eight HTTP/MySQL acceptance tests covering DS-T10–14/19/26, exact seed orders, Chinese, apostrophes, required words, comments excluded, all post-number outcomes, organization anonymity/visibility, 25-post pagination, escaping and invalid inputs.
- Additional Search → Campus events → booking → My tickets integration test passes using real routes, forms and CSRF in a separate isolated test database; shared integration tests remain coordinator-owned.
- Whole-project native Windows/MySQL regression: 240 cases, 237 pass, zero failures, three existing cross-module TODOs, plus the additional integration test above. CI runs all 241 cases together.
- 200 Chromium layout/state cases pass: Mandy, Wing, Jason, Newbie and Admin, 320/390/768/1440 px, JavaScript on/off, five input/result states including a 100-character query. Real form submission, autosubmit/fallback button, sort/topic controls, Clear search, card/back navigation and keyboard focus checked; no document overflow, 44 px controls and correct shell navigation.
- Eight screenshots in `img/search-*`, linked from USER_GUIDE; phone empty Search and desktop results visually inspected.
- Native Chrome 200% page zoom passes for empty Search, results, short query and no matches (709 CSS px, DPR 2); result card/back navigation works. Zoom reset afterwards.
- ESLint and whole-tree Prettier pass (`--end-of-line auto` for Windows checkout).
- After 20,000 load-test posts: median HTTP empty Search 18 ms and `q=library` 74 ms; all smoke pages below 300 ms. Median direct query over seven runs: rare `textbook` 9.6 ms, common `library` relevance 62.7 ms, newest 60.3 ms. These measurements describe this local dataset/machine; broad-word worst cases from the DEV_GUIDE remain a known performance boundary. Seed restored afterwards.
