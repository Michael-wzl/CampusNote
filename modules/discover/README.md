# discover module

Original CP1/CP2 contributor: Member 2 — Discover ([hX1-dev](https://github.com/hX1-dev)). Current source-baseline maintenance: Michael and his coding assistant, following the 27 Oct ownership change. This folder holds feeds, hot ranking, search, the four personal lists, public pages and announcements. The implementation contract remains in [`DEV_GUIDE.md`](../../docs/modules/discover/DEV_GUIDE.md); what users see is in [`USER_GUIDE.md`](../../docs/modules/discover/USER_GUIDE.md).

CP1 implements All/university/topic feeds, My posts and public student/organization pages ([validation](../../docs/modules/discover/CP1_INTEGRATION_VALIDATION.md)). CP2 completes Watching/Hot, Chinese/English Search and personal Watching/Liked/History ([validation](../../docs/modules/discover/CP2_INTEGRATION_VALIDATION.md)). DS-3/DS-7 now add scheduled first-page banners and admin announcement CRUD, with 18 new cases and a [dated validation record](../../docs/modules/discover/ANNOUNCEMENTS_VALIDATION.md). All 68 Discover cases pass in the coordinator's isolated MySQL run; whole-app/source-package acceptance is recorded separately by the coordinator. [SQL_CARD.md](../../docs/modules/discover/SQL_CARD.md) provides technical material for the later presentation phase.

## Ownership and first step

**hX1-dev** claimed the original role in [issue #2](https://github.com/Michael-wzl/CampusNote/issues/2); that contribution history is preserved. Michael now handles code, tests, README, repository and source packaging across modules. After the source baseline is pinned, teammates review the code/README and prepare slides, video and rehearsals; follow [START_HERE.md](../../START_HERE.md) for the current handoff.

Use the shared [responsive layout](../../docs/architecture/RESPONSIVE.md) and test desktop, tablet and phone widths.
