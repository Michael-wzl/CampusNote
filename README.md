# Campus Notes

An anonymous notice board for students of HKU, CUHK and HKUST, in the style of the Triple Uni "tree hole": post a note under a topic (anonymously or with your handle), comment under a per-post alias such as Host or Alice, like and watch posts, message people privately, report abuse, and book tickets for campus events. Only people with a university e-mail address can join.

Built by Group 8 for COMP3278 (Introduction to Database Management Systems), HKU, autumn 2026. A desktop-first responsive website that also adapts to tablets and phones. A server-rendered Node.js app: Express 5, EJS templates and MySQL 8 through `mysql2` with hand-written SQL (no ORM).

## Marker quick start (ZIP)

You need **Node.js 22+** and **MySQL 8.0.19+** (8.4 recommended). Extract `Group_8_code.zip`, open a terminal beside its `CampusNote` folder, then run:

```bash
cd CampusNote
npm ci
npm run setup
```

**Before resetting:** start MySQL and set its connection details in `.env` (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`). Check that `DB_NAME` and `DB_NAME_TEST` name **two distinct, dedicated local databases**; their defaults are `campus_notes` and `campus_notes_test`. The reset and test commands replace their contents, so choose different names if either already contains data you need. The MySQL account needs privileges on the chosen databases; see [full setup](#setting-up-mysql).

```bash
npm run db:reset
npm run dev
```

Open **http://localhost:3000** and log in as **`mandy@connect.hku.hk` / `campus123`**. Sign-up/reset codes are at `/dev/mailbox` with `SMTP_URL` unset. No Git, GitHub account or real mail service is required to run the ZIP. For Docker, platform notes and troubleshooting, see [Run locally](#run-locally).

Follow [Check the app is running](#check-the-app-is-running) to confirm that the initial data loads and a new post is saved.

## Team: start here

**[Check your role and start working → START_HERE.md](START_HERE.md)**

Repository: [Michael-wzl/CampusNote](https://github.com/Michael-wzl/CampusNote). Michael, working with his coding assistant, now maintains all code, the README, validation and source packaging. Earlier teammate contributions remain credited in the module guides and Git history. The team joins after the verified source-ready handoff to review code/README and prepare slides, video and rehearsals; there is no current teammate coding or packaging prerequisite.

The agreed app features are implemented, including scheduled announcement banners/admin CRUD, the shared backbone, Identity, Events, Content, Messages MS-1–MS-7 and Discover feeds/search/lists/profiles. The three shared Discover integration checks are mandatory. The editable [Chen diagrams](docs/data/er/README.md) and module SQL cards support the later team review/presentation. See [validation](docs/team/VALIDATION.md) for current results, source-package evidence and limits. The [responsive guide](docs/architecture/RESPONSIVE.md) explains desktop/sidebar and phone/bottom-navigation behavior.

**Final submission:** code ZIP, slides and video are all due **21 Nov 2026, 23:59 HKT**; our internal submission target is **20 Nov**. Group 8 presents **23 Nov**, order 8. See [grading, owners and submission checklist](docs/team/SUBMISSION.md), including the 18 Nov draft rehearsal and required filenames.

## Run locally

You need **Node.js 22 or later** and **MySQL 8.0.19 or later** (8.4 LTS recommended).

**From the submitted ZIP:** extract `Group_8_code.zip` and open a terminal in its `CampusNote` folder (the folder containing `package.json`). Git and a GitHub account are not required to run the extracted project. Continue with `npm ci` and `npm run setup` below.

**From GitHub:** clone and enter the project folder first:

```bash
git clone https://github.com/Michael-wzl/CampusNote.git
cd CampusNote
```

**For either source**, install the pinned dependencies and create local configuration:

```bash
npm ci
npm run setup               # creates .env with a random session secret; keeps any existing .env
```

Start MySQL and set its host, port and `DB_USER` / `DB_PASSWORD` in `.env` to your local connection. Check that `DB_NAME` and `DB_NAME_TEST` are distinct, dedicated local databases before the next command. If you already have Docker, you can instead run `docker compose up -d mysql --wait`; its database runs only on localhost:3306, using the default `.env.example` root account with an empty development password. Stop any other service using port 3306 first, or use your existing MySQL. This is a local development setup.

```bash
npm run db:reset            # rebuilds campus_notes with schema, triggers and demo data
npm run dev                 # http://localhost:3000
```

`db:reset` replaces the configured development database; use a dedicated local database, not a shared or production one. Tests use `DB_NAME_TEST` and replace its contents.

The reset command automatically imports the SQL files in this order:

1. `db/schema.sql`: tables, constraints and shared views.
2. Module database SQL under `modules/*/db/`, excluding `seed.sql`: currently the notification triggers in `modules/messages/db/triggers.sql`.
3. `db/seed/core.sql`: initial demo accounts and application data.
4. Any module-specific `modules/*/db/seed.sql` files, if present.

No manual SQL imports are needed.

Open http://localhost:3000. In development the login page lists every demo account under "Developer shortcuts"; click one to log in. Or use `mandy@connect.hku.hk` / `campus123`. Sign-up and password-reset codes appear at http://localhost:3000/dev/mailbox, so no real e-mail service is needed. Publishing/comments, all feed tabs, Search, personal lists, private messages/notifications, report/moderation and scheduled/admin announcements are available. MS-8 block/unblock controls remain optional and deferred.

### Check the app is running

After starting the app, check the following in a browser. Use your configured `PORT` in the URL if it differs from 3000.

1. Open http://localhost:3000 and log in with `mandy@connect.hku.hk` / `campus123`. The Feed should show seeded post cards.
2. Open post `#600012`. Its text and comments should appear, confirming that the initial data is available.
3. Click **New post**, enter `README smoke test`, select **Share**, leave both switches off and click **Publish**. The app should open the new post's detail page with its generated post number and the text you entered.
4. Reload that detail page. The text should remain. Return to **Feed** and confirm that the new post also appears in the list.

These checks create one test post in your dedicated local development database.

### Setting up MySQL

- **macOS:** `brew install node mysql@8.4`, then `brew services start mysql@8.4`.
- **Windows:** install MySQL 8.4 and start its service.
- **Linux:** use a local MySQL 8 server (8.4 recommended), or the Docker Compose option above. The default connection is `127.0.0.1:3306`; set `.env` to match your server.

Then either put the local root password in `.env`, or create a user for the app once (as root, in `mysql -uroot -p`). These grants use the default database names; replace them if you chose different names:

```sql
CREATE USER 'campus'@'localhost' IDENTIFIED BY 'choose-a-password';
GRANT ALL PRIVILEGES ON campus_notes.* TO 'campus'@'localhost';
GRANT ALL PRIVILEGES ON campus_notes_test.* TO 'campus'@'localhost';
SET PERSIST log_bin_trust_function_creators = 1;   -- lets that user create the triggers
```

and set `DB_USER=campus` and `DB_PASSWORD=choose-a-password` in `.env`.

### Troubleshooting

| Message | Fix |
|---|---|
| `db:reset failed: ... You do not have the SUPER privilege and binary logging is enabled` (error 1419) | Run `SET PERSIST log_bin_trust_function_creators = 1;` once as root. |
| `ECONNREFUSED 127.0.0.1:3306` | MySQL is not running: `brew services start mysql@8.4` (macOS) or start the MySQL service. |
| `Access denied for user` | `DB_USER` or `DB_PASSWORD` in `.env` is wrong. |
| `npm run check:sql` cannot connect, or fails with error 1044 | It runs the `mysql` command-line client as `mysql -uroot` and creates its own scratch database (`cn_check`), so it needs root or another user who may create databases. Pass your own login: `MYSQL="mysql -uroot -pYOURPASSWORD" npm run check:sql`. |
| The login page shows no "Developer shortcuts" | `NODE_ENV` in `.env` must be `development` (or left out). |

## Demo accounts

All use the password `campus123`.

| Handle | E-mail | Who |
|---|---|---|
| `admin0000` | admin@hku.hk | moderator (reports, announcements, users) |
| `mandy0hku` | mandy@connect.hku.hk | HKU student with posts, comments, a ticket and messages |
| `kelvin0hk` | kelvin@connect.hku.hk | HKU student who always posts anonymously |
| `wing0cuhk` | wing@link.cuhk.edu.hk | CUHK student |
| `jason0ust` | jason@connect.ust.hk | HKUST student who posts with his handle |
| `newbie0hk` | newbie@connect.hku.hk | new HKU student with no data (empty states) |
| `filmsoc00` | filmsoc@hku.hk | organization: HKU Film Society (events) |
| `hikeclub0` | hikeclub@cuhk.edu.hk | organization: CUHK Hiking Club (events) |

## Commands

| Command | Does |
|---|---|
| `npm run setup` | Create `.env` once with a random session secret. |
| `npm run dev` | Start with auto-reload (http://localhost:3000). |
| `npm start` | Start without reload. |
| `npm run db:reset` | Drop and rebuild the development database (`npm run db:reset -- --test` for the test database). |
| `npm test` | Every test, one file at a time, against `DB_NAME_TEST`. `npm test -- modules/content` runs one module's. |
| `npm run check:sql` | The SQL check suite (constraints, views, triggers, every module's queries, the race tests). Needs the `mysql` client. |
| `npm run lint` / `npm run format` | ESLint and Prettier. |
| `npm run load-test` | Adds 20,000 posts to the development database and times every page. |
| `npm run package:source -- --ref COMMIT_OR_TAG --out ../Group_8_code.zip` | Export a clean committed source snapshot and a SHA-256/provenance manifest, without overwriting an existing package. |

`npm run check:sql` also needs **Bash and Unix command-line tools**. On Windows use Git Bash/WSL or the Linux CI SQL result; the application, database reset and `npm test` are Node-based. Git is required by the maintainer's source-packaging command, not by a marker running the extracted ZIP.

## Source candidate and team review

Michael/assistant finish implementation, tests, README and an exact-ZIP clean rebuild before marking the source ready. Then teammates review that baseline and suggest improvements while preparing presentation materials. Michael handles accepted source/README changes and rebuilds the package. The [submission checklist](docs/team/SUBMISSION.md) records the phase gate and unchanged official deadline.

From a clean repository checkout, export the tested commit with:

```bash
npm run package:source -- --ref HEAD --out ../Group_8_code.zip
```

The output directory must already exist and be outside the repository. The command refuses uncommitted source, missing required files, tracked private/generated paths and existing output files; choose a new path or archive the previous package when rebuilding. It verifies that the ZIP contains the complete committed tree and writes `Group_8_code.zip.manifest.json` beside it, recording the exact source commit/tree, file list and archive SHA-256. Keep that manifest as a provenance record; the required Moodle uploads remain code ZIP, separate slides and separate video.

The archive is a **source candidate**, not proof of successful startup. Extract the actual exported ZIP into another directory, follow this README with fresh local configuration and a dedicated empty database, then verify the demo flows. Record the results in [VALIDATION.md](docs/team/VALIDATION.md). A source revision after team feedback requires a new verified archive; do not submit a stale ZIP or wait until after the deadline to finalize it.

## Where things are

| Path | What |
|---|---|
| `START_HERE.md` | Role selection, first task and checkpoints. |
| `docs/README.md` | The design pack: product spec, architecture, data model, module guides, team process. Start here. |
| `AGENTS.md` | Rules for coding agents (Claude Code, Codex, Cursor), and a good summary of the rules for people. |
| `db/schema.sql` | The database: every table, constraint and shared view. |
| `db/seed/core.sql` | The demo data. |
| `modules/<name>/queries.js` | Every SQL statement of a module (identity, content, discover, messages, events). |
| `modules/messages/db/triggers.sql` | The notification triggers. |
| `core/` | The shared backbone: database, sessions, login, CSRF, pages, uploads, mail. |
| `db/tests/`, `docs/modules/*/queries.sql` | The SQL check suite. |
| `docs/data/er/` | Editable Chen SVG views, PNG previews and schema-mapping notes. |

How the code is organised and why: `docs/architecture/ARCHITECTURE.md`. How the team works: `docs/team/WORKFLOW.md`.
