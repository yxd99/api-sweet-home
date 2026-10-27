# Fix: enforce household membership across products, personal-markets and household-members

Repo: `/Users/yxd/Projects/api-sweet-home` · Branch: `fix/authorization-home-scoping` (created from `main` @ `9995272`) · Runner: pnpm + jest · Delivery strategy: `ask-on-risk`

Origin: the defect was found while porting the `supermarket-products` feature (`odd/tasks/main-integration.md`, L5). It was **reported** in PR #5 instead of being fixed there, to keep that PR scoped to the modernization. This document covers the separate fix.

## Specs

**S1 — Close the cross-tenant hole.** A user who is not a member of a home must not read, create, update or delete that home's products, that home's personal markets, or that home's members; and must not be able to join it.

**S2 — Scope discipline.** Only household-membership enforcement. No refactors, no renames, no unrelated cleanups. Every behavior change is listed and reported, never absorbed.

**S3 — Evidence first.** The defect is reproduced over real HTTP **before** the change (RED), and the same requests are re-run **after** (GREEN), plus the owner's equivalent requests to prove there is no false denial. Assumptions about ORM behavior are not accepted as evidence.

**S4 — Deliverable.** One signed commit on a branch created from `main`, pushed, opened as its own PR to `main`. `main` is never rewritten.

**S5 — Report what is found but not fixed** — every adjacent defect stays in the report, with evidence, out of the diff.

## Root cause

`AuthGuard` resolves the token and assigns the **User entity** to `request.user`:

```ts
request.user = await this.userService.findById(Number(payload.userId)); // { id, name, email }
```

The JWT payload carries `userId`, but `request.user` does not. Every controller destructured `user: { userId }` -> `undefined`. `HomesService.getHouseInfo` builds its filter from that value:

```ts
where: { id: homeId, householdMembers: { user: { id: userId } } }
```

TypeORM drops `undefined` keys from a `where` clause, so the membership condition vanished and only `home.id` was enforced.

## Tasks

| ID | Task | Spec | Route | Status / evidence |
|----|------|------|-------|-------------------|
| A1 | Reproduce RED over HTTP on `main`'s stack | S3 | inline | **DONE** — see L2 |
| A2 | Controllers: `user: { userId }` -> `user: { id: userId }` (12 uses) | S1 | inline | **DONE** — `products` (5), `personal_markets` (5), `household_members` (2) |
| A3 | `PersonalMarketsService.validateHome`: validate the market's **home** | S1 | inline | **DONE** — was passing the market id to `getHouseInfo` |
| A4 | `PersonalMarketsService.update`: validate the target home when `homeId` changes | S1 | inline | **DONE** — was calling `validateHome(homeId)`, which expects a market id |
| A5 | `ProductsService.findOne`: look the product up inside the validated home | S1 | inline | **DONE** — see L4 |
| A6 | `ProductsService.remove`: validate the **product's home**, not the product id | S1 | inline | **DONE** — was passing the product id to `getHouseInfo` |
| A7 | `HouseholdMembersService.addMemberToHome`: require the caller to be a member | S1 | inline | **DONE** — the service never checked the caller, so self-invitation worked even with a valid id |
| A7 | Re-run GREEN + owner probes | S3 | inline | **DONE** — see L3, L4 |
| A8 | Commit (signed), push, PR to `main` | S4 | inline | **DONE** — see L5 |

## Log

**L1 — User's words (verbatim):** "Toma tu decision"

Context: the choice offered was to open a separate PR fixing the pre-existing `user: { userId }` bypass, or to continue with the dependency queue (E3) and leave it noted.

**L2 — Decision: fix it now, in its own branch from `main`.** Reasoning: the defect is not a misnamed property, it is a cross-tenant hole whose worst primitive is a takeover (a non-member can add itself to a home and then remove its owner). A separate branch from `main` lets this PR ship independently of the modernization PR, and `main` is left untouched. Reported findings alone never authorize scope expansion, but this is an explicit decision taken on the user's behalf, and it is reported as such.

**L2 — RED evidence (`main` @ `9995272`, Nest 10 + TypeORM 0.3, two users, throwaway DB).**
Owner of Home B, not a member of Home A, against Home A:

| Request | Result |
|---|---|
| `GET /products {homeId:1}` | `200` -> `[{"id":1,"name":"Leche"},{"id":2,"name":"Pan"}]` |
| `GET /products/1 {homeId:1}` | `200` |
| `POST /products {homeId:1,"name":"Intruso"}` | `201` `Intruso has been added to home Home A` |
| `PATCH /products/2 {"stock":777}` | `200` |
| `DELETE /products/1` | `200` — row gone |
| `GET /personal-markets {homeId:1}` | `200` — includes the owner's `email` |
| `GET /personal-markets/1` | `200` |
| `PATCH /personal-markets/1 {"name":"Robado"}` | `200` |
| `POST /household-members/invite-user {homeId:1}` | `500` **but** `household_members` row `(home 1, user 2)` was created -> self-joined Home A |
| `DELETE /household-members/delete-member {homeId:1,"emailGuest":"owner@example.com"}` | `200` — owner soft-removed from his own home |

**L3 — GREEN evidence (same requests, same stack, after the change).** All 11 cross-tenant requests -> `404 Home not found`, no write reached the database. Owner-side control set: `GET /products` -> `200 [Leche, Pan]`, `POST` -> `201`, `PATCH` -> `200`, `DELETE` -> `200`, `GET /personal-markets` -> `200`, `DELETE /personal-markets/2` (Home B's market) -> `404`, `DELETE /household-members/delete-member` (a real member) -> `200`. Final DB dump: the intruder's product absent, the owner's rows intact, the removed member soft-deleted.

**L4 — `findOne` scoping, verified in isolation.** `user1 GET /products/3 {homeId:1}` (product 3 belongs to Home B) -> `404 Id product 3 not exist`; `user2 GET /products/3 {homeId:2}` -> `200`. The product lookup is now bounded by the validated home.

**L5 — Reported, not fixed (S5).** Each one is pre-existing on `main`, adjacent to this change, and deliberately left out of the diff:
1. `PersonalMarketsService.update` never applies `name`: `PATCH /personal-markets/1 {"name":"Robado"}` answers `200` and changes nothing (observed in the RED dump). Same class of defect as the one fixed in the ported feature.
2. `products.controller` and `personal_markets.controller` read `homeId` from the **body** of `GET` requests (`FindAllDto`), which is unusual for a read and awkward for clients and caches.
3. `main` ships zero test files, so this fix is verified by the HTTP probe and not by a committed test; `test:e2e` is red at baseline (it asserts a `GET /` route that does not exist).
4. `tsconfig.build.tsbuildinfo` is produced by local builds and is not covered by `.gitignore` on `main`.
5. The app still needs `pnpm-workspace.yaml` (`allowBuilds`) to install with pnpm 11 on `main`; without it `pnpm install` fails on `ERR_PNPM_IGNORED_BUILDS` for `@nestjs/core` and `bcrypt`. Added locally, **not** committed here (it belongs to the modernization branch).

**L6 — Verification limits, stated honestly.** The probe requires a live MySQL and minted JWTs, so it is not committed as a jest test (there is no test infrastructure on `main` to extend). The fix was built and probed on `main`'s own stack (Nest 10 / TypeORM 0.3). The same controller/service bytes were also exercised on the modernized stack in `odd/tasks/main-integration.md` (L5, L9), so the fix is covered on both. TypeORM's `undefined`-in-`where` behavior is the same in both (both pin `typeorm ^0.3.17`).
