# Coordinator roadmap

**For Michael. Updated 27 Oct 2026.** Dates and times are 2026/HKT. [SUBMISSION.md](SUBMISSION.md) is the shared reference for the published rubric, three deliverables and final acceptance. Michael/assistant now own all code and repository work through a verified source ZIP. Team review and presentation work begins only after the source-ready handoff. Feature scope, latest technical targets and official deadlines stay unchanged; earlier verified completion is encouraged.

## 1. Timeline

| Date | Milestone | Coordinator does | Members do |
|---|---|---|---|
| Fri 16 to Sun 18 Oct | **Design pack and decisions** | Read `docs/README.md`, then make the five calls in `team/DECISIONS.md`. Publish the team GitHub repo (§3). | Nothing yet (A2 and midterm). |
| Sat 17 to Tue 20 Oct | **Backbone** | Claude builds the backbone, identity and module skeletons (D2). Review and run it (§4). Merge it as the first commit on `main`. | A2 due Mon 19 Oct 23:59. |
| Wed 21 Oct | Midterm quiz | Evening: send the pre-read message (§5). | Midterm. Install Node 22+ and MySQL 8.4 if time allows. |
| **Thu 22 Oct** | **Kickoff (the only meeting, 60 min)** | Run the agenda in §6. Freeze the schema. | Confirm role claims, run the app, begin a real feature. |
| **Sun 25 Oct** | **CP1: walking skeleton** | Check every module's pages render with seed data and CI is green. | Read-only pages for your module. |
| Mon 26 Oct | Project tutorial (TA) | Attend. Note anything the TA expects that we do differently, and adjust the README or slides. | Attend. |
| **Now: Phase A** | **Settle app and source** | Michael/assistant finish remaining agreed features, guides/SQL notes, tests, README, clean rebuild and ZIP. | No coding, rebuild or packaging assignment. Wait for the source-ready handoff. |
| **Source-ready gate** | **Activate Phase B** | Announce the tested commit/ZIP/hash and review brief after the actual archive rebuild passes. Handle accepted suggestions and regenerate the ZIP. | Review code/README with suggestions, learn SQL and begin slides/video/rehearsals. |
| **Sun 1 Nov** | Must checkpoint | Preserve the already merged Must flows and mandatory integration tests. | No new implementation task. |
| **Fri 6 Nov** | Latest agreed feature target | Finish planned Should work, technical guides/notes and Chen diagram draft. | Begin review/presentation only if source-ready has been declared. |
| Sat 7 to Fri 13 Nov | Latest integration/source-ready target | Complete acceptance, clean extracted-ZIP rebuild and any remaining fixes; publish the candidate baseline by 13 Nov at latest. | After handoff, send review suggestions and prepare presentation assets. |
| Tue 17 Nov | Video ready for review | Check explicit C/R/U/D/database evidence against the settled baseline. | Catherine135 delivers the video, at most two minutes. |
| **Wed 18 Nov** | **First timed rehearsal (30 min, online)** | Michael times the full talk including video; target 4:40. | MKWang-2006 coordinates; everyone speaks; hX1-dev brings slides, Catherine135 video. |
| Thu 19 Nov | Final slides/video | Review corrections, SQL, diagram and playback; handle any accepted source fixes. | hX1-dev and Catherine135 finalize assets. |
| **Fri 20 Nov** | **Internal all-file submission target** | Michael verifies final source ZIP, separate slides/video, uploads and checks acknowledgement. | Supply final presentation files; no source packaging assignment. |
| **Sat 21 Nov, 23:59** | **Official all-materials deadline** | Keep this day as upload/problem buffer; check Moodle updates. | No planned feature or asset work remains. |
| Sun 22 Nov | Delivery rehearsal (30 min, online) | Use the submitted assets; check timing/questions. | MKWang-2006 coordinates playback/backups; everyone speaks. |
| **Mon 23 Nov** | **Group 8 presentation, order 8** | Confirm clock time on Moodle. | Everyone presents. |

The [26 Oct announcement](https://moodle.hku.hk/mod/forum/discuss.php?d=1068877) requires all materials by 21 Nov; the 27 Oct Moodle capture records 23:59 HKT and Group 8 on 23 Nov, order 8. Follow [SUBMISSION.md](SUBMISSION.md) for file naming, packaging and rubric weights. The 18 Nov SQL-injection lecture can inform explanations without adding features or delaying the rehearsal.

## 2. The weekly rhythm and handoff

- **Sunday 21:00, status comment.** Michael reports Phase A implementation/verification progress. After source-ready, members report review/presentation work in the same Done / Next / Blocked format; they have no coding assignment before handoff.
- **Monday noon, coordinator reply.** One comment: what is on track, anything re-scoped, any contract change made.
- **Pull requests.** Michael reviews/merges all implementation and repository changes with passing CI and post-merge verification. Teammates send improvement suggestions after source-ready; Michael handles accepted code/README fixes and regenerates the source archive.
- **Questions** go in the issue of the feature they block, with the `question` label, not in chat, so the answer is findable later. Chat (WhatsApp or WeChat) is for urgent things only.

## 3. Repository setup (21 Oct handoff)

The public repository is [Michael-wzl/CampusNote](https://github.com/Michael-wzl/CampusNote). The app and `docs/` are the repository root. `.github/` is installed and CODEOWNERS uses `@Michael-wzl`; no manual file copying or Student Developer Pack application is needed for kickoff.

The current handoff checklist is [COORDINATOR_TODO.md](COORDINATOR_TODO.md). All roles are claimed and all three members have write access. Teammates start at [START_HERE.md](../../START_HERE.md) for the current phase; DEV_GUIDEs describe the code for later review, not new teammate implementation tasks. The shared [submission checklist](SUBMISSION.md) defines the source-ready handoff. A Projects board and an issue for every feature are optional.

`main` is protected with pull requests, passing `ci`, code-owner review for shared paths, resolved conversations, and no force pushes/deletion. The owner retains the default admin override. Existing GitHub permissions remain unchanged, but the current workflow gives Michael all implementation/repository ownership and merges.

## 4. Reviewing the backbone (about 4 to 6 hours)

Use this checklist for your own understanding of the code you own and will explain. [CODE_WALKTHROUGH.md](CODE_WALKTHROUGH.md) guides the reading; [VALIDATION.md](VALIDATION.md) records completed automated checks and remaining integration gaps.

- [ ] `npm install`, `npm run db:reset`, `npm run dev`; log in as each persona; click every tab.
- [ ] `npm test` and `npm run check:sql` pass locally; CI passes on GitHub.
- [ ] Read `core/` file by file against `ARCHITECTURE.md` §6. Every function there exists with that signature.
- [ ] Read `modules/identity/` (register, verify, login, Me page) as if you would present it.
- [ ] Try to break it: register with a non-university e-mail, a wrong code six times, an expired code, a POST without a CSRF token, `/posts/600008` as an HKU user.
- [ ] Check the merged modules' manifests, routes and guide links; distinguish implemented pages from Discover destinations that still await completion.

## 5. Teammate message

Use [TEAM_MESSAGE.md](TEAM_MESSAGE.md), which contains the repository link, current duties, new deadlines and the short starting path.

## 6. Original kickoff agenda (Thu 22 Oct, historical reference)

| Min | Item | Outcome |
|---|---|---|
| 0 to 10 | Demo the running backbone: register, feed with seed data, dev login, mailbox | Everyone sees the target. |
| 10 to 20 | The rules: own folder, one writer per table, views, URL contracts, small PRs, Sunday status | `ARCHITECTURE.md` §1. |
| 20 to 30 | Confirm the recorded roles (Member 1 — Content: Catherine135; Member 2 — Discover: hX1-dev; Member 3 — Messages: MKWang-2006) and shared duties | Names recorded in the role issues and module READMEs. |
| 30 to 50 | Everyone gets the app running and opens a first feature branch; help whoever is stuck | Everyone can run the app and knows their first feature. |
| 50 to 60 | Dates (CP1, CP2, 6 Nov), how to ask questions, Q&A | Schema frozen from now on. |

## 7. Source-readiness runbook (Michael + assistant)

This replaces the earlier member bug-bash/rebuild/packaging assignments. Run it when the agreed code is ready; 7–13 Nov remains the latest integration window, not a reason to wait.

| Step | Michael / assistant does |
|---|---|
| Finish and freeze | Complete agreed features; retain all mandatory cross-module tests. Keep optional MS-8 deferred and freeze feature additions. |
| Verify | Run focused/full tests as appropriate, SQL checks, lint, all-persona workflows, responsive/JS-off/privacy checks and the documented performance checks. Record actual evidence and limitations. |
| Prepare technical handoff | Finalize the marker README, technical SQL notes and Chen diagram. The README must explain setup from the submitted ZIP, database/data initialization, personas and SQL locations. |
| Package and rebuild | Export a candidate from the tested ref, record its manifest/hash and rebuild the actual extracted ZIP in a clean isolated environment using only its README. Pair this with CI. A teammate's second-laptop check can happen later as optional review feedback. |
| Declare source-ready | Publish the exact tested commit/ZIP/hash and review brief. Only now do teammates begin code/README review and presentation work. |
| Fold in review | Michael handles accepted suggestions, repeats affected checks and regenerates the archive. Use a release candidate until the reviewed source is accepted; do not require `v1.0` prematurely. |

Use [SUBMISSION.md §4](SUBMISSION.md#4-source-zip-and-reproducibility) for the archive checklist. Do not mark clean rebuild, final source or upload complete without its recorded result.

## 8. Keeping scope under control

- Michael owns technical blockers in Phase A; report them promptly and reduce optional scope before risking the handoff or official deadline. Do not assign unfinished code back to teammates by default.
- Preserve the completed Must flows. Teammates review the settled baseline after handoff; Michael handles accepted improvements.
- Do not add unplanned features after CP2; finish only the agreed Should work by 6 Nov. Freeze features on 7 Nov. Keep optional MS-8 deferred. The rubric rewards reproducibility and presentation, not feature count.
- Contract changes after kickoff: allowed only for bugs or blockers, and always through a `contract-change` issue that you resolve within a day.

## 9. Questions to prepare for

- Why is `tickets_left` stored when derived attributes should not be? (`DATA_MODEL.md` §7.1)
- What happens if two people book the last ticket at the same moment? (the race test; show the numbers)
- How is anonymity guaranteed? (the views plus the privacy contract test)
- How do you stop SQL injection? (placeholders everywhere; one slide comparing a concatenated query)
- Why is `reports.target_id` not a foreign key? (§7.3)
- How did you use AI tools, and can each member explain their SQL? (everyone prepares their card; choose 2–3 readable examples for the live talk)

## 10. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Source-ready handoff slips | medium | Michael owns implementation and verification; cut optional scope early and protect time for the team's review/presentation phase. |
| Setup problems after handoff | medium | Assistant verifies clean ZIP setup and README first; teammates can send additional environment feedback during review. |
| Code nobody can explain (AI-generated) | medium | Every member understands their SQL card; the talk selects 2–3 readable examples and everyone rehearses the questions above. |
| Final assets or upload problems discovered too late | medium | Draft rehearsal 18 Nov, final assets 19 Nov, verified submission 20 Nov; 21 Nov is buffer before the hard deadline. |
| Anonymity or visibility leak | low | Shared views plus the privacy and visibility contract tests in CI. |
| Live demo fails | low | The video is pre-recorded; the app runs offline from a seed reset. |
| Late schema change | low | Schema frozen at kickoff; `contract-change` process. |
| Branch protection not configured | low | Same rules by convention; the coordinator watches merges. |
