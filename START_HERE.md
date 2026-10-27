# Start here

Repository: **[Michael-wzl/CampusNote](https://github.com/Michael-wzl/CampusNote)**.

Campus Notes is our COMP3278 anonymous campus forum. The shared app, database, demo data, login/profile, events, Content and Messages MS-1–MS-7 are built. Discover's Must features are merged, including Watching/Hot, Search and all four personal lists. Its announcement banners/admin announcements, SQL card and slide outline remain for 6 Nov. Michael owns shared code, identity, events and integration.

## 1. Roles and repository access

| Role | Owner | What you build | Detailed guide |
|---|---|---|---|
| **Member 1 — Content** | **[Catherine135](https://github.com/Catherine135)** — claimed | Posts/images, comments, likes, watches and history | [Content DEV_GUIDE](docs/modules/content/DEV_GUIDE.md) |
| **Member 2 — Discover** | **[hX1-dev](https://github.com/hX1-dev)** — claimed | Feeds, ranking, search, personal lists, user pages and announcements | [Discover DEV_GUIDE](docs/modules/discover/DEV_GUIDE.md) |
| **Member 3 — Messages** | **[MKWang-2006](https://github.com/MKWang-2006)** — claimed | Notifications, private messages, reports and moderation | [Messages DEV_GUIDE](docs/modules/messages/DEV_GUIDE.md) |

All three roles are claimed. Michael recorded MKWang-2006’s Messages claim on 21 Oct. Start your module directly; no name-only PR is needed.

All three members have repository write access. Ownership is tracked in [Content #1](https://github.com/Michael-wzl/CampusNote/issues/1), [Discover #2](https://github.com/Michael-wzl/CampusNote/issues/2) and [Messages #3](https://github.com/Michael-wzl/CampusNote/issues/3).

[Weekly status — Done / Next / Blocked](https://github.com/Michael-wzl/CampusNote/issues/4)

## 2. Run the app

Follow [README.md](README.md#run-locally). You need Node 22+ and MySQL 8 (or Docker for the database). Log in using the development shortcuts. All feed tabs, Search, personal lists and the other merged module pages are available; announcement banners/admin announcements are still planned Should work.

## 3. Build for desktop and phones

The shared layout adapts automatically: a sidebar and wider content on desktop, an expanded layout on tablets, and bottom navigation with one-column content on phones. Read the short [responsive guide](docs/architecture/RESPONSIVE.md); your module should use its fluid widths and shared helpers. Check pages at **390, 768 and 1440 px**, including without JavaScript.

## 4. Start your next task

Read the short [grading and submission checklist](docs/team/SUBMISSION.md). hX1-dev finishes Discover's planned announcement features, SQL card and slide outline by 6 Nov; Catherine135 prepares the explicit CRUD/database video; MKWang-2006 prepares the ZIP/rebuild checklist; Michael handles integration, the Chen E-R diagram and marker README. The three shared integration flows are now mandatory tests; [VALIDATION.md](docs/team/VALIDATION.md) records current evidence and limitations. Keep the merged Must features working while these handoffs progress.

1. Read your DEV_GUIDE's scope, build plan and acceptance tests. It includes tested SQL and a coding-agent prompt.
2. Work only in `modules/<your module>/` and `docs/modules/<your module>/`. Ask Michael about shared-file or schema changes.
3. Pick the next unfinished feature or handoff in your guide; the first read-only pages are already merged. Use a feature branch and open a small PR. Keep completed Content/Messages behavior working rather than restarting those modules.
4. Before merging, run `npm test` and `npm run lint`; CI also checks the SQL. Read [WORKFLOW.md](docs/team/WORKFLOW.md) when opening your first PR.

**Checkpoints:** 1 Nov — Must features merged; 6 Nov — module complete; 13 Nov — tested release/package; 17 Nov — video for review; 18 Nov — timed draft rehearsal; 19 Nov — final slides/video; **20 Nov — submit all three files**. Official deadline: **21 Nov, 23:59 HKT**. Rehearse delivery on 22 Nov and present on **23 Nov** (Group 8, order 8). All dates are 2026/HKT. Post Done / Next / Blocked in the weekly status issue each Sunday.

For the full specification, architecture and database design, see [docs/README.md](docs/README.md). You do not need to read the entire pack before starting your module.
