# Grading and submission checklist

**Updated 27 Oct 2026. All dates and times are Hong Kong time (HKT), 2026.** This is the shared reference for assessment, final deliverables and presentation preparation. The feature checkpoints stay at **1 Nov** (Must) and **6 Nov** (module complete); the implementation scope is unchanged.

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

## 3. Owners and working dates

| By | Owner | Deliverable |
|---|---|---|
| Now | hX1-dev | Must features are merged. Finish DS-3/DS-7 announcements, the SQL card and slide outline for 6 Nov; maintain the completed flows. |
| Now | Catherine135 | Prepare the explicit CRUD/database video script using [PRODUCT_SPEC §9](../product/PRODUCT_SPEC.md#9-demo-video-script-at-most-2-minutes). |
| Now | Michael | Start the Chen E-R diagram and update the marker README. |
| Now | MKWang-2006 | Prepare the source-package checklist and arrange the second-laptop rebuild. |
| 1 Nov | Module owners; Michael reviews | Preserve the early merged Must delivery. The three Discover-dependent integration flows are now mandatory checks; current acceptance evidence is in [VALIDATION.md](VALIDATION.md). |
| 6 Nov | Every owner | Planned Should work, accurate USER_GUIDE/screenshots and module SQL card. Discover also supplies a slide outline, not final slides yet. |
| 6 Nov | Michael | Chen diagram draft; the developer crow's-foot diagram is not the presentation asset. |
| 7–13 Nov | Everyone | Feature freeze, cross-module tests, performance checks and defect fixes. |
| 8 Nov | MKWang-2006 leads | Bug bash: everyone tests two other modules. |
| 11 Nov | MKWang-2006; Michael fixes documentation | README-only rebuild of the extracted source ZIP on a second laptop, with OS/runtime and results recorded. |
| 13 Nov | Michael; MKWang-2006 packages | Tested `v1.0`, final README/Chen diagram and a verified source ZIP. |
| 17 Nov | Catherine135 | Video ready for review, at most two minutes. |
| 18 Nov | Everyone; Michael times | First timed rehearsal with draft slides and video, so fixes can enter the submitted files. |
| 19 Nov | hX1-dev + Catherine135; Michael reviews | Corrected final slides and video. |
| 20 Nov | Michael + MKWang-2006 | Verify and submit all three named files; check acknowledgement. |
| 21 Nov, 23:59 | Michael | Hard deadline; buffer for submission problems, not planned feature work. |
| 22 Nov | Everyone | Delivery/playback rehearsal using the submitted assets. |
| 23 Nov | Everyone | Group 8 presentation; every member speaks. |

Content, Messages and Discover's Must features are integrated. Discover's planned announcement features and presentation materials remain due 6 Nov; this is not full module/release completion. All owners can progress their shared duties now. Keep Sunday 21:00 status updates and small PRs; report blockers early. Any regression blocking a Must flow triggers the existing Could/Should cut and buddy process, not a later submission date.

## 4. Source ZIP and reproducibility

MKWang-2006 assembles the package; Michael reviews the release and submits it. The root [README](../../README.md#run-locally) must stand on its own for a marker starting with the ZIP and an empty local database.

- [ ] Build from the accepted, tested release commit/tag. Record the commit and archive SHA-256.
- [ ] Include application source/templates/static assets, `package.json`, `package-lock.json`, `.env.example`, README and needed guides.
- [ ] Include `db/schema.sql`, `db/seed/core.sql`, `db/reset.js`, module database files including notification triggers, and their required helpers. Seed images under `public/seed/` must be present.
- [ ] Exclude `.env`, real credentials, `node_modules/`, generated `uploads/`, private course/chat/AI working files and local-only reference screenshots.
- [ ] Extract the actual ZIP on a second laptop. Follow only its README: install prerequisites/dependencies, create local configuration, initialize MySQL/data, start the app, log in with a demo account and run the demonstrated flows.
- [ ] Record the OS, Node/MySQL versions, exact setup outcome and any README corrections. Prefer a Windows teammate laptop to complement Mac/Linux evidence. The existing Windows CI job covers reset paths, not a full app/database rebuild.
- [ ] After fixes or a later release change, rebuild the ZIP and repeat the affected validation. Do not submit an older archive than the tested source.

One way to export the tracked release source, from the repository root after accepting `v1.0`, is:

```bash
git archive --format=zip --prefix=CampusNote/ --output=../Group_8_code.zip v1.0
```

This command does not certify completeness or remove mistakenly tracked private files. Inspect and rebuild from its actual output. Keep slides/video as the separate named files above. The final ZIP, second-laptop rebuild, slides and video are pending until their owners record completion; this checklist is not completion evidence.

## 5. Presentation and video acceptance

- [ ] Everyone has a live speaking part. Video voice-over alone does not replace this.
- [ ] Target **4:40 total**, leaving 20 seconds below the five-minute limit: 25 s functionality/design, 45 s E-R, 80 s key SQL, 115 s video and 15 s close.
- [ ] Each owner prepares and understands their SQL card. Select **2–3 readable SQL examples** for the live talk; use the other cards for preparation/Q&A rather than presenting four dense query slides.
- [ ] Explain the database reasoning and results: for example visibility/anonymity through views, notification triggers, alias allocation or booking transactions/locks/rollback.
- [ ] Use the finished Chen diagram, with readable keys, cardinality/participation and a distinctive relationship; keep the detailed schema available for questions.
- [ ] Video shows **C/R/U/D** with persistent effects. The revised [script](../product/PRODUCT_SPEC.md#9-demo-video-script-at-most-2-minutes) uses existing post creation/reading, event editing and ticket cancellation (`DELETE FROM tickets`, with inventory restored). No post-edit feature is needed.
- [ ] Show genuine database evidence, such as query/result overlays or an observed ticket/capacity change; do not substitute mock screens or stale race totals for the current recording.
- [ ] Keep the video at or below two minutes; target 1:55. Rehearse playback and all speaker transitions on 18 Nov, correct assets by 19 Nov, and keep local playable copies/backups.
- [ ] After upload, use the submitted assets in the 22 Nov rehearsal. Any necessary replacement before the deadline must be rechecked and acknowledged on Moodle; do not assume changes after the deadline are allowed.
