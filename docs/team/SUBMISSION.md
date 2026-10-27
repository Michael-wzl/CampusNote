# Grading and submission checklist

**Updated 27 Oct 2026. All dates and times are Hong Kong time (HKT), 2026.** This is the shared reference for assessment, final deliverables and presentation preparation. Michael, working with the assistant, owns the code and repository through a verified source ZIP. Teammate review and presentation work starts after Michael declares the app/source baseline ready. The agreed feature scope and official deadlines are unchanged.

## 1. Deadline and files

- **Official deadline: Sat 21 Nov, 23:59 HKT, for all materials.** Our internal target is **Fri 20 Nov** so there is a day to fix upload problems.
- **Group 8 presentation: Mon 23 Nov, order 8.** The captured schedule does not give a clock time; Michael checks Moodle for the final arrangement.
- Submit **three separate files**:
  - `Group_8_code.zip`: source, README and database/data files.
  - `Group_8_slides.pptx`: presentation slides.
  - `Group_8_video.mp4`: demonstration video.

The announcement requires `Group_n_xx` naming; `.pptx` and `.mp4` are its example formats and the formats we plan to use. Slides and video are separate uploads, not substitutes for files inside the source ZIP. Michael checks the upload limits and verifies Moodle's submission acknowledgement.

Sources checked on 27 Oct: [TA submission announcement, 26 Oct](https://moodle.hku.hk/mod/forum/discuss.php?d=1068877), [submission activity](https://moodle.hku.hk/mod/assign/view.php?id=4336223), [assessment criteria](https://moodle.hku.hk/mod/resource/view.php?id=4336132), and [presentation schedule](https://moodle.hku.hk/mod/forum/discuss.php?d=1055862). The 23:59 time and Group 8 schedule are from the 27 Oct Moodle capture. Check Moodle again before submission for any staff updates. The previous 22 Nov submission target is superseded.

## 2. What earns marks

All members receive the same group mark. Reproducibility is worth **30 marks**; presentation is worth **70 marks**.

| Assessment item | Marks | What we must deliver |
|---|---|---|
| Complete source and required files | 10 | A tested source ZIP with everything needed to run the app and initialize its data. |
| README: installation and running | 10 | Instructions that work from the submitted ZIP, prerequisites, setup/run commands and a local URL. |
| README: database setup, configuration and initial data | 10 | Credentials/configuration, schema/triggers/seed reset, demo accounts and required static seed assets. |
| Functionality and design introduction | 10 | A short explanation of the app's users, core functions and design. |
| E-R diagram explanation | 10 | A readable diagram using the course's notation, with a clear explanation of key relationships. |
| Key SQL explanation | 15 | A few legible queries/transactions, why they work and their visible results. |
| Video: CRUD and database operations | 25 | Explicit Create, Read, Update and Delete actions plus database effects, not only navigation. |
| Organization, delivery, participation and timing | 10 | Every member speaks; the whole presentation is at most five minutes, including a video of at most two minutes. |

There is no separate rubric category for a native mobile app, public deployment or feature count. Finish the agreed core work, fix defects and prepare evidence; do not expand scope to chase presentation marks. Optional MS-8 block/unblock controls remain deferred.

## 3. Two phases and owners

**Phase A — settle the app and source. Michael owns this phase, with the assistant doing implementation and verification.** This includes every module's remaining agreed feature, fixes, technical guides/SQL notes, integration, README, clean rebuilds, CI and source packaging. Original module contributions remain credited; module/table boundaries still apply to the code. Teammates have no coding, repository maintenance, rebuild or packaging assignment during this phase.

The source-ready handoff requires the agreed app behavior to be implemented, tests/SQL/lint and browser acceptance to pass, a marker-ready README, and a source ZIP rebuilt from its actual extracted contents in a clean isolated environment. Record the tested commit, archive hash, runtime versions and results. Do not call the baseline or ZIP ready before those checks finish.

**Phase B — review and present the settled baseline.** Michael announces the exact source-ready commit/ZIP. All three teammates then review the code and README and send suggestions; Michael handles accepted code/documentation improvements and regenerates/rechecks the ZIP. Teammates also learn the relevant SQL and produce the presentation assets:

- **Catherine135:** record/edit the explicit CRUD/database video and voice-over.
- **hX1-dev:** assemble slides from the settled app, Chen diagram and technical SQL notes.
- **MKWang-2006:** coordinate rehearsal availability, speaking transitions, playback and backup checks.
- **Everyone:** review the code/README, suggest improvements, understand the selected SQL and speak in the presentation.
- **Michael:** retain ownership of code, repository, README, validation, source ZIP and final upload through submission.

A later teammate check on another laptop is useful review feedback, not a prerequisite assigned to MKWang-2006 for completing Phase A. Existing GitHub access is unchanged; send code/README suggestions to Michael rather than starting parallel implementation.

| By | Owner | Deliverable |
|---|---|---|
| Now | Michael + assistant | Finish the remaining agreed app work, including DS-3/DS-7 announcements; maintain the merged Must flows and prepare technical handoff notes. |
| Source-ready handoff | Michael | Publish the tested source commit/ZIP, validation evidence, README and a short review brief. Activate Phase B only at this point. This can happen ahead of the target dates below. |
| After handoff | All teammates | Review code/README and submit suggestions; begin slides, video and rehearsal preparation using that baseline. |
| 1 Nov | Michael | Preserve the early Must delivery and mandatory integration checks; evidence remains in [VALIDATION.md](VALIDATION.md). |
| 6 Nov | Michael + assistant | Latest target for agreed feature completion, current guides/SQL notes and Chen diagram draft. |
| 7–13 Nov | Michael + assistant | Complete integration, bug checks, README-only clean ZIP rebuild and any remaining fixes. Team feedback is folded in by Michael after handoff. |
| 13 Nov | Michael + assistant | Latest source-ready target: tested release candidate, marker README/Chen diagram and verified source ZIP. Do not delay an earlier successful handoff until this date. |
| 17 Nov | Catherine135, after handoff | Video ready for review, at most two minutes. |
| 18 Nov | Everyone; MKWang-2006 coordinates, Michael times | First timed rehearsal with draft slides/video, so corrections can enter submitted assets. |
| 19 Nov | hX1-dev + Catherine135; Michael reviews | Corrected final slides and video. |
| 20 Nov | Michael | Verify and submit all three named files; check acknowledgement. |
| 21 Nov, 23:59 | Michael | Hard deadline; buffer for submission problems, not planned feature work. |
| 22 Nov | Everyone; MKWang-2006 coordinates | Delivery/playback rehearsal using the submitted assets. |
| 23 Nov | Everyone | Group 8 presentation; every member speaks. |

The baseline must be ready early enough for Phase B. If its handoff is at risk, Michael reduces optional scope and raises the schedule issue promptly; the official deadline does not move. Keep optional MS-8 deferred. All feature, test and package completion claims require recorded evidence.

## 4. Source ZIP and reproducibility

Michael and the assistant assemble and verify the package. The root [README](../../README.md#run-locally) must stand on its own for a marker starting with the ZIP and an empty local database.

- [ ] Build from the accepted, tested source commit/ref. Record that commit and archive SHA-256; use a release-candidate ref while teammate suggestions are still possible.
- [ ] Include application source/templates/static assets, `package.json`, `package-lock.json`, `.env.example`, README and needed guides.
- [ ] Include `db/schema.sql`, `db/seed/core.sql`, `db/reset.js`, module database files including notification triggers, and required helpers. Seed images under `public/seed/` must be present.
- [ ] Exclude `.env`, real credentials, `node_modules/`, generated `uploads/`, private course/chat/AI working files and local-only reference screenshots.
- [ ] Extract the actual ZIP into a clean isolated directory. Follow only its README: install dependencies, create local configuration, initialize a separate MySQL database/data, start the app, log in with a demo account and run the demonstrated flows.
- [ ] Record OS, Node/MySQL versions, exact setup outcome and corrections. Pair the clean extraction check with CI; the current Windows job covers parser/reset paths, not a full app/database rebuild.
- [ ] After accepted review suggestions or any later source change, regenerate the ZIP and repeat affected checks. Never submit an older archive than the tested source.
- [ ] Announce the source-ready commit/ZIP for Phase B only after verification. The team can optionally repeat setup on another machine and send suggestions afterwards.

From a clean working tree, the coordinator creates the archive and matching manifest from the tested commit or candidate tag:

```bash
npm run package:source -- --ref HEAD --out ../Group_8_code.zip
```

The packaging command defaults to `HEAD` and `../Group_8_code.zip`; it refuses a dirty tree, tracked private/generated files, an output inside the repo or overwriting an existing archive. The matching `Group_8_code.zip.manifest.json` records source commit/tree, SHA-256 and included paths. Keep the source as a release candidate while team feedback may still change it; `v1.0` is not a prerequisite for the handoff.

The coordinator's packaging instructions identify the tested ref and output archive. An archive export alone does not certify completeness or remove mistakenly tracked private files. Inspect and rebuild from its actual output. Slides/video remain the separate named files above. A verified source candidate does not mean the later video, slides, rehearsal or Moodle upload is complete.

## 5. Presentation and video acceptance

- [ ] Everyone has a live speaking part. Video voice-over alone does not replace this.
- [ ] Target **4:40 total**, leaving 20 seconds below the five-minute limit: 25 s functionality/design, 45 s E-R, 80 s key SQL, 115 s video and 15 s close.
- [ ] Michael supplies technical SQL notes with the baseline; after handoff, every presenter studies and understands the selected examples. Select **2–3 readable SQL examples** for the live talk; use the other cards for preparation/Q&A rather than presenting four dense query slides.
- [ ] Explain the database reasoning and results: for example visibility/anonymity through views, notification triggers, alias allocation or booking transactions/locks/rollback.
- [ ] Use the finished Chen diagram, with readable keys, cardinality/participation and a distinctive relationship; keep the detailed schema available for questions.
- [ ] Video shows **C/R/U/D** with persistent effects. The revised [script](../product/PRODUCT_SPEC.md#9-demo-video-script-at-most-2-minutes) uses existing post creation/reading, event editing and ticket cancellation (`DELETE FROM tickets`, with inventory restored). No post-edit feature is needed.
- [ ] Show genuine database evidence, such as query/result overlays or an observed ticket/capacity change; do not substitute mock screens or stale race totals for the current recording.
- [ ] Keep the video at or below two minutes; target 1:55. Rehearse playback and all speaker transitions on 18 Nov, correct assets by 19 Nov, and keep local playable copies/backups.
- [ ] After upload, use the submitted assets in the 22 Nov rehearsal. Any necessary replacement before the deadline must be rechecked and acknowledged on Moodle; do not assume changes after the deadline are allowed.
