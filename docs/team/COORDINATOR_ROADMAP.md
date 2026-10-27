# Coordinator roadmap

**For Michael. Updated 27 Oct 2026.** Dates and times are 2026/HKT. [SUBMISSION.md](SUBMISSION.md) is the shared reference for the published rubric, three deliverables and final acceptance. Feature scope and the 1/6 Nov checkpoints stay unchanged; the final schedule below supersedes the old 22 Nov submission target.

## 1. Timeline

| Date | Milestone | Coordinator does | Members do |
|---|---|---|---|
| Fri 16 to Sun 18 Oct | **Design pack and decisions** | Read `docs/README.md`, then make the five calls in `team/DECISIONS.md`. Publish the team GitHub repo (§3). | Nothing yet (A2 and midterm). |
| Sat 17 to Tue 20 Oct | **Backbone** | Claude builds the backbone, identity and module skeletons (D2). Review and run it (§4). Merge it as the first commit on `main`. | A2 due Mon 19 Oct 23:59. |
| Wed 21 Oct | Midterm quiz | Evening: send the pre-read message (§5). | Midterm. Install Node 22+ and MySQL 8.4 if time allows. |
| **Thu 22 Oct** | **Kickoff (the only meeting, 60 min)** | Run the agenda in §6. Freeze the schema. | Confirm role claims, run the app, begin a real feature. |
| **Sun 25 Oct** | **CP1: walking skeleton** | Check every module's pages render with seed data and CI is green. | Read-only pages for your module. |
| Mon 26 Oct | Project tutorial (TA) | Attend. Note anything the TA expects that we do differently, and adjust the README or slides. | Attend. |
| **Sun 1 Nov** | **CP2: all Must features merged** | Check against each DEV_GUIDE's Must list. Re-scope anything at risk (§8). | Must features with tests. |
| **Fri 6 Nov** | **Module complete** | Check §7 of `WORK_DIVISION.md` for every module. | Should features, USER_GUIDE with screenshots, SQL card. |
| Sat 7 to Fri 13 Nov | **Integration week** | Run the runbook in §7. Tag `v1.0` on Fri 13 Nov. | Fix your bugs within a day; shared duties. |
| Tue 17 Nov | Video ready for review | Check explicit C/R/U/D and database effects against `PRODUCT_SPEC.md` §9. | Catherine135 delivers the video, at most two minutes. |
| **Wed 18 Nov** | **First timed rehearsal (30 min, online)** | Time the whole talk, including video, at 5:00 or less; target 4:40. Record corrections. | Everyone speaks; hX1-dev brings draft slides, Catherine135 the video. |
| Thu 19 Nov | Final slides and video | Review fixes, SQL explanations, Chen diagram and playback. | hX1-dev and Catherine135 finalize the files. |
| **Fri 20 Nov** | **Internal submission target: all three files** | Check final archive/files, upload and verify acknowledgement. | MKWang-2006 prepares `Group_8_code.zip`; slides/video are separate named uploads. |
| **Sat 21 Nov, 23:59** | **Official deadline: code ZIP, slides and video** | Keep this day as submission buffer; check Moodle for updates. | No planned feature work remains. |
| Sun 22 Nov | Delivery rehearsal (30 min, online) | Use the submitted assets; practise questions and offline playback. | Everyone speaks. This is after submission, not a preparation deadline. |
| **Mon 23 Nov** | **Group 8 presentation, order 8** | Confirm clock time on Moodle. | Everyone presents. |

The [26 Oct announcement](https://moodle.hku.hk/mod/forum/discuss.php?d=1068877) requires all materials by 21 Nov; the 27 Oct Moodle capture records 23:59 HKT and Group 8 on 23 Nov, order 8. Follow [SUBMISSION.md](SUBMISSION.md) for file naming, packaging and rubric weights. The 18 Nov SQL-injection lecture can inform explanations without adding features or delaying the rehearsal.

## 2. The weekly rhythm (asynchronous)

- **Sunday 21:00, status comment.** Each member comments on the pinned "Weekly status" issue in three lines: *Done* (feature IDs merged), *Next* (feature IDs this week), *Blocked* (anything, or "nothing").
- **Monday noon, coordinator reply.** One comment: what is on track, anything re-scoped, any contract change made.
- **Pull requests.** Module PRs merge when CI is green; the author merges (squash). PRs touching shared paths need the coordinator's review, which he gives within 24 hours.
- **Questions** go in the issue of the feature they block, with the `question` label, not in chat, so the answer is findable later. Chat (WhatsApp or WeChat) is for urgent things only.

## 3. Repository setup (21 Oct handoff)

The public repository is [Michael-wzl/CampusNote](https://github.com/Michael-wzl/CampusNote). The app and `docs/` are the repository root. `.github/` is installed and CODEOWNERS uses `@Michael-wzl`; no manual file copying or Student Developer Pack application is needed for kickoff.

The current handoff checklist is [COORDINATOR_TODO.md](COORDINATOR_TODO.md). All roles are claimed and all three members have write access. Teammates start at [START_HERE.md](../../START_HERE.md), follow their next DEV_GUIDE task and the shared [submission checklist](SUBMISSION.md). A Projects board and an issue for every feature are optional.

`main` is protected with pull requests, passing `ci`, code-owner review for shared paths, resolved conversations, and no force pushes/deletion. The owner retains the default admin override. Module-only PRs do not need a coordinator approval; changes to shared code do.

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

## 6. Kickoff agenda (Thu 22 Oct, 60 minutes)

| Min | Item | Outcome |
|---|---|---|
| 0 to 10 | Demo the running backbone: register, feed with seed data, dev login, mailbox | Everyone sees the target. |
| 10 to 20 | The rules: own folder, one writer per table, views, URL contracts, small PRs, Sunday status | `ARCHITECTURE.md` §1. |
| 20 to 30 | Confirm the recorded roles (Member 1 — Content: Catherine135; Member 2 — Discover: hX1-dev; Member 3 — Messages: MKWang-2006) and shared duties | Names recorded in the role issues and module READMEs. |
| 30 to 50 | Everyone gets the app running and opens a first feature branch; help whoever is stuck | Everyone can run the app and knows their first feature. |
| 50 to 60 | Dates (CP1, CP2, 6 Nov), how to ask questions, Q&A | Schema frozen from now on. |

## 7. Integration week runbook (Sat 7 to Fri 13 Nov)

| Day | Do |
|---|---|
| Sat 7 | Feature freeze: only bug-fix PRs from now. Run the real golden-path flows, including the three Discover-dependent checks; do not count TODOs as passes. Run `npm run load-test`; investigate regressions against the documented budget and known relevance-search exception. |
| Sun 8 | **Bug bash** (asynchronous, led by the Messages owner): each member spends an hour using two other modules with their USER_GUIDE, filing issues labelled `bug` with steps to reproduce. |
| Mon 9 to Wed 11 | Owners fix their bugs. Finalize the Chen E-R diagram (draft by 6 Nov) from `DATA_MODEL.md` §1 in `docs/data/er/`. Finish the marker README, including setup from the submitted ZIP, database/data initialization, personas and SQL locations. MKWang-2006 extracts a candidate ZIP and rebuilds on a second laptop using only its README; record results. |
| Thu 12 | Release candidate: fresh `db:reset`, full click-through as every persona, all tests and SQL checks green. |
| Fri 13 | Tag the accepted `v1.0`; export and verify `Group_8_code.zip` from that release using [SUBMISSION.md §4](SUBMISSION.md#4-source-zip-and-reproducibility). Include SQL/seeds/static assets; exclude credentials, dependencies, generated uploads and private files. Rebuild the package if a later tested release changes. |

## 8. Keeping scope under control

- At CP1, a module with no pages yet is the main warning sign. Talk to its owner the same day.
- At CP2, any unfinished **Must** feature: cut that module's **Could** features, then its **Should** features, then bring in the buddy (`WORK_DIVISION.md` §8).
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
| A member is late or silent | medium | CP1 makes it visible in week 1; buddy system; MoSCoW cut lines. |
| MySQL setup problems on a member's laptop | medium | README troubleshooting; the optional `docker compose up -d mysql` path in the root README; pair at kickoff. |
| Code nobody can explain (AI-generated) | medium | Every member understands their SQL card; the talk selects 2–3 readable examples and everyone rehearses the questions above. |
| Final assets or upload problems discovered too late | medium | Draft rehearsal 18 Nov, final assets 19 Nov, verified submission 20 Nov; 21 Nov is buffer before the hard deadline. |
| Anonymity or visibility leak | low | Shared views plus the privacy and visibility contract tests in CI. |
| Live demo fails | low | The video is pre-recorded; the app runs offline from a seed reset. |
| Late schema change | low | Schema frozen at kickoff; `contract-change` process. |
| Branch protection not configured | low | Same rules by convention; the coordinator watches merges. |
