# Validation and source readiness

## Current source status — 27 Oct 2026

The agreed app features are implemented. Follow-up fixes from App Tester's independent review clarify both audience-switch states, give anonymous conversations distinct chat references, keep Events in compact navigation, remove the repeated Feed title, name Watching/Hot filters and make the local-demo login shortcuts collapsible. The README now leads with the marker's ZIP setup path. These are usability/documentation improvements; anonymity, module/table boundaries and the schema are preserved.

Fresh coordinator verification of these fixes passes **277/277 application tests, zero fail/skip/TODO, all 456 SQL checks and lint/format/diff checks** on Node 24.9.0 / isolated MySQL 8.4.13. New regressions cover distinct anonymous Visitors without identity leaks or public alias allocation, non-member denial, and complete/active compact navigation. Shared-shell Chrome checks cover 320/390/768/1023/1024/1440 px with JavaScript on/off; actual-app checks include normal password login, keyboard disclosure/navigation, both audience states and readable filters/titles. This is viewport emulation, not physical-phone or other-engine coverage.

The preceding accepted candidate [`da536e1`](https://github.com/Michael-wzl/CampusNote/commit/da536e10811870284a3d50c95b753bd70834cb74), from [PR #29](https://github.com/Michael-wzl/CampusNote/pull/29), passed [main CI](https://github.com/Michael-wzl/CampusNote/actions/runs/40471714248), an actual ZIP rebuild and the `npm start` entrypoint smoke. App Tester independently reproduced its setup, 275 tests and 456 SQL checks on Debian 13 / Node 22.20.0 / MySQL 8.4.2. The review's approximate 29/30 materials score is one reviewer's opinion, not an official mark. Slides, video and live delivery remain unassessed.

Each replacement handoff ZIP requires the current revision's [CI](https://github.com/Michael-wzl/CampusNote/actions) and a fresh rebuild from its actual extracted contents. The matching manifest identifies its exact source commit/tree and archive SHA-256; the coordinator's handoff record identifies the rebuild result. Native Windows CI covers **11 reset/package cases**, not a full Windows/MySQL app run. Michael/assistant handle source changes and packaging; teammates review the app/code/README and prepare presentation materials. Optional MS-8 and other Could features remain deferred.

**Read the dated sections below as an audit trail.** Earlier TODO counts, incomplete-module statements and teammate coding assignments describe those earlier revisions. They do not describe the implemented source above. See [SUBMISSION.md](SUBMISSION.md) for current responsibilities and remaining presentation/submission work.

## Historical handoff record — 21 Oct 2026

## Fresh local checks

- Node 24.9.0 and isolated Oracle MySQL 8.4.13, on loopback port 13378 with dedicated development/test/scratch databases.
- `npm ci` from the lockfile; `npm run lint`: pass.
- Full `npm test`: **119 total, 112 pass, 0 fail, 7 TODO**.
- SQL suite: **456 PASS lines**, ending `ALL SQL CHECKS PASSED`. Includes 120 buyers / 50 tickets and comment-alias races.
- Events: **23 tests pass**, including dates, malformed bodies, upload cleanup, authorization and concurrent booking. Its 200-buyer HTTP demo repeatedly returned 50 booked, 150 sold out and no overselling. See [events validation](../modules/events/VALIDATION.md) for mobile screenshots and JavaScript-disabled checks.
- Public export excludes `.env`, uploaded files, dependencies, original-app reference screenshots and all course/history/AI working files. A targeted staged-file scan found no private keys or credential token patterns.
- `.env` setup preserves existing files and generates a random session secret for a new file.

## Scope and limitations

The seven TODO tests are the two cross-module identity/list/history checks and five end-to-end steps awaiting Content, Discover and Messages. They are visible in test output; they are not completed features. The three modules intentionally remain for the teammates to implement.

One earlier full run intermittently returned 404 instead of the upload rejection handler's 200 for an oversized image. One hundred isolated pre-fix repetitions did not reproduce it, so its exact root cause is unconfirmed. The upload wrapper now accepts only one completion callback per request, with a regression for a late callback after size refusal. The subsequent full suite passes; this is a safeguard, not proof that the earlier failure's cause was established.

The optional Docker Compose setup was syntax/formatted-checked but not started on this Mac, where Docker is unavailable. Application and SQL validation used a real isolated MySQL server. GitHub CI runs the pinned project with Node 22 and a MySQL 8.4 service; check its latest result in [Actions](https://github.com/Michael-wzl/CampusNote/actions).

No live deployment or real email service is configured. Local signup/reset codes use the development mailbox. Test databases and the demo race must remain separate from any real data.

## Responsive update

The desktop-first shared shell and module examples were checked at 390, 768 and 1440 px, with additional 320, 767, 1023, 1024 and 1920 px edge checks and short desktop windows. Browser checks cover real login/settings saves, normal and empty pages, 44 px navigation targets, visible keyboard focus/skip link, grid/navigation breakpoints, and JavaScript-disabled forms. The shared layout uses CSS viewport rules, without device detection or duplicate routes. Representative screenshots are in [RESPONSIVE.md](../architecture/RESPONSIVE.md#reference-views).

Fresh full application suite after this update: **122 total, 115 pass, 0 fail, 7 TODO**. The TODOs still belong to the teammate modules. Lint/format pass. SQL and database behavior are unchanged; remote CI runs the SQL suite on the new commit.

Browser evidence includes 105 page visits, 94 edge checks and a long-content component fixture; it used Chromium emulation. Physical phones, Safari and Firefox have not been tested. Local evidence is retained in the course workspace’s AI working folder rather than the public repo.

## Content integration review — 22 Oct 2026

The coordinator reviewed the combined Content PRs #6–#11 against current main. Content publishing/images, detail/comments, likes/watches, history writes and image viewer are implemented. Discover lists and Messages screens still need their owners. D23 resolves issue #5: own-account sidebar identity is allowed, while post/participant identities remain anonymous. The shared privacy test now checks the viewer's own identity in anonymous content too.

Coordinator checks: **154 application cases: 148 pass, 0 fail, 6 TODO**; lint/format pass; **456 SQL checks pass**. The six TODOs are one Content Watching destination check, one Identity count-to-list check, and four cross-module demo stages requiring Discover/Messages. Two formerly pending checks now run: Identity clear-history count and real multipart image publishing through the demo path.

Installed Chrome browser QA passed 130 layout checks across four personas, 320/390/768/1440 px and JavaScript on/off, plus publishing/comment/reply/like/watch/deletion workflows, viewer keyboard/focus/scroll/error fallback and simulated touch swipe. Desktop and phone screenshots were visually checked. This coordinator run used Chromium; physical phones, Firefox and installed Safari were not run. The member's earlier engine/zoom evidence is recorded in [Content validation](../modules/content/VALIDATION.md).

One intermediate local full run failed during Events race setup because a fresh login response lacked the expected CSRF meta tag. The original log did not identify the HTTP status; no SQL/session error was logged. Twenty-six isolated Events race runs (780 buyer logins/bookings) did not reproduce it. The final full application run passed all 148 enabled cases. Safe response-status/type/path diagnostics were added to the test helper, without retries or changes to application authentication. The cause remains unconfirmed; a passing rerun does not establish a fix.

## Login-test transport investigation and fix — 22 Oct 2026

The earlier post-merge CI run [39713097806](https://github.com/Michael-wzl/CampusNote/actions/runs/39713097806) passed. Further investigation reproduced the missing-CSRF symptom without Campus Notes or MySQL: a synthetic Express login app returned a foreign HTTP 401 JSON response, without its app marker, and the request never entered its handler.

The installed SuperTest 7.3.0 automatic-server path calls `listen(0)` on the IPv6 wildcard `::`, then constructs a `127.0.0.1` URL. On this Mac, an IPv6 listener and an unrelated IPv4 listener can own the same port. The client therefore sometimes contacted the other process. The controlled fixture demonstrated the same port reaching two different apps depending on its address family. The original failure log had no response trace, but this reproduction establishes a concrete cause of the same intermittent missing-token failure.

A synthetic comparison attempted 4,108 automatic-lifecycle agents: two foreign responses and three transport/parser errors. Explicit IPv4 binding then completed 20,000 redirect/login pairs with zero anomalies or errors. This evidence isolates transport routing; it does not justify weakening authentication or retrying failed assertions.

`test/http-server.js` now awaits an explicit `127.0.0.1` listener. Shared test agents use one stable server per test file, with independent cookie jars, and close it before the database pool. App creation remains lazy so file-local upload/config fixtures still apply. Render/upload tests and the developer load-test client use the same helper. Production routing, login, session storage, CSRF checks and dependencies are unchanged.

Five DB-free regressions cover the request address family, independent cookies, concurrent requests to separate apps, occupied IPv4-port refusal, and an IPv4/IPv6 same-port collision. An in-memory mutation to the unsafe address family makes the relevant regressions fail. The normal fixed tests pass. The optional collision fixture skips if IPv6 is unavailable or another IPv6 listener already owns the chosen fixture port. Only native fixture setup may skip; helper bindings, HTTP requests and assertions never do. The ordinary IPv4 and cookie/concurrency checks always run.

Final local verification: **159 cases, 153 pass, 0 fail, 0 skip, 6 TODO**; lint/format pass; **456 SQL checks pass** concurrently with the application suite; the load-test client’s seeded `--pages` smoke check passes. The six TODOs still belong to unfinished Discover/Messages integration. Original traces, the synthetic comparison, regression results and fixed-suite logs are retained in the local course workspace’s `AI_work/gp/validation/2026-10-22-login-investigation/`.

## Messages integration — 25 Oct 2026

PR #19 delivers MS-1–MS-7 without shared schema, dependency, authentication or trigger changes. Coordinator review checks public/anonymous context separation, membership, visible targets, escaped templates, snapshot read state, transactions and moderation audit retention. MS-8 controls remain optional and outside this delivery.

The shared demo now executes three formerly empty TODOs: Content comment → badge/notification → Host reply; Message-the-host → Visitor/Host conversation → non-member denial; and report → admin hide → list/detail exclusion → restore with retained report audit. Final local suite: **225 cases, 222 pass, 0 fail, 0 skipped, 3 TODO**. All **456 SQL checks** pass; ESLint/Prettier pass. The remaining TODOs are Discover Watching, Identity counts versus Discover lists, and Search-to-event-booking. They are not counted as completed integration.

The pre-existing Windows trigger-path assertion now uses `path.join` for the module path while retaining schema/seed order checks. A focused `Windows reset-path checks` CI job runs the three SQL-parser/reset-file-order tests on Windows with Node 22 and no MySQL service. This validates the reported portability issue; it is not a full Windows application/database run. See the relevant PR/Actions results for the native result.

Phone keyboard verification found a shared compact-layout issue: native focus could leave Content’s “Message the host” link below the fixed bottom navigation. Normal wheel scrolling recovered it, but Tab focus was obscured. Compact `html` scroll padding now reserves the tab bar height, spacing and safe-area inset. This changes scrolling behavior rather than page layout; the browser check verifies native focus and unforced links with the actual stylesheet.

Independent installed-Chrome browser review passes **82 layout checks** (78 normal plus four error/long-text states), **two complete native workflows** with JavaScript enabled and actual context JavaScript disabled, and **six real-stylesheet keyboard/link checks** at 390/768/1440 px. Public and anonymous sends/replies remain separate; non-member/admin denials work; report/hide/restore propagates across Feed, My posts, public profiles and detail pages. Phone keyboard focus and unforced clicks clear the fixed navigation after the scroll-padding fix. Screenshots were visually checked. These checks use Chromium, not physical phones or other browser engines. Local evidence is retained under `AI_work/gp/validation/2026-10-25-messages-review/`.

## Discover CP2 coordinator acceptance — 27 Oct 2026

Delivery baseline: main `cb71bd7`, containing merged PRs [#23](https://github.com/Michael-wzl/CampusNote/pull/23) (Watching/Hot), [#25](https://github.com/Michael-wzl/CampusNote/pull/25) (Search) and [#27](https://github.com/Michael-wzl/CampusNote/pull/27) (Watching/Liked/History). The delivery's [main CI](https://github.com/Michael-wzl/CampusNote/actions/runs/40455480012) passed. Read-only coordinator review checked visibility/anonymity, placeholder SQL values, fixed sort choices, ranking/activity rules, pagination, history clearing and escaped templates; it found no actionable production-code bug in this scope.

The three remaining shared checks now block ordinary CI on failure: Content saved-post → Watching → removal no longer depends on `CONTENT_STRICT_ACCEPTANCE`; Identity's Me count/list check verifies the expected stat links and has no TODO label; the formerly empty booking stage follows actual Search → Campus events → Film night → booking → Me → My tickets links/forms and verifies the stored ticket/code and reduced inventory. No production application, schema or dependency change was needed.

Fresh coordinator verification used Node 24.9.0 and isolated Oracle MySQL 8.4.13 on loopback port 13378, with separate browser-development, application-test and SQL-scratch databases. The focused shared/Identity/golden-path selection passes **19/19**. The full suite passes **249/249, 0 fail, 0 skipped, 0 TODO**. All **456 SQL checks** pass, including alias and booking races. ESLint/Prettier and `git diff --check` pass.

Independent installed-Chrome acceptance passes **198 layout/search/privacy cases** across three personas, 390/768/1440 px and actual JavaScript on/off; **four complete native form workflows** at phone/desktop widths with JavaScript on/off; and **24 native Tab-focus visibility checks**. Coverage includes English/Chinese search, visible/inaccessible post-number jumps, hidden/deleted exclusions, watch/unwatch, like/unlike, history cancel/clear/revisit and Search → Events → booking → My tickets → cancellation with capacity restored. Controls meet 44 px checks and documents do not overflow horizontally. Screenshots are retained with the local evidence. An initial QA selector matched both hidden and open confirmation dialogs; narrowing the harness to the open dialog allowed the full workflow rerun. The application needed no browser fix.

This is CP2 Must acceptance, not full Discover, release or submission completion. DS-3 announcement banners, DS-7 admin announcements, Discover's SQL card and slide outline remain due 6 Nov; team video, Chen diagram and exact-ZIP second-laptop rebuild retain [their owners and dates](SUBMISSION.md). This coordinator run used Chrome, not physical phones, Safari or Firefox. The delivery owner separately records native Windows/MySQL evidence; the repository's Windows CI still covers only parser/reset paths. Local logs, browser scripts/results and screenshots are in the course workspace's `AI_work/gp/validation/2026-10-27-discover-review/`. Check the coordinator PR and subsequent main Actions run for remote results on this test update.

## Coordinator source baseline — 27 Oct 2026

This section supersedes the outstanding implementation assignments in the dated CP2 record. Michael/assistant now own all code, README, verification and source packaging; teammates join after the source-ready handoff for review and presentation. Original contributors remain credited. The agreed app scope is implemented, including DS-3 scheduled first-All-page banners and DS-7 admin announcement CRUD. Optional MS-8 controls and other Could ideas remain outside this baseline.

Announcement changes preserve the schema, module table writers and shared contracts. Focused coverage includes role/CSRF checks, escaped fields, safe internal links, HKT date validation and round trips, state/order/page restrictions, stale edits, concurrent image changes and failure cleanup. Independent code review found no further actionable issue in this scope. See [announcement validation](../modules/discover/ANNOUNCEMENTS_VALIDATION.md).

Fresh Node 24.9.0 / isolated Oracle MySQL 8.4.13 verification: **275 tests pass, 0 fail, 0 skipped, 0 TODO**, including 18 announcement regressions and eight source-package checks. All **456 SQL checks** pass. Full lint, formatting and diff checks pass. Browser development, application tests, module-agent tests and SQL checks use separate disposable databases; normal local/user databases are untouched.

The clean ZIP install exposed three dependency advisories. Existing packages are patched to multer 2.5.0 and nodemailer 10.1.4, and the lockfile resolves body-parser 2.4.0 within Express's compatible range. These address the upstream [body-parser](https://github.com/expressjs/body-parser/security/advisories/GHSA-27r3-jxmh-p828), [multer](https://github.com/expressjs/multer/security/advisories/GHSA-q7qp-rjg7-q26m) and [Nodemailer](https://github.com/nodemailer/nodemailer/security/advisories/GHSA-8c8m-p3m8-cjg8) advisory families without adding dependencies. The 27 Oct audit reports zero vulnerabilities; this is a dated registry result, not a claim of complete security assurance. The full suite and exported-source rebuild are repeated with the patched lockfile before handoff.

Independent installed-Chrome QA passes **36 announcement layout/role/banner cases** at 390/768/1440 px with JavaScript on/off, **two complete native admin CRUD/upload workflows** at phone/desktop sizes, **12 native Tab-focus checks**, and a **phone JavaScript-off Search → booking → My tickets → cancellation regression**. It verifies invalid-input draft retention, HKT form round trips in a UTC browser, scheduling/expiry, ordering, real image upload/removal/replacement/deletion and asset cleanup. Representative phone/desktop screenshots were visually inspected. No application defect was found in this browser run; physical phones and other engines were not repeated.

The [editable Chen views](../data/er/README.md) and all module SQL notes are included as technical handoff material. The diagrams select conceptual views with documented scope; they are not an unqualified complete table inventory or a substitute for the team's later explanation. SVG XML and PNG previews were checked.

`npm run package:source` pins a commit/tree, refuses dirty source, tracked private/generated paths, missing inputs, in-repo outputs and overwrites, then checks every ZIP path and decompressed file's Git blob hash. A regression catches `export-subst` changing file contents despite unchanged filenames; another prevents a directory alias bypassing the output boundary. The manifest records the actual archive SHA-256 and file list. These unit checks establish export behavior; the exported app must still be rebuilt and smoke-tested.

CI now runs Windows reset plus package tests, and the Linux job exports the checked commit, extracts the actual ZIP, installs from its lockfile, creates fresh local configuration/database data and performs a real-password login/navigation smoke using explicit IPv4 HTTP helpers. This is broader than the older reset-only Windows check, but still not a full Windows/MySQL application run. Final source-ready acceptance also requires the actual handoff ZIP's isolated rebuild; the provided ZIP manifest/local handoff record and the corresponding main Actions run identify its exact commit/hash and results. Do not infer final slides/video or course submission completion from source readiness.

The initial native Windows package run caught a root-path alias comparison failure before all eight package cases could execute. Native `path.relative` alone did not resolve it. The packager now canonicalizes the repository root, Git root and output directory consistently with `fs.realpathSync.native` before comparing paths, covering Windows short-name/long-name aliases as well as drive/case spelling. A nested-root negative and the in-repo/junction output checks preserve the boundaries. The corrected [native Windows run](https://github.com/Michael-wzl/CampusNote/actions/runs/40470681491/job/122076788779) passes all 11 reset/package cases; this remains filesystem/parser coverage rather than a full Windows/MySQL application test.

Local logs, browser scripts/results and screenshots are retained in `AI_work/gp/validation/2026-10-27-source-baseline/`. The official deadline and Phase B responsibilities are unchanged in [SUBMISSION.md](SUBMISSION.md). A later accepted code/README change requires a new verified ZIP and manifest.
