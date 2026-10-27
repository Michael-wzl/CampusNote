# discover module

Owner: Member 2 — Discover ([hX1-dev](https://github.com/hX1-dev)). This folder holds the discover module: feeds, hot ranking, search, the four "my" lists, user pages and announcements. Everything about it (routes, SQL, pages, tests, the build plan and a ready-made prompt for a coding agent) is in [`docs/modules/discover/DEV_GUIDE.md`](../../docs/modules/discover/DEV_GUIDE.md); what users see is in [`USER_GUIDE.md`](../../docs/modules/discover/USER_GUIDE.md).

CP1 implements All/university/topic feeds, My posts and public student/organization pages, with keyset pagination and empty states; its evidence is in [`CP1_INTEGRATION_VALIDATION.md`](../../docs/modules/discover/CP1_INTEGRATION_VALIDATION.md). CP2 adds Watching by discussion activity and the seven-day Hot ranking, with offset pagination; see [`WATCHING_HOT_VALIDATION.md`](../../docs/modules/discover/WATCHING_HOT_VALIDATION.md). The acceptance suites contain 32 HTTP/database tests; browser helpers accept an existing Playwright browser. Search, the other personal lists and announcements remain for later features. Only change files in this folder and in `docs/modules/discover/` (see `AGENTS.md`).

## Ownership and first step

**hX1-dev** claimed this role in [issue #2](https://github.com/Michael-wzl/CampusNote/issues/2). A write-access invitation has been sent; accept it on GitHub, then follow [START_HERE.md](../../START_HERE.md) and begin your first feature. Ownership is already recorded; a name-only PR is unnecessary.

Use the shared [responsive layout](../../docs/architecture/RESPONSIVE.md) and test desktop, tablet and phone widths.
