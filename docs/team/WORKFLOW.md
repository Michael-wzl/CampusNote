# How we work (for every member)

Use this page for feature PRs and weekly updates. The [grading and submission checklist](SUBMISSION.md) adds the final deliverables and 18/22 Nov rehearsals: submit all three files internally on **20 Nov**, before **21 Nov, 23:59 HKT**; Group 8 presents **23 Nov**. All dates are 2026/HKT.

## 1. Current phase and technical workflow

**27 Oct change:** Michael and the assistant own all code/repo/README/tests/rebuild/ZIP work through source-ready. Teammates wait for that handoff, then review code/README with suggestions and prepare slides/video/rehearsals. Michael implements accepted suggestions; existing repository access is unchanged. The feature loop below is for coordinator-led implementation, not a new coding assignment to each member.

1. **Check** the current plan in `START_HERE.md`. Michael chooses the next unfinished feature or source-readiness item and gives an assistant a bounded implementation task. Track progress in the relevant issue; preserve the original module contribution history.
2. **Branch** from an up-to-date `main`:
   ```bash
   git switch main && git pull
   git switch -c content/CT-3-comments        # <module>/<feature ID>-<few words>
   ```
3. **Build** it from your DEV_GUIDE and the [responsive layout guide](../architecture/RESPONSIVE.md). Use the shared shell; keep your page layout and CSS inside your module. Run the app with `npm run dev` and log in as personas from the login page (development only).
4. **Test**:
   ```bash
   npm test -- modules/content      # your module's tests
   npm run lint                     # style and obvious mistakes
   npm test                         # everything, before you push
   ```
   Check the page in a browser at **390, 768 and 1440 px**, with JavaScript on and off. Test normal, empty and validation-error states; long text must wrap, and only table/tab containers may scroll sideways. See the responsive guide for the full acceptance checklist.
5. **Commit** with the module and feature ID: `content: comments with aliases and replies (CT-3)`.
6. **Push and open a pull request**: `git push -u origin content/CT-3-comments`, then open the PR on GitHub. Fill in the template. CI runs lint, all tests and the SQL checks.
7. **Merge** when CI is green: Michael reviews and merges coordinator-led changes, then verifies post-merge CI. Keep final source/README and ZIP in sync. Teammates submit suggestions after source-ready rather than independently merging implementation changes.

Keep PRs small: one feature, ideally under 400 changed lines. Pull `main` into your branch at least daily (`git pull origin main`) so you never drift.

For an existing stack of dependent PRs, use merge commits in dependency order to preserve the commits the next branch is based on. Retarget the next PR to `main` (GitHub may do this automatically), update its branch, and wait for fresh CI before merging. Keep the default squash workflow above for independent feature PRs.

## 2. Rules that keep us out of each other's way

- A bounded module subtask stays inside its assigned paths. Michael may coordinate changes across the repository under the current plan; preserve module boundaries and record any real shared contract/schema change (`ARCHITECTURE.md` §13).
- Production module code still writes only that module's tables (`WORK_DIVISION.md` §1), even though Michael is the human maintainer across modules. Reading any table is allowed.
- Link to other modules only with the URLs in `WORK_DIVISION.md` §3.
- Never commit `.env`, `node_modules/` or `uploads/`. Never force-push `main`.
- If you are blocked for more than a day, say so in the feature's issue with the `question` label, and work on your next feature meanwhile.

## 3. Sunday status (21:00, three lines)

Michael posts Phase A progress on the "Weekly status" issue linked from `START_HERE.md`. After source-ready, members also post review/presentation progress:

```
Done: CT-1, CT-4
Next: CT-3, CT-5
Blocked: nothing
```

## 4. Using a coding agent (Claude Code, Codex, Cursor)

AI coding tools are allowed for the project, but you must be able to explain every line, especially the SQL you present.

1. Start the agent in the repository root. It reads `AGENTS.md` automatically (Cursor: add it as a rule).
2. Give it your DEV_GUIDE and one feature at a time. Each DEV_GUIDE ends with a ready-made prompt.
3. Michael reads the diff and runs the required checks. A module subtask stays in its assigned paths; coordinator-authorized repository work may span modules without changing their table/URL contracts.
4. Ask the agent to explain any SQL you do not fully understand, then check the explanation against the course notes.

## 5. Pull request template (`.github/pull_request_template.md`)

```markdown
## What
Feature IDs: CT-3
One or two sentences on what a user can now do.

## Screenshots
Phone (390 px) and desktop (1440 px) views of the changed page. Record the 768 px tablet check too.

## Checklist
- [ ] Only files in my module (or labelled `contract-change` and reviewed by the coordinator)
- [ ] Only my module's tables are written
- [ ] SQL uses `?` placeholders; user text printed with `<%= %>`
- [ ] Visibility checked for anything about a post; ownership checked for every change
- [ ] Acceptance tests from my DEV_GUIDE added and passing; `npm test` and `npm run lint` pass
- [ ] Checked in the browser as two personas, including `newbie0hk` for empty states
- [ ] 390 / 768 / 1440 px: no horizontal document overflow; navigation, long text and error states work
- [ ] Keyboard focus visible; touch targets at least 44 px high; works with JavaScript off
- [ ] USER_GUIDE section written or updated
```

## 6. Code owners (`.github/CODEOWNERS`)

All repository paths now have `@Michael-wzl` as owner in [.github/CODEOWNERS](../../.github/CODEOWNERS), matching the source-first plan. Michael owns implementation and merges, including module-only changes. Earlier module contributors remain credited in `START_HERE.md` and Git history. CI must pass for every PR; collaborator access is unchanged.

GitHub branch protection requires a pull request and passing `ci`, with code-owner review enabled and no force pushes. All implementation changes route through Michael. Teammates provide review suggestions after the source-ready handoff.

The repository owner retains GitHub’s default admin override for coordinator maintenance. This does not assign teammates implementation or packaging work during Phase A.
