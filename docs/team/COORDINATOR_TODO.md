# Michael's short checklist

## Ready in the workspace

- [x] Desktop-first responsive shell, shared helpers and updated teammate guides.
- [x] Content ownership recorded for Catherine135; Discover for hX1-dev; Messages for MKWang-2006; all three have repository write access.

- [x] Neutral role options; ownership follows teammate claims.
- [x] `START_HERE.md`, module guides and a short teammate message.
- [x] CI, PR template and CODEOWNERS installed with `@Michael-wzl`.
- [x] One-command `.env` setup and an optional local MySQL container.
- [x] Code review of the backbone/identity and fixes for database-reset/load-test safeguards.
- [x] Contact page uses project issues; no team email placeholder to fill.
- [x] Events implementation, mobile screenshots, SQL card and its acceptance tests.
- [x] Discover's Must delivery merged through PRs #23/#25/#27; the saved-post Watching, Me count-to-list and Search-to-booking checks are mandatory in normal CI.
- [x] Three role-claim issues and a pinned weekly-status issue are created.
- [x] Project committed and pushed to the public `Michael-wzl/CampusNote` repo.
- [x] `main` requires PRs, passing `ci`, code-owner review for shared paths, and resolved conversations; force pushes and branch deletion are disabled. The repository owner retains GitHub’s default admin override.

## Your remaining actions

**Current owner: Michael, with the assistant, for every code/repository task through the verified source ZIP.** Teammates join after the source-ready handoff for review and presentation; the earlier module split remains contribution history.

1. **Agreed app implementation is complete:** DS-3/DS-7 announcements join the merged Must features. Technical guides, all module SQL notes and editable Chen views are included. Preserve the tested behavior; keep optional MS-8 deferred.
2. **Verify the app and actual ZIP:** run appropriate tests/SQL/lint/browser checks, finish the marker README, build the candidate archive and rebuild from its extracted contents in a clean isolated environment. Record commit/hash and evidence. No teammate is assigned this implementation/rebuild/packaging work.
3. **Use the prepared [Chen views](../data/er/README.md) and technical handoff**, and read [CODE_WALKTHROUGH.md](CODE_WALKTHROUGH.md) so you can explain the source. Source readiness can be handed off early once exact-ZIP rebuild and CI pass; 13 Nov remains the latest internal target.
4. **Declare source-ready, then activate the team:** send [TEAM_MESSAGE.md](TEAM_MESSAGE.md) and the exact baseline. Everyone reviews code/README with suggestions; Catherine135 prepares video, hX1-dev slides, MKWang-2006 rehearsal/playback coordination. Michael implements accepted changes and regenerates/rechecks the ZIP.
5. **Keep the official delivery dates:** review video 17 Nov, draft rehearsal 18 Nov, final slides/video 19 Nov, internal upload 20 Nov, hard deadline **21 Nov, 23:59 HKT**, delivery rehearsal 22 Nov and Group 8 presentation **23 Nov**, order 8. Check Moodle upload limits and the presentation clock time.

[SUBMISSION.md](SUBMISSION.md) defines the handoff gate and checklist. Existing GitHub access is unchanged; teammates send suggestions rather than beginning parallel implementation. No manual `.github` copying, username replacement or private-repo subscription is needed.

## Validation

Previous baseline, 25 Oct: **222 application tests passed, 0 failed; 3 TODOs awaited Discover integration.** ESLint/formatting and **456 SQL checks** passed. Earlier Events verification also passed a 200-buyer HTTP race: 50 booked, 150 sold out, no overselling.

27 Oct CP2 coordinator integration passed **249 tests with 0 fail/skip/TODO and 456 SQL checks**. The subsequent coordinator source baseline passes **275/275 with 0 fail/skip/TODO and 456 SQL checks**, including announcements and source-package regressions. See [VALIDATION.md](VALIDATION.md) for browser/source-export scope and limits, and [GitHub Actions](https://github.com/Michael-wzl/CampusNote/actions) for CI and clean-ZIP rebuild. Windows CI covers reset/package behavior, not a full Windows/MySQL application run.

## Later work

After source-ready, review teammate suggestions while presentation work progresses; Michael retains repository, source ZIP and accepted-fix ownership. The rubric allocates 30 marks to reproducibility and 70 to presentation: clear C/R/U/D and database effects in the video, a readable Chen diagram, selected SQL explanations, and all four members speaking within five minutes including the video. Check off [SUBMISSION.md](SUBMISSION.md); final assets and archive validation remain pending until recorded.
