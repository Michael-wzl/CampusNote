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

1. **Track Discover's planned Should work and handoff for 6 Nov.** Its Must features are already merged. hX1-dev still owns DS-3 announcement banners, DS-7 admin announcements, the SQL card and slide outline. Keep issue #2 open for that scope; do not mark the full module complete yet.
2. **Send [TEAM_MESSAGE.md](TEAM_MESSAGE.md)** and continue shared duties: Catherine135 on the explicit CRUD/database video, MKWang-2006 on the ZIP/rebuild checklist, hX1-dev on announcements and SQL/slide preparation. [SUBMISSION.md](SUBMISSION.md) is the shared reference; [weekly status is #4](https://github.com/Michael-wzl/CampusNote/issues/4).
3. **Read [CODE_WALKTHROUGH.md](CODE_WALKTHROUGH.md)** so you can explain the code you own. Automated review cannot replace your understanding for the presentation.
4. **Prepare the Chen E-R diagram and marker README:** draft diagram by 6 Nov, final diagram/README and tested release by 13 Nov. Include setup from the submitted ZIP; MKWang-2006 verifies the actual archive on a second laptop by 11 Nov.
5. **Arrange the 18 Nov draft rehearsal**, final slides/video on 19 Nov, and all-file submission on **20 Nov**. Official deadline: **21 Nov, 23:59 HKT**. Check upload limits and the clock time for Group 8's **23 Nov** presentation (order 8). The 22 Nov rehearsal uses the submitted files.

No manual copying of `.github` files, username replacement, team-email setup or private-repo subscription is needed. The authenticated CLI is used for publication; the GitHub connector's write-access issue does not block the handoff.

## Validation

Previous baseline, 25 Oct: **222 application tests passed, 0 failed; 3 TODOs awaited Discover integration.** ESLint/formatting and **456 SQL checks** passed. Earlier Events verification also passed a 200-buyer HTTP race: 50 booked, 150 sold out, no overselling.

27 Oct coordinator integration: **249 tests pass, 0 fail, 0 skipped, 0 TODO; 456 SQL checks pass.** Discover's Must pages are merged, and the three shared flows now run as mandatory tests rather than TODOs or environment-gated checks. See [VALIDATION.md](VALIDATION.md) for the full-suite/browser scope and limitations, and [GitHub Actions](https://github.com/Michael-wzl/CampusNote/actions) for CI. The Windows path assertion is portable and has a focused native Windows reset-path job; this is distinct from a full second-laptop rebuild.

## Later work

Review and merge teammate PRs while shared delivery work progresses. The rubric allocates 30 marks to reproducibility and 70 to presentation: clear C/R/U/D and database effects in the video, a readable Chen diagram, selected SQL explanations, and all four members speaking within five minutes including the video. Check off [SUBMISSION.md](SUBMISSION.md); final assets and archive validation remain pending until recorded.
