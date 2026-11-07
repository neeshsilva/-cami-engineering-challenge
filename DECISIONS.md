# Decisions

Use this file to record assumptions, trade-offs, prioritisation, and anything you cut.

## Prioritisation

What did you tackle first, what did you defer, and why?

1. **API wouldn't boot.** `@nestjs/platform-express` was missing, which caused the "No driver (HTTP)" error. I added it and aligned `@nestjs/cli` with it, because nothing else can be checked without a running API.
2. **Red CI.** Without CI, no other fix can be proven. The Migrate step overrode `DATABASE_URL` with a `cami_app` database that the CI Postgres service never creates. Locally it passed because my own `DATABASE_URL` points at `cami`. I removed the override so every step uses the job-level URL.
3. **List N+1.** This is the most visible performance problem: 1,200 seeded rows meant 1 + N queries on every table load.
4. **Stale UI after mutations.** This is a correctness bug users would notice.
5. **Fat `classify` controller.** This was a structural problem with no visible symptom, so it came after the bugs.
6. **Classification history and provider seam:** this came last because it's a new feature rather than a fix (see below).

## Assumptions

- `GET /requests` keeps returning every row, as the original did. The web page shows only the first 25, but I didn't add pagination because it would change the API contract the UI relies on.
- Classifying a request whose status is `open` moves it to `in_progress`. The original controller did this, so I kept it as a business rule rather than treating it as a bug.
- Invalid input to `POST /requests/classify` should return a 4xx error. Previously it returned **200** with an `{error}` body, so the UI reported success. The web client already throws on any non-2xx response, so no client change was needed.

## Trade-offs

- **N+1 fix:** `list()` is now one raw SQL query, with correlated subqueries for the note count and the latest note. A query builder with joins and `GROUP BY`, or a `DISTINCT ON` lateral join, would also work. I chose the subqueries because they're easy to read and the existing `request_notes.request_id` index serves them. The cost is a hand-written row type that has to stay in sync with the columns.
- **UI freshness:**
  - **Status changes are optimistic.** `onMutate` updates the cache and `onError` rolls it back. The status `<select>` reads its value from the cache, so without this it snapped back to the old value until the refetch finished.
  - **Classify is not optimistic.** The client can't predict the result, so it waits and then invalidates `['requests']` and `['history']` in `onSettled`.
  - **Left unchanged:** the global `staleTime` and refetch-on-focus settings. The real problem was a missing invalidation, not the cache settings.
- **Classify refactor:**
  - **Layering:**
    - **Controller:** handles HTTP only, checking the untyped body at the boundary and returning 400s.
    - **`ClassificationService`:** runs the classifier and saves the result.
    - **`applyConfidenceRules`:** a plain function that holds the business rules, so they can be unit-tested without Nest or a database.
    - **`RequestsService.applyClassification`:** does the save. It replaces a generic `save(entity)` method and the `any`-typed changes the controller used to make.
  - **Hand-written validation instead of class-validator plus `ValidationPipe`:** one endpoint didn't justify a new dependency and a global pipe. Move to the pipe once more endpoints need validation.
  - **Kept small on purpose:** `create` and `updateStatus` still return 200 with `{error}`, and a malformed (non-UUID) `requestId` still causes a 500 from Postgres. Both are noted below rather than fixed as side changes.

## Classification history scope

What you implemented for history / provider seam, and what you left out.

**Implemented:**

- **Schema:** a new `classification_records` table, created by migration `1720000000000-ClassificationRecords` and registered in both TypeORM configurations. Each row stores the request ID, the message, category, confidence, provider name and creation time.
  - **Request ID:** nullable, with `ON DELETE SET NULL`.
  - **Indexes:** one on `(category, created_at DESC)` for the filtered list and one on `created_at DESC` for the unfiltered list.
- **Writes:** `ClassificationService.classify` inserts one row for every classification, including ad-hoc ones that have no `requestId`. It runs after `applyClassification`, so an unknown request returns 404 and nothing is recorded.
- **API:** `GET /requests/history?category=&limit=` returns `{ items }`, newest first.
  - **Limits:** the default limit is 50 and the maximum is 200.
  - **Invalid input:** an unknown category or an out-of-range limit returns 400.
- **Provider seam:**
  - **The interface:** `ClassifierProvider` has a `name` and a `classify()` method that may return a Promise, so a network-backed LLM fits.
  - **Binding:** the interface is bound through the `CLASSIFIER_PROVIDER` token, and `KeywordClassifier` (named `keyword-v1`) is the default implementation.
  - **Swapping it:** changing provider means changing one `useClass` in `RequestsModule`.
  - **Confidence rules still apply:** `applyConfidenceRules` runs on top of every provider's output.
- **Web:** `/history` shows a table with time, message, category, confidence and provider. A category dropdown replaces the free-text input. The page has loading, error and empty states. Classifying a request already invalidates `['history']`, so the page stays fresh.
- **Test:** a unit test injects a fake provider and checks that its result and name are recorded.

**Assumptions:**

- **History is an append-only log, not current state.** Re-classifying a request adds a row. The request's own `category` and `confidence` still hold the latest result.
- **The message is stored as a snapshot,** because ad-hoc classifications have no request and a request's text could change later.
- **The migration only adds things,** so it can run before the code that writes to the table is deployed.

**Left out:**

- **No transaction:** saving the request and inserting the history row aren't wrapped in one transaction. If the insert fails, the request is updated but has no history row. This is marked with a `ponytail:` comment in the code.
- **No pagination beyond `limit`,** and no filters by date or request.
- **No real LLM provider,** and no timeout, retry or fallback handling for one.
- **No database-backed test** of the history query.

## Stretch (if any)

None.

## What you would do with more time

- Apply the same validation and 400 errors to `create` and `updateStatus`, and validate IDs with `ParseUUIDPipe` so a malformed ID returns 400 instead of 500.
- Add pagination or a limit to `GET /requests`, since the UI shows only 25 rows anyway.
- Add tests that run against a real database for `list()` and the classify endpoint. The current tests cover the pure rules only.
- Have both TypeORM configurations (`app.module.ts` and `data-source.ts`) read from one shared entity list so they can't drift apart.
