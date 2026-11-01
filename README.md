# Campus Notes

An anonymous notice board for students of HKU, CUHK and HKUST, in the style of the Triple Uni "tree hole": post a note under a topic (anonymously or with your handle), comment under a per-post alias such as Host or Alice, like and watch posts, message people privately, report abuse, and book tickets for campus events. Only people with a university e-mail address can join.

Built by Group 8 for COMP3278 (Introduction to Database Management Systems), HKU, autumn 2026. A desktop-first responsive website that also adapts to tablets and phones. A server-rendered Node.js app: Express 5, EJS templates and MySQL 8 through `mysql2` with hand-written SQL (no ORM).

## Marker quick start (ZIP)

Extract `Group_8_code.zip` and follow the numbered [first-time setup](#run-locally) below. You do not need Git, a GitHub account or a real e-mail service. The ZIP contains the app; **Node.js and a running MySQL server must also be installed on your computer**.

## Run locally

Do these steps once, in order, running one command at a time. Continue after each command succeeds. Node.js runs the website; MySQL is a separate program that stores its data. `npm ci` installs the app's packages, but does not install or start MySQL.

### 1. Open the project folder in a terminal

**From the ZIP:** extract it, then open a terminal **in** the extracted `CampusNote` folder. You should see `package.json` in that folder. On macOS, you can type `cd ` in Terminal (with a space), drag the folder from Finder into the terminal, then press Return.

**From GitHub:** if you have not downloaded the project yet, run:

```bash
git clone https://github.com/Michael-wzl/CampusNote.git
cd CampusNote
```

If you already have the project open in a terminal, stay in that folder. Do not run `cd CampusNote` again.

Run `node --version`. It must print **v22 or later**. If Node is not installed, install [Node.js](https://nodejs.org/) before continuing.

### 2. Install and start MySQL

You need **MySQL 8.0.19 or later**; we recommend **8.4 LTS**. Follow the instructions for your computer:

**macOS with Homebrew:** run these commands once. If `brew` is not found, install [Homebrew](https://brew.sh/) first and reopen Terminal.

```bash
brew install mysql@8.4
brew services start mysql@8.4
"$(brew --prefix mysql@8.4)/bin/mysqladmin" --host=127.0.0.1 --port=3306 --user=root ping
```

The last command should print **`mysqld is alive`**. If the service has just started, wait a few seconds and retry that last command. A fresh Homebrew installation normally has user `root` with an empty password. If you get `Access denied`, add `--password` before `ping` in the last command and enter your database password when prompted. Use that same password in step 4; do not reset it.

**Windows:** install MySQL Server 8.4, keep its port at **3306**, and remember the **root password** you choose during installation. Open the **Services** app, find the MySQL service created by the installer and start it. Continue with step 3 and put that root password in `.env` at step 4.

**Linux, Docker or an existing MySQL server:** use [these database options](#setting-up-mysql), then return to step 3. You only need one MySQL server; do not start Docker and a native MySQL service on the same port.

### 3. Install the app and create its settings

In the project folder from step 1, run:

```bash
npm ci
npm run setup
```

`npm run setup` creates a file named **`.env`** with local settings and a random session secret. If it says **`Kept your existing .env`**, that is normal: it preserves your previous settings, which you should check in the next step.

Funding, deprecated-package and audit warnings can appear even when `npm ci` succeeds. Keep the submitted package versions; **do not run `npm audit fix --force` as part of setup**. If a command prints an actual error and fails, resolve that error before continuing.

### 4. Check the database settings

Open `.env` in a text editor. It is a hidden file, so it may not appear in Finder. From the project terminal, use `open -e .env` on macOS or `notepad .env` on Windows.

Check these lines; keep the other settings, including the generated `SESSION_SECRET`:

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=campus_notes
DB_NAME_TEST=campus_notes_test
```

- Leave `DB_PASSWORD=` empty **only if your MySQL root account has no password**. Otherwise put your actual MySQL password after `=` and save the file; use quotes if it contains `#` or spaces. This is the database password, not the `campus123` demo login password.
- The database names must be **different and dedicated to this project**. `db:reset` creates/rebuilds `DB_NAME`; tests create/rebuild `DB_NAME_TEST`. Both replace the chosen database's contents. Choose other names if either already contains data you need.
- Keep the default host and port unless your MySQL server uses different ones. Do not share or commit your `.env` file.

### 5. Create the demo data, then start the app

```bash
npm run db:reset
```

It should print **`Rebuilt campus_notes ...`** (or your chosen database name). It loads the tables, notification triggers and demo accounts/posts automatically; no manual SQL imports are needed. If it fails, fix the error before starting the app.

Then run:

```bash
npm run dev
```

It should print **`Campus Notes (development) on http://localhost:3000`**. **Leave this terminal running**, then open [http://localhost:3000](http://localhost:3000) in your browser. If you changed `PORT` in `.env`, use that port instead.

If you see **`ECONNREFUSED 127.0.0.1:3306`**, stop here: MySQL is not accepting connections at that address. Return to step 2; re-running `npm ci` will not fix it. For other errors, see [troubleshooting](#troubleshooting).

### Check the app is running

Try this short walkthrough:

1. Log in with **`mandy@connect.hku.hk` / `campus123`**. The **Feed** should contain demo posts. Open post **#600012** to see its text and comments.
2. Click **New post**, enter `My first test post`, select **Share**, leave both switches off and click **Publish**. You should reach the new post's detail page. Reload it; your text should remain. Return to **Feed** and find the post there.
3. Open a demo post, add a comment, then try **Like** and **Watch**. Look in **Messages** for Mandy's seeded conversations and notifications.
4. For ticket booking, use **Me → Log out**, then log in as **`newbie@connect.hku.hk` / `campus123`**. Open **Events → Film night: Wake Up**, click **Book a ticket**, then try **Cancel booking**. Some other demo events are deliberately sold out, not on sale yet or already ended.
5. To explore organizer and moderator screens, use the [demo accounts](#demo-accounts) below. The login page's **Developer shortcuts** also lets you choose a demo account. Sign-up/reset e-mail codes appear at [the local mailbox](http://localhost:3000/dev/mailbox) while `SMTP_URL` is unset; no real e-mail service is needed.

These actions change only your local project database. They do not affect GitHub or another teammate's copy.

### Next time: start without rebuilding

Open a terminal in the same project folder and run:

```bash
npm run dev
```

MySQL must still be running. On macOS, run `brew services start mysql@8.4` if you stopped it; on Windows, start its service again. Open http://localhost:3000 and log in.

Press **Ctrl+C** in the app terminal to stop the website. Your posts remain in MySQL. You do **not** need to repeat `npm ci`, `npm run setup` or `npm run db:reset` for each visit. Run `db:reset` again only when you want to erase local changes and restore the demo data.

### Setting up MySQL

Use these alternatives only if you did not use the macOS or Windows path above:

- **Linux:** install/start a local MySQL 8 server and put its host, port, username and password in `.env`.
- **Docker:** if Docker is already installed and running, run `docker compose up -d mysql --wait` from the project folder. Wait until it finishes successfully before `npm run db:reset`. The included `compose.yaml` uses `127.0.0.1:3306`, user `root` and an empty development password, matching `.env.example`. Stop any other MySQL service using port 3306 first.
- **An existing MySQL server:** keep its current credentials and port; change `.env` to match. Use two dedicated project database names.

For a dedicated app account instead of root, connect as your MySQL administrator. On Homebrew, run `"$(brew --prefix mysql@8.4)/bin/mysql" -uroot -p` and enter your database password (press Return if it is empty). Run the SQL below in that MySQL prompt, then type `exit` to return to your terminal. Replace the password and database names to match your choice, then set `DB_USER=campus` and your chosen `DB_PASSWORD` in `.env`.

```sql
CREATE USER 'campus'@'localhost' IDENTIFIED BY 'choose-a-password';
GRANT ALL PRIVILEGES ON campus_notes.* TO 'campus'@'localhost';
GRANT ALL PRIVILEGES ON campus_notes_test.* TO 'campus'@'localhost';
SET PERSIST log_bin_trust_function_creators = 1;
```

The reset imports SQL in this order: `db/schema.sql`, non-seed SQL under `modules/*/db/` (currently notification triggers), `db/seed/core.sql`, then any module-specific `seed.sql` files.

### Troubleshooting

- **`ECONNREFUSED ...:3306`:** MySQL is stopped, is not installed or is using another address/port. Start it using step 2, then check `.env`. Installing Node packages does not start the database.
- **`Access denied for user`:** MySQL is running, but `DB_USER` / `DB_PASSWORD` in `.env` does not match its account. On Windows, use the root password chosen in the MySQL installer.
- **`You do not have the SUPER privilege and binary logging is enabled` (1419):** connect as the MySQL administrator and run `SET PERSIST log_bin_trust_function_creators = 1;` once, then retry the reset.
- **No Developer shortcuts:** use the normal demo e-mail/password, or set `NODE_ENV=development` in `.env` and restart the app.
- **`npm run check:sql` cannot connect:** this optional developer check uses the separate `mysql` command-line client as `mysql -uroot` and creates a scratch database named `cn_check`. Configure that client for your server; see [SQL check instructions](docs/README.md#4-checking-the-sql). It is not needed just to try the website.

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

## Project and source reference

Built by **COMP3278 Group 8:** Michael, Catherine135, hX1-dev and MKWang-2006. Repository: [Michael-wzl/CampusNote](https://github.com/Michael-wzl/CampusNote).

For source review and database explanation:

- [Database schema](db/schema.sql), [initial data](db/seed/core.sql) and [notification triggers](modules/messages/db/triggers.sql).
- Every module's SQL is in `modules/<name>/queries.js`; the modules are Identity, Content, Discover, Messages and Events.
- [Chen E-R diagrams](docs/data/er/README.md) and [technical documentation index](docs/README.md).

Optional developer checks are `npm test`, `npm run lint` and `npm run check:sql`. Tests replace `DB_NAME_TEST`; the SQL suite additionally needs the MySQL command-line client, Bash and Unix tools (Git Bash/WSL on Windows). These checks are not required just to try the app.

**Course submission:** upload three separate files to Moodle: `Group_8_code.zip`, `Group_8_slides.pptx` and `Group_8_video.mp4`, due **21 Nov 2026, 23:59 HKT**. Group 8 presents **23 Nov**, order 8. Use the latest verified code ZIP from accepted `main`; keep its matching `.manifest.json` locally as provenance, not as a Moodle upload. Contributor roles, packaging and presentation checklists are in [SUBMISSION.md](docs/team/SUBMISSION.md).
