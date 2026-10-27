# Integration: land dependency modernization + `supermarket-products` on `main`

Repo: `/Users/yxd/Projects/api-sweet-home` · Branch: `integration/main-sync` (created from `main` @ `9995272`) · Merge source: `feature/supermarkets-products` @ `2e4a465` · Runner: pnpm + jest · Delivery strategy: `ask-on-risk`

Objective: bring the branch's genuinely-new content (pnpm/Nest 12/TS 6 modernization, Resend mail, the `supermarket-products` feature) onto `main` **without rewriting `main`**, using an intermediate branch that is merged into it and opened as one PR to `main`.

Related document: `odd/tasks/dependency-modernization.md` (E0-E6) covers the dependency work that produced `2e4a465` and `pnpm-lock.yaml`.

## Specs

**S1 — pnpm only.**
> "Regla de oro, no usar npm sino pnpm."

Acceptance: no npm artifact remains; `pnpm install`/`pnpm build`/`pnpm test` are the only commands. `package.json` keeps `"packageManager": "pnpm@11.28.2"`; `package-lock.json` is deleted (the branch deleted it); `bun.lockb` is deleted too (three lockfiles is incoherent, and bun is not the package manager here). Both deletions are reported to the user.

**S2 — `main`'s refactor wins every overlapping conflict.**
`main` is newer and its flat-tree -> `@api/*` alias refactor supersedes the branch's older refactor. Every conflict where the two refactors overlap resolves to `main`(HEAD).

**S3 — Preserve only the branch's genuinely-new content:**
the modernization of `2e4a465` (Nest 12 / TS 6 / pnpm / Resend) and the `supermarket-products` feature. Nothing else from the branch is carried over.

**S4 — Land it on `main` through an intermediate branch.**
`main` is never deleted, rewritten, or force-pushed (user rejected the replace-`main` option). Deliverable: `integration/main-sync` pushed and a PR to `main`.

**S5 — No app behavior change; forced changes are reported, not absorbed.**
Anything the merge forces (dependency resolution, config shape, entity renames such as `cost` -> `stock`) is reported with evidence instead of being silently absorbed.

**S6 — Commit scope: app/config/test files only.**
`bruno/`, `.atl/` and `odd/` stay out of git (never `git add -A`; explicit paths only).

**S7 — Bruno cleanup: `email` must be a secret.**
> Bruno cleanup: only `bruno/`, `Sweet Home` collection; `email` must be a secret in the `sweet home` environment.

Root cause found: `vars:secret` entries are comma-separated; the previous edit wrote `token`/`email` without a comma, so Bruno never parsed `email` as a secret. Canonical form now on disk: `vars:secret [ token,\n  email ]`. No email value remains in the file. Bruno 4.1.0 (PID 37734) holds a stale in-memory buffer: reload the collection (or restart Bruno) before saving that environment, or the stale editor will overwrite the fix.

**S8 — Feature port: `src/api/supermarket-products/`, `main`'s aliases, real request user.**
The branch's feature lived at `src/supermarket-products/**` with raw `src/...` imports pointing at paths that no longer exist on `main`, and its service/controller were email-based. Port: move to `src/api/supermarket-products/`, rewrite imports to `main`'s aliases, and scope every query by the authenticated user.
Critical evidence: `AuthGuard` sets `request.user = <User entity>` (`id`, `name`, `email`) after `userService.findById(Number(payload.userId))`. The JWT payload carries `userId`, but `request.user` does **not** — so `user: { userId }` is `undefined` and the membership filter in TypeORM's `where` silently disappears. The feature therefore reads `user: { id: userId }`.

**S9 — The ported feature works end to end.**
Every endpoint must be exercised over real HTTP before this is called done. Two defects existed in the branch's feature and were fixed here (both reproduced, then re-verified):
1. `update()` never applied `cost` -> `PATCH` answered `200` while persisting nothing ("silently ignoring an explicit option with success").
2. `validateIfExist()` did not exclude the row being edited -> every `PATCH` answered `400 The product is already in this market`.

**S10 — Report every unexpected finding.**
Pre-existing defects found in `main` while integrating are reported with file-level evidence; they are **not** fixed here (unrequested behavior change):
- `user: { userId }` in `products.controller.ts` (5), `personal_markets.controller.ts` (5), `household_members.controller.ts` (2) is always `undefined` -> the membership filter is dropped -> cross-home read/write on those endpoints.
- `PersonalMarketsService.validateHome(personalMarketId, userId)` calls `getHouseInfo(home.id, userId)` with the **market** id, not the market's home id.
- `ProductsService.findOne(homeId, userId, id)` checks membership on `homeId` but looks the product up by `id` alone (another home's product can be referenced).

## Tasks

| ID | Task | Spec | Route | Status / evidence |
|----|------|------|-------|-------------------|
| I0 | Create `integration/main-sync` from `main` and start the merge | S4 | inline | **DONE** — HEAD `9995272`, `MERGE_HEAD=2e4a465` |
| I1 | Resolve the 12 mechanical conflicts in `main`'s favour | S2 | inline | **DONE** — `--ours` on homes/household_members/personal_markets/products/users; kept `main`'s `find-all.dto.ts`; `git rm` `src/auth/auth.service.ts` (DU) |
| I2 | Resolve `src/shared/mail/**` to the Resend version | S3 | inline | **DONE** — `mail.module.ts`, `mail.service.ts`, `mail.service.spec.ts`; templates at `src/shared/mail/templates/{invitation,send-code}.hbs` |
| I3 | Merge `package.json` by hand (both sides' deps) | S1, S2, S3 | inline | **DONE** — Nest 12/jest 30/TS 6/resend kept, `main`'s 4 eslint extras added, duplicate `moduleNameMapper` collapsed, `packageManager: pnpm` |
| I4 | Fix `tsconfig.json` (duplicate `paths` key) | S2, S3 | inline | **DONE** — one `paths` object: `main`'s aliases + `src/*`; no `baseUrl` |
| I5 | Resolve `src/app.module.ts`, both entities, `test/app.e2e-spec.ts` | S2, S3 | inline | **DONE** — `main`'s `TypeOrmModule.forRoot(typeOrm.config())` + `SupermarketProductsModule`; entities: imports only; e2e: relative `AppModule` import |
| I6 | Remove `package-lock.json` and `bun.lockb` | S1 | inline | **DONE** — both `D` in the index; reported |
| I7 | Move + port the feature to `src/api/supermarket-products/` | S3, S8 | inline | **DONE** — 6 files; `user: { id: userId }`; access-scoped queries in every method |
| I8 | Fix the two feature defects (`PATCH` cost / duplicate check) | S9 | inline | **DONE** — see L6, L7 |
| I9 | Verify: build, unit tests, boot probe, HTTP probe on a throwaway DB | S9 | inline | **DONE** — see L8, L9 |
| I10 | Commit (signed), push `integration/main-sync`, open the PR to `main` | S4 | inline | **DONE** — see L10 |

## Log

**L1 — User's request (verbatim, as recorded in the session summary):**
> "Regla de oro, no usar npm sino pnpm." · Mail: Resend, `MAIL_FROM` -> `RESEND_MAIL_FROM`. · Bruno cleanup: only `bruno/`, `Sweet Home` collection; `email` must be a **secret** (not var) in the `sweet home` environment. · No app-behavior change; forced changes must be reported, not absorbed. · Commit scope: app/config/test files only — `bruno/`, `.atl/`, `odd/` stay out of git.

**L2 — Decision: intermediate branch, not a rewrite of `main`.**
The user rejected deleting/recreating `main`. `main` is newer (`2024-08-05`) than `feature/supermarkets-products` (`2024-03-13`) and protected (`lock_branch`, 1 review, `enforce_admins: false`). Chosen: create `integration/main-sync` from `main`, merge the feature branch into it, PR that branch to `main`. Note: this does **not** avoid the conflicts — it only avoids rewriting `main`.

**L3 — Decision: `main`'s refactor wins.**
Where the two refactors overlap, `main`'s flat-tree -> alias version is kept. The intermediate branch does not change that.

**L4 — Finding: Bruno `email` secret.**
`vars:secret` is comma-separated (canonical example: `cura-life-bk/bruno/environments/dev.bru`). File on disk is authoritative; `bruno.db` only holds `_migrations`. Bruno 4.1.0 (PID 37734) keeps a stale buffer — reload before saving.

**L5 — Finding (blocking, fixed in the port): `user: { userId }` is always `undefined`.**
`AuthGuard` sets `request.user` to the `User` entity. The JWT payload has `userId`; the entity has `id`. The feature now reads `user: { id: userId }`. Proven by the probe: `POST {"market_id":2,...}` with user 1's token -> `404 Market 2 not found` (market 2 belongs to user 2). With `userId` undefined that filter is dropped and the call would have succeeded.

**L6 — Defect fixed (pre-existing in the feature): `PATCH` never persisted `cost`.**
Observed RED: `PATCH /1 {"cost":150}` -> `200 {"msg":"Product has been updated"}` and `GET /1` still `cost: 120`; the DB row kept `120`. `update()` assigned `market`/`product` but never `cost`. Fixed by applying `cost` when provided. GREEN: `PATCH /1 {"cost":150}` -> `200`, `GET /1` -> `cost: 150`, DB row `150`.

**L7 — Defect fixed (pre-existing in the feature): every `PATCH` answered `400`.**
Observed RED: `PATCH /1 {"cost":150}` -> `400 The product is already in this market`, because `validateIfExist(market, product)` matched the row being edited. Fixed with an `excludeId` argument (the current row never counts as a duplicate). GREEN: `PATCH /1 {"cost":150}` -> `200`; a genuine duplicate (`PATCH /2 {"product_id":1}` where market 1 + product 1 already exists) still -> `400`.

**L8 — Verification: build + unit tests.**
`pnpm build` -> exit 0, no output after `$ nest build`. `pnpm test` -> `Test Suites: 1 passed`, `Tests: 6 passed` (`src/shared/mail/mail.service.spec.ts`). Templates confirmed copied: `dist/shared/mail/templates/{invitation,send-code}.hbs` (`nest-cli.json` assets point at the new path).

**L9 — Verification: boot + HTTP probe on a throwaway DB.**
`main` ships zero unit tests, so the integration was verified with a real app against a disposable schema (`sweet_home_merge_probe`; the live `my_home` database was never touched). Boot created all 7 tables (`synchronize`), registered every route including the 5 `/api/supermarket-products` routes, and logged no errors. Fixtures: 2 users, 2 homes, 2 markets, 3 products (user 1 -> home A/market A/products 1-2; user 2 -> home B/market B/product 3). JWT minted with `JWT_SECRET` (payload `{userId}`). Observed, all as expected:
- `POST` create -> `201 {"msg":"product Leche has been add to market Market A"}`
- `POST` duplicate -> `400 The product is already in this market`
- `POST` product from another home -> `201 {"msg":"3 no exist"}` (strict scoping preserved)
- `POST` market from another home -> `404 Market 2 not found`
- `GET` list / `GET ?market_id=1` -> the row with its `market` relation
- `PATCH` cost -> `200` and persisted (`150`, then `99`); genuine duplicate -> `400`
- `GET`/`DELETE` as user 2 on user 1's row -> `404`; user 2's list -> `[]`
- no `Authorization` header -> `401`
- `DELETE` as user 1 -> `200`, row gone in the DB
Caveat recorded: `test:e2e` stays red for pre-existing reasons (it asserts `GET /` -> `Hello World!`, a route that does not exist, and `test/jest-e2e.json` has no alias mapper). It was not "fixed" here — no CI runs it.

**L10 — Findings reported, not fixed (S10):** the `user: { userId }` authorization bypass across `products`, `personal_markets` and `household_members`; the `validateHome` market-id/home-id mix-up; and `ProductsService.findOne`'s home-less product lookup. All three are pre-existing on `main` and were deliberately left untouched so the PR changes exactly what was asked.
