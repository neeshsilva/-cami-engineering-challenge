# AI Usage

## Tools used

List the AI tools you used (Cursor, GitHub Copilot, Claude Code, ChatGPT, etc.).

- **Claude Code** (Claude Opus, VS Code extension): the main tool for exploring the code, making changes, running checks and drafting these docs.

## How I used AI

Briefly explain how you used AI during the challenge (exploring the codebase, drafting
fixes, tests, docs, review, …).

- **Finding my way around:** I had it read the API and web apps and write a `CLAUDE.md` describing the architecture. That made the planted issues clear early, especially the two TypeORM configurations that have to be kept in sync by hand.
- **Finding root causes:** I gave it each symptom, such as the "No driver (HTTP)" error, the stale table and the red CI run. It traced each one to its source before changing anything, for example the CI Migrate step overriding `DATABASE_URL` with a database the CI Postgres service never creates.
- **Writing the fixes:** the single-query `list()`, the TanStack Query cache changes, and the split of the `classify` endpoint into controller, service and plain rule function.
- **Checking the work:** after each change it ran typecheck, tests and build. For CI it went further:
  - **Clean environment:** it re-ran the whole CI job from a clean clone, in a Linux Docker container on Node 20 against an empty Postgres 16 database.
  - **Real CI:** it checked the actual GitHub Actions runs through the public REST API.
  - **Classify endpoint:** it smoke-tested the refactored endpoint with `curl` against the built API.
- **Tests and docs:** it wrote the unit test for the classify rules, and drafted `DECISIONS.md` and this file for me to review.

## What I changed or rejected

Describe anything the AI suggested that you changed, corrected, or rejected.

- **A passing local run wasn't accepted as proof.** The challenge's premise was that CI fails even though the same commands pass locally. So I didn't trust a local run of the CI commands. Instead I checked a clean Linux run and the real GitHub runs. Those showed that the only red run was the push from before the fix.
- **A false failure.** The first smoke test of the refactored endpoint returned 500s. The logs showed this came from the test setup, not the code: `tsx` doesn't emit decorator metadata, so Nest's dependency injection was empty and even `GET /requests` failed. Re-running against the `nest build` output showed the endpoint behaves correctly.
- **Narrower scope:**
  - **Provider interface deferred:** I didn't add a classifier provider interface during the `classify` refactor. I added it later, as part of the history task it belongs to.
  - **No new dependency:** I didn't add class-validator for a single endpoint.
  - **Errors left as they are:** I didn't convert the error responses of `create` and `updateStatus`. Each of these is recorded in `DECISIONS.md` instead.
- **Approval steps:** a local safety hook made the AI state which files a change affects and give my instruction verbatim before it created files or ran destructive commands. Commits and pushes happened only when I asked for them.

## Trade-offs

Any AI-related trade-offs under the timebox.

- **Speed against checking:** the AI produced changes faster than I could review them line by line. So I made every change prove itself through typecheck, tests and build, plus the clean-environment CI run and the real GitHub run for CI, before accepting it.
- **Tests are thin:** the unit tests cover the pure classification rules only. The database-backed parts (`list()` and saving a classification) were checked by hand with `curl`, not by automated tests. I would close that gap with more time.
- **Docs need a human read:** AI-drafted docs can sound more confident than the evidence supports. I reviewed `DECISIONS.md` and this file against what was actually run.

## Team workflow (optional stretch)

If relevant: how you would set standards for AI-assisted development on a team.

- **Keep a project guide:** commit a `CLAUDE.md`, or an equivalent file, that records architecture traps like the duplicate TypeORM configurations, so every AI session starts from the same context.
- **Make CI the judge:** a passing run on someone's machine shouldn't count. Keep CI reproducible: `npm ci`, pinned Node, and no environment overrides in individual steps.
- **Explain what was checked:** AI-written PRs should say how each change was verified, not just what changed.
- **Gate risky actions:** require human approval before the AI commits, pushes or runs destructive commands.
