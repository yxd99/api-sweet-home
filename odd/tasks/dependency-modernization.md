# Dependency modernization — api-sweet-home

Repo: `/Users/yxd/Projects/api-sweet-home` · Branch: `feature/supermarkets-products` (own branch TBD) · Runner: pnpm + jest — **the repo had ZERO test files at baseline; E2b added the first one** · Delivery strategy: `ask-on-risk`

## Specs

**S1 — Remove npm from the repository; pnpm only.**
Status: **DONE and verified.**
Evidence: `package-lock.json` deleted; `package.json` sets `"packageManager": "pnpm@11.28.2"`; README install/run/test commands use pnpm; `rm -rf node_modules && pnpm install --frozen-lockfile` exits 0.
Prerequisite that had to be repaired first: `pnpm-workspace.yaml` with `allowBuilds` (bcrypt's native binding was never built, so password hashing was dead).

S2 — Update the repository's dependencies to current versions.
> User's exact words: "Quiero ahora actualizar el repo con dependencias actuales"
> Reaffirmed: "Pero yo queria actualizarlo, se hizo?"

Acceptance criteria:
- Every workstream below is either upgraded AND verified, or explicitly excluded with the user's approval. A remaining major gap must be a recorded decision, never an oversight.
- No stage is called done on the strength of the install alone.

Applicable checks (there is no test suite to lean on — 0 spec files):
- `pnpm build` exits 0.
- The app boots against the local MySQL container and serves its real routes (HTTP smoke).
- bcrypt hash + compare still work.
Any claim of "done" must name the command and its observed result.

S3 — Do not change the app's behavior.
Any behavior change forced by an upstream major (Express 5 middleware semantics, TypeORM query behavior, DTO validation, auth) gets reported to the user, not silently absorbed. No feature work, no refactors beyond what the bump requires.

## Tasks

| ID | Task | Spec | Route | Status |
|----|------|------|-------|--------|
| E0 | Capture pre-upgrade baseline + minimum smoke net (build, boot, real routes, bcrypt) | S2, S3 | inline | **DONE** (see L6) |
| E1 | NestJS 10 -> 11 (`core`,`common`,`platform-express`,`testing`,`cli`,`schematics`; `swagger` 7->11; `config` 3->4) | S2 | inline | **DONE** (see L7) |
| E2 | NestJS 11 -> 12 via the official `nest upgrade` schematic (`@nestjs/jwt` and `@nestjs/typeorm` bump by hand) | S2 | inline | **DONE** (see L10) |
| E2b | Mail transport: `@nestjs-modules/mailer` 3.0.2 + `nodemailer` 10.1.0 -> `resend` 6.32.1 (explicit user request) | S2, S3 | inline | **DONE** (see L11, L13) |
| E3 | Data layer: `typeorm` 0.3.31 -> 1.1.2; `mysql2` resolution unchanged at 3.24.5 (floor `^3.6.1` -> `^3.24.5`) | S2, S3 | inline | **DONE** (see L14, L15) |
| E4 | Runtime misc: `bcrypt` 5->6, `dotenv` 16->18, `reflect-metadata` 0.1->0.2, `class-validator` 0.14->0.15, `class-transformer`, `handlebars`. The `nodemailer` bump left this task: E2b removed the package entirely. | S2 | inline | **DONE** (see L17) |
| E4b | Unplanned, caused by E4's own verification: fresh installs died on `ERR_PNPM_IGNORED_BUILDS` for two transitive scripts (found in E3, L15). | S2 | inline | **DONE** (see L16) |
| E5 | Toolchain: `eslint` 8->10 (flat config), `@typescript-eslint` 6->8, `@types/node` 20->26, `prettier`, `supertest` 6->7. The `jest`/`ts-jest`/`@types/jest` part already landed in E2. | S2 | inline | **DONE** (see L18) |
| E6 | `typescript` — **CLOSED as not applicable**: TypeScript stays at 6.0.3 and no manifest changes. The 7.x line cannot be adopted (see L19), and the "5.9 -> 7.x" wording was stale at both ends. | S2, S3 | inline | **CLOSED — not applicable** (see L19, L20) |

Ordering rationale: framework majors first (they gate peer ranges), TypeScript last because it rewrites the compiler under the build and Nest's decorator metadata.

Known pre-existing debt carried alongside (NOT in scope, must not be "fixed" silently):
- "0 unit tests, `pnpm test` fails with 'No tests found'" is no longer true as of L11: `src/mail/mail.service.spec.ts` is the repo's first spec and `pnpm test` is green.
- `test/app.e2e-spec.ts` still fails to run: `test/jest-e2e.json` has no `moduleNameMapper` for the `src/*` alias, and the test asserts `GET /` -> 200 while the app only serves `/api`. Both pre-date this work.
- 17 prettier errors; the `lint` script carries `--fix`, so running it rewrites source files.

## Log

L1 — User's original request, verbatim:
> "Quiero ahora actualizar el repo con dependencias actuales y quiero que elimines el uso de npm, solo pnpm y derivados"

L2 — Progress on S1 (npm removal), verified:
- `package-lock.json` deleted (tracked since commit `ad23631`, 2023-11-28).
- `"packageManager": "pnpm@11.28.2"` added to `package.json`.
- README switched to pnpm commands.
- `pnpm-workspace.yaml` created: `allowBuilds: { bcrypt: true, '@nestjs/core': false }`.
- Found and fixed a latent breakage: `require('bcrypt')` threw `Cannot find module '.../bcrypt_lib.node'` — password hashing was dead because pnpm 10/11 blocks dependency build scripts by default. Fix verified: hash + verify both work.
- pnpm 11 note: `onlyBuiltDependencies` is a legacy key that pnpm deletes and rewrites as `allowBuilds`; declaring it silently does nothing.
- Verified: `rm -rf node_modules && pnpm install --frozen-lockfile` exit 0; `pnpm build` exit 0; host-side connection as `yxd` to `my_home` on 127.0.0.1:3306 works and DDL is permitted.
- Not committed (no commit was requested).

L3 — Baseline captured before any bump (Node v26.5.0, pnpm 11.28.2):
- `pnpm build` -> exit 0.
- `pnpm test` -> exit 1, zero `*.spec.ts` exist (jest `rootDir: src`).
- `pnpm test:e2e` -> exit 1, `test/app.e2e-spec.ts` fails to run.
- `eslint` -> exit 1, 17 pre-existing prettier errors.
- Installed: Nest `10.4.22` (`common`/`core`/`platform-express`/`testing`), `platform-express` 10.4.22, `cli` 10.4.9, `schematics` 10.2.3, `swagger` 7.4.2, `config` 3.3.0, `jwt` 10.2.0, `typeorm` 0.3.31, `bcrypt` 5.1.1, `typescript` 5.9.3, `eslint` 8.57.1, `jest` 29.7.0. Node v26.5.0.
- Every dependency is at least one major behind (`pnpm outdated`: NestJS 12.1.3, swagger 12.0.2, typeorm 1.1.2, eslint 10.12.0, jest 30.5.2, typescript 7.0.2, bcrypt 6.0.0, nodemailer 10.1.0).

L3b — User clarified intent, verbatim:
> "Pero yo queria actualizarlo, se hizo?"

Answer given: no. When asked how far to go, the selected answer was "Nada por ahora", so only S1 was applied. Work on S2 now resumes with the user's confirmation.

L4 — Local environment prepared for verification:
- MySQL container `mysql-my-home` (image `mysql:8` -> MySQL 8.4.11), published on `127.0.0.1:3306`, volume `mysql-my-home-data`, `restart=unless-stopped`.
- Matches `.env`: `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_NAME=my_home`, `DB_USER=yxd`; the DB password in `.env` equals the container one (trailing period included, verified: without the period the connection is denied with `ER_ACCESS_DENIED_ERROR`).
- `yxd` has DDL rights on `my_home`, so `synchronize: true` (`src/app.module.ts:40`) will create the schema on first boot. `my_home` starts empty.

L5 — Open decisions to settle before the first commit:
- Which branch: `feature/supermarkets-products` is unrelated to this migration; a dedicated branch is preferable.
- Commit policy: the repo's standing rule is "no commits unless explicitly asked", while per-stage work-unit commits are how this migration stays attributable. Not yet resolved.
- Whether E5/E6 (ESLint flat-config rewrite, TypeScript 7) are in scope at all — they are toolchain rewrites rather than app dependencies.

L6 — E0 executed. Baseline smoke captured BEFORE any bump (Nest 10.4.22, Node v26.5.0, MySQL 8.4.11), these exact strings are what E1 was compared against:
- `pnpm start` -> `Nest application successfully started`, 24 routes mapped.
- `GET /api` (Swagger UI) -> 200.
- `GET /api/products` with no token -> 401 `{"message":"Unauthorized","statusCode":401}` (global guard live).
- `GET /api/products/123` -> 401 (param routing matches).
- `POST /api/auth/login` with `{}` -> 400 `{"message":["email must be an email","code must be shorter than or equal to 4 characters","code must be longer than or equal to 4 characters","code must be a string"],"error":"Bad Request","statusCode":400}`.
- `GET /api/no-existe` -> 404 `{"message":"Cannot GET /api/no-existe","error":"Not Found","statusCode":404}`.
- First boot created the schema through `synchronize: true`: 6 tables in `my_home` (`users`, `homes`, `household_members`, `products`, `supermarket_products`, `personal_markets`).

L7 — E1 executed (NestJS 10 -> 11). Outcome: verified, and it needed ZERO source changes.
- Bumped: `@nestjs/common`/`core`/`platform-express`/`testing` 10.4.22 -> 11.2.7, `cli` 10.4.9 -> 11.0.24, `schematics` 10.2.3 -> 11.1.0, `config` 3.3.0 -> 4.0.4, `swagger` 7.4.2 -> 11.4.7, `typeorm` 10.0.2 -> 11.0.2 (the `@nestjs/typeorm` wrapper; `typeorm` itself stays 0.3.31 for now), `jwt` 10.2.0 -> 11.0.2, `@types/express` 4.17.25 -> 5.0.6.
- First install pass exited 1 with `ERR_PNPM_IGNORED_BUILDS` for `@scarf/scarf`, reached transitively through `swagger-ui-dist` (its only script posts anonymous install telemetry). Declared `'@scarf/scarf': false` in `pnpm-workspace.yaml`; install then exited 0. Identical failure mode to the original bcrypt breakage: one unlisted blocked script fails the whole install.
- `pnpm peers check` -> "No peer dependency issues found". `@nestjs-modules/mailer` 1.11.2 carries no peer conflict against Nest 11.
- `pnpm build` -> exit 0.
- Re-ran the exact L6 probes: identical status codes and byte-identical bodies (Swagger 200, 401, 400 with the same four messages, 404 same shape, query string intact), 24 routes mapped, app up in 4s.
- Express 5 (new default in v11) required no adjustments here: the app declares no wildcard routes and no middleware, so the named-wildcard and query-parser changes do not reach it.

L8 — Discovery that reshapes E2 and E6 (decision required):
- NestJS 12 packages are ESM-only. A CommonJS app consumes them through `require(esm)`, so the Node floor is >= 20.19 (or >= 22.12 on the 22.x line). Running Node 26.5.0 satisfies it, but Jest can `require()` the ESM-only v12 packages only on Node >= 24.9.
- The CLI now ships `nest upgrade`, which performs the 11 -> 12 migration mechanically: it bumps every recognized `@nestjs/*` package, migrates `nest-cli.json` off the deprecated webpack options, moves `@nestjs/config` library options under `validationOptions.libraryOptions`, and as part of the same step bumps TypeScript to v6 and Jest to v30. It must be run from a v11 project, which is exactly where E1 leaves us. It prompts about `@nestjs/observe` unless `--observe`/`--no-observe` is passed; `--dry-run` previews everything without touching files.
- Conflict against a clean "latest of everything": the newest published TypeScript is 7.0.2, but Nest 12's CLI and schematics require TypeScript 6. E6 as written ("typescript 5.9 -> 7.x") is therefore not satisfiable together with Nest 12's supported toolchain. E6 must be rewritten before it runs, and the choice is the user's.
- Also folded into the 11 -> 12 step by the official tool: Jest 29 -> 30 and `@types/jest`/`ts-jest` to matching releases, which pulls E5's Jest portion forward into E2.

L9 — E1 evidence closed on the Swagger contract, which is the part a 4-major `@nestjs/swagger` jump (7.4.2 -> 11.4.7) could silently damage:
- `GET /api-json` -> 200, and the document parses as a complete OpenAPI 3.0.0 spec: `title: Api My Home`, `version: 1`.
- 12 paths / 24 operations, exactly matching the 24 routes the boot log maps. No route was dropped or renamed.
- 12 schemas, one per DTO: `sendOtpCodeDto`, `LoginDto`, `CreateHomeDto`, `UpdateHomeDto`, `CreateHouseholdMemberDto`, `DeleteHouseholdMemberDto`, `CreatePersonalMarketDto`, `UpdatePersonalMarketDto`, `CreateProductDto`, `UpdateProductDto`, `CreateSupermarketProductDto`, `UpdateSupermarketProductDto`. Decorator metadata still reflects correctly.
- `securitySchemes` is empty. This is pre-existing, not a v11 regression, but worth knowing: the global guard enforces 401 at runtime while Swagger advertises no auth scheme, so the generated spec understates the auth requirement.
- E1 therefore closes with the HTTP contract, the OpenAPI contract, and the build all verified.

L10 — E2 executed (NestJS 11 -> 12). Outcome: verified, and it needed ZERO changes to application source.
- Driver: the official `nest upgrade` schematic (local `@nestjs/cli` + `@nestjs/schematics` at v12), run as `nest upgrade --no-observe`. It bumps every recognized `@nestjs/*` package, migrates `nest-cli.json` off the deprecated webpack options, and folds TypeScript 6 + Jest 30 into the same step.
- It does NOT touch `@nestjs/jwt` or `@nestjs/typeorm`; both were bumped by hand to 12. Installed: `common`/`core`/`platform-express`/`testing` 12.1.3, `cli` 12.0.8, `schematics` 12.0.7, `config` 12.0.1, `swagger` 12.0.2, `typeorm` 0.3.31 (still pending in E3), `typescript` 6.0.3, `jest` 30.5.2, `ts-jest` 29.4.14, `@types/jest` 30.0.0.
- The tsconfig had to migrate for TS 6 + ESM-only v12:
  - `module`/`moduleResolution` -> `nodenext`.
  - `baseUrl` -> `paths: { "src/*": ["src/*"] }`. TS 6 turns `baseUrl` into a hard ERROR (TS5101), not a warning.
  - `types: ["node", "jest"]`. Under TS 6 the `@types/jest` globals stop being resolved implicitly and the compiler asks for the explicit `types` entry (TS2593/TS2304 on `describe`/`it`/`expect`). Reproduced with plain `tsc`, so it is TS 6 behaviour, not a ts-jest one.
  - `tsconfig.build.json` gained `rootDir: ./src`.
- Verified: `pnpm build` exit 0; `pnpm peers check` -> "No peer dependency issues found"; 24 routes mapped; every L6 probe byte-identical (Swagger 200, 401, 401, 400 with the same four messages, 404); OpenAPI still 12 paths / 24 operations / 12 schemas; the alias is still rewritten on emit (0 `require("src/...")` in `dist`).

L11 — E2b executed: the mail transport moved off nodemailer/SMTP. User's request, verbatim:
> "Quiero pasar de nodemailer a resend, migralo"

- Dependencies: removed `@nestjs-modules/mailer` 3.0.2 and `nodemailer` 10.1.0 (189 packages pruned), added `resend` 6.32.1. `resend` ships a dual CJS/ESM build (`dist/index.cjs` + `dist/index.mjs`), so this CommonJS app consumes it without `require(esm)`. `handlebars` 4.7.10 stays a direct dependency: the `.hbs` templates are still rendered locally and unchanged, including the nest-cli asset copy to `dist/mail/templates`.
- `src/mail/mail.service.ts` rewritten. Same two public methods (`sendCode`, `inviteUser`), same subjects, same template context. It now builds the Resend client lazily from `RESEND_API_KEY`, reads `MAIL_FROM`, renders the template and calls `emails.send({ from, to, subject, html })`. Lazy construction keeps the old failure mode: the app boots with no mail configuration and only fails when a send is attempted.
- Failure semantics that mattered: the Resend SDK does **not** throw — it returns `{ data, error }`. Without an explicit check, a rejected message would look like a successful send. It now throws.
- Deliberate contract decision: the provider cause is logged through `Logger.error` while the HTTP response stays generic (`{"message":"Internal Server Error","statusCode":500}`), which is what the SMTP transport produced for a non-HttpException. The first implementation put `API key is invalid` in the response body; the live probe caught it and it was fixed.
- `.env`: `MAIL_HOST`/`MAIL_USER`/`MAIL_PASSWORD` removed; `RESEND_API_KEY` (left empty for the user to fill) and `MAIL_FROM` added. Both are documented in the README, including that `onboarding@resend.dev` is Resend's test sender that only delivers to the Resend account owner.
- First test in the repo: `src/mail/mail.service.spec.ts`, 4 cases — code template interpolation, invitation interpolation, payload shape (`from`/`to`/`subject`/`html`), a Resend error throws instead of passing silently, and the provider cause reaches the log.
- Test infrastructure that had to be repaired for ANY test to run on Nest 12 (all pre-existing gaps, inert until a spec existed):
  - Jest 30 can `require()` the ESM-only `@nestjs/*` v12 only when `vm.SourceTextModule` exists, i.e. when jest runs with `--experimental-vm-modules`. `NODE_OPTIONS=--experimental-vm-modules` added to the `test`, `test:watch`, `test:cov` and `test:e2e` scripts. Node 26.5.0 alone is not enough: `process.features.require_module` is true, but jest-runtime gates the sync path on its own `supportsSyncEvaluate` check.
  - `tsconfig.spec.json` (extends `tsconfig.json`, `isolatedModules: true`, `rootDir: ./src`) wired into the jest transform. Without it ts-jest warns TS151002; putting `isolatedModules` in the shared tsconfig instead breaks the run with TS5011, so it lives in its own file and the app build is untouched.
  - `moduleNameMapper: { "^src/(.*)$": "<rootDir>/$1" }`: jest cannot resolve the `src/*` alias by itself. Proven by importing `src/mail/mail.service` in the spec (the style the rest of the codebase uses) — it fails without the mapper.
  - `test/app.e2e-spec.ts`: `import * as request from 'supertest'` -> `import request from 'supertest'`. `nodenext` implies `esModuleInterop`, which makes the namespace import non-callable (TS2349) and had left `tsc --noEmit` with exactly 1 error.
- Verified evidence:
  - `pnpm test` -> 4/4 pass at this point; 6/6 once L12 added the client-body and missing-config cases.
  - `pnpm exec tsc --noEmit` -> 0 errors.
  - `pnpm build` -> exit 0; `dist/mail/templates/{send-code,invitation}.hbs` present.
  - `pnpm peers check` -> "No peer dependency issues found"; `pnpm why nodemailer` and `pnpm why @nestjs-modules/mailer` -> empty.
  - Live boot with NO SMTP variables left and a throwaway key only in the process env (`RESEND_API_KEY=re_probe_fake_key_not_real node dist/main`): 24 routes, `/api` 200, `/api/products` 401, `/api/products/123` 401, `POST /api/auth/login {}` 400 with the same four messages, `/no-existe` 404.
  - `POST /api/auth/send-code` reached the real Resend API end to end: response `{"message":"Internal Server Error","statusCode":500}` and the server log carries `ERROR [MailService] Resend rejected the email to <addr>: API key is invalid`.
  - Honest gap: the SUCCESS path was never exercised. It needs a real API key and a verified domain; only the unit tests cover the success payload.
- Also fixed: `.gitignore` gained `*.tsbuildinfo` (`incremental: true` in tsconfig makes it a generated artifact).
- Security note: the removed `MAIL_PASSWORD` (Gmail app password) was printed into the session log by a masked-grep check whose pattern matched `.env`. The app no longer uses it, but it should be revoked in the Google account.
- Not committed.

L12 — E2b independent verification (`gentle-ai-verify`, fresh context, read-only, no fixes applied).

- Verdict: **S2 met, S3 met. Zero blockers. Four advisories.** Three were fixed inside E2b, the fourth is informational.
  1. The test named "keeps it out of the client-facing error" asserted the log but said nothing about the body — the verifier found the hole by mutating `fail()` to `new InternalServerErrorException(cause)` and watching the suite still pass 4/4. The discovery was independent and correct. Fixed: the test now asserts `getResponse()` is exactly `{ message: 'Internal Server Error', statusCode: 500 }` and that the provider text is absent, plus two `it.each` cases for a missing `RESEND_API_KEY` / `MAIL_FROM`. Re-ran the same mutation: 3 failed; reverted: 6 passed. The suite can now catch the regression L11 claims to have fixed.
  2. `handlebars.compile(source)` had silently dropped the `strict: true` option the removed `HandlebarsAdapter` was configured with, so a missing template variable would render empty instead of throwing. Unreachable with today's callers, but it is a real loss of behavior. Restored to `handlebars.compile(source, { strict: true })`.
  3. `test:debug` was missing `NODE_OPTIONS=--experimental-vm-modules`, so the new spec could not load under that script. Added.
  4. `pnpm-lock.yaml` is still untracked, so `pnpm install --frozen-lockfile` is not yet reproducible from the repo. This is the pending branch/commit decision, not a defect; the lockfile lands with the change.
- What the verifier proved beyond the parent's own checks: it exercised `inviteUser` — the path the parent never reached over HTTP — directly against the compiled `dist/mail/mail.service.js`, showing it renders `dist/mail/templates/invitation.hbs` and reaches the real Resend API with the generic exception and the logged cause. It also re-ran the live `send-code` probe independently and re-derived the baseline comparison from the strings recorded in L6/L7/L10 (it could not rebuild a Nest 10 baseline, and said so instead of faking it).
- Still unverified by anyone: the SUCCESS path. A real API key plus a verified domain is required, and neither is available in this environment.
- Suggested by the verifier and deliberately NOT adopted (extra harness nobody asked for): a `test:dist` script exercising the compiled artifact, and an optional HTTP e2e pinning the mail contract. Both remain available in the verification session (`ses_ec7a34636ffeGcgX59EknxSTwA`) if a deterministic compiled-artifact test is wanted later.
- Re-verified after the fixes: `pnpm test` 6/6, `pnpm exec tsc --noEmit` 0 errors, `pnpm build` exit 0, live boot with 24 routes and every L6 probe unchanged, `send-code` still a generic 500 with the cause only in the log, OpenAPI still 12 paths / 24 operations / 12 schemas.

L13 — Naming correction requested by the user, verbatim:
> "para MAIL_FROM pasalo a RESEND_MAIL_FROM para tener la nomenglatura"

- `MAIL_FROM` -> `RESEND_MAIL_FROM`, so both mail variables now carry the provider prefix (`RESEND_API_KEY`, `RESEND_MAIL_FROM`).
- Touched: `src/mail/mail.service.ts` (the `ConfigService.get` key and the "not set" log message), `src/mail/mail.service.spec.ts` (the config fixture and the `it.each` cases), `.env`, `README.md`.
- L11 and L12 above still call it `MAIL_FROM`: that was its name at the time they were written. Nothing in `src/`, `.env` or `README.md` uses the old name now.
- Verified: `pnpm test` 6/6; `pnpm exec tsc --noEmit` 0 errors; `pnpm build` exit 0; the compiled `dist/mail/mail.service.js` reads `RESEND_MAIL_FROM`; live boot with 24 routes and every L6 probe unchanged; and `POST /api/auth/send-code` still reaches the real Resend API (log: `API key is invalid`) instead of reporting the variable as missing — which is exactly what proves the new name is the one being read.
- Deployment consequence: any environment that already sets `MAIL_FROM` must rename it, or a send fails loudly (generic 500 to the client, cause in the server log).

L14 — E3 executed: `typeorm` 0.3.31 -> 1.1.2, `mysql2` resolution unchanged at 3.24.5 (branch `deps/typeorm-1x-mysql2`, from `37d0d19`).

**Change surface** (official 0.3 -> 1.0 guide, every item checked against the code; 16 edits in 6 files):
- Array-of-strings `relations` removed. 15 sites converted to the object form: `['home']` -> `{ home: true }`; `['householdMembers', 'householdMembers.user']` -> `{ householdMembers: { user: true } }`; `['home','home.householdMembers','home.householdMembers.user']` -> `{ home: { householdMembers: { user: true } } }`; `[]` -> `{}`. Files: `products.service.ts` (4), `personal_markets.service.ts` (4), `homes.service.ts` (2), `supermarket-products.service.ts` (3), `auth.service.ts` (1), `household_members.service.ts` (2 - one of these is the `.exist` site).
- `Repository.exist()` removed. 1 site, `household_members.service.ts:71` -> `.exists()`.
- `invalidWhereValuesBehavior` now defaults to **throw** for `undefined`/`null` inside a `where`; 0.3 silently dropped them. No source change made, reported instead (see below).
- Nothing else in the guide reaches this code: no `findOneById`/`findByIds`, no global `getRepository`/`getConnection` (`users.service.ts` uses the `Repository` instance method), no `EntityRepository`/`AbstractRepository`/`RelationCount`, no string `select`, no `join` option, no `printSql`/`onConflict`/`orUpdate`/`setNativeParameters`/`useIndex`, no `readonly` column option, no `width`/`zerofill`. No relation is declared `nullable: false`, so the INNER JOIN change is inert here.
- Compatibility checked before installing: `@nestjs/typeorm` 12.0.2 declares `^0.3.0 || ^1.0.0-dev`, so 1.1.2 satisfies it (only v10 and v11.0.0 crash at startup). `typeorm@1.1.2` is dual CJS/ESM, so this CommonJS app `require`s it without `require(esm)`. Its `mysql2` peer `^3.15.3` is satisfied by 3.24.5. `typeorm@1.1.2` engines are `^20.19.0 || ^22.13.0 || >=24.11.0` - satisfied by Node 26.5.0.

**Verification: A/B/C transcripts, not status codes.** `$TMPDIR/opencode/e3-probe.sh` boots the app from `dist` against a scratch DB and records, in fixed order: the version banner; `SHOW CREATE TABLE` for every table after `synchronize`; an HTTP suite (unauth, full auth via OTP read from MySQL, homes, products, personal-markets, supermarket-products, household-members invite/delete); the MySQL state before and after the destructive cases (FK deletes, `softRemove`); and the boot log's route list and `ERROR` lines. Output is normalized (JWTs, timestamps, `AUTO_INCREMENT`) so two runs are byte-comparable, with one run-to-run flake documented below.
- **A** = 0.3.31 + original code. **B** = 0.3.31 + converted code. **C** = 1.1.2 + converted code, captured with `mysql2@3.24.5` (the shipped state) and with `3.24.6`: those two transcripts are identical except the version banner.
- **B is byte-identical to A**, so the 16 source edits alone change nothing on the old version. That is what separates "my edit broke it" from "the version changed it".
- **C differs from A in exactly two HTTP cases plus their DB aftermath.** DDL identical, 26 routes identical, every other endpoint identical.

**S3 behavior changes (forced upstream, reported not absorbed):**
1. `POST /api/auth/refresh-token` with no `refresh-token` header: **201 `{refreshToken:...}` -> 500**. On A the `undefined` was dropped from the `where`, which matched the first enabled token row, and a refresh token was minted for it.
2. `POST /api/auth/disable-tokens` with no headers: **201 `{"msg":"tokens has been disables"}` -> 500**. On A the same dropping happened and the call really did disable the first enabled row (`auth.id=1`, `isEnable` 1 -> 0 observed); on C the row is untouched.
Both are the documented default. Observed message: `TypeORMError: Undefined value encountered in property 'Auth.token' of a where condition. Set 'invalidWhereValuesBehavior.undefined' to 'ignore' in connection options to skip properties with undefined values.`
Not chosen here (the user's call): leave 1.x semantics and fix the callers, or restore the old silence with `invalidWhereValuesBehavior: { undefined: 'ignore' }` - which would also restore the wrong-row match, so it is not recommended.
The only other diff is which row ends up disabled in `auth`, and it follows from the two above: on A, step 4 disabled row 1, so step 5's lookup (`where: {..., isEnable: true}`) matched nothing and returned no token; on C the row stayed enabled, so step 5 minted a token byte-identical to an earlier row (same `{userId}`, same second, so the same JWT string) and the later legitimate disable matched whichever of the two identical rows the DB picked.
That last line is **not** version-dependent, and it is the one place where two runs of the same tree can differ: on the same 1.1.2 + 3.24.5 tree, run 2 and run 3 differ from each other in exactly those rows (2/5/6 flip), and run 1 vs run 2 flips 5/6. It is a probe property (two rows minted in the same second carry byte-identical JWTs), so the version comparison is done with the `jwt` line region masked out: masked, the `3.24.5` and `3.24.6` transcripts differ only in the banner line, and baseline-vs-1.x differ only in the two endpoints above plus `lineas ERROR: 6 -> 8`.

**Advisories found while setting up (pre-existing, not E3):**
1. `.env` has no `JWT_ACCESS_TOKEN_EXPIRY` / `JWT_REFRESH_TOKEN_EXPIRY`. `JwtModule` therefore passes `signOptions.expiresIn: undefined`, and `jsonwebtoken@9.0.2` **throws** for an explicitly-undefined `expiresIn`. Reproduced in isolation against the installed copy: `undefined`, `''` and `null` all threw `"expiresIn" should be a number of seconds or string representing a timespan`; only `'1h'` signed. Consequence: `POST /api/auth/login` is a 500 in this environment, on 0.3.31 as much as on 1.x. The probe passes both variables in the process env so the auth flow can run; `.env` was not modified.
2. `RESEND_API_KEY` is empty in `.env`, so `send-code` is a 500 with `RESEND_API_KEY is not set` (expected since E2b). The OTP row is persisted before the mail call, which is why login can still be exercised.

**Environment note:** the MySQL user in `.env` has grants only on `my_home` and cannot create databases. A scratch `e3_probe` DB was created and granted through the container's own root env var, so the probe never touches app data; `my_home` was left alone.

**Checks:** `pnpm install --frozen-lockfile` exit 0 (a no-op run; the fresh-install case is in the L15 advisory); `pnpm exec tsc --noEmit` exit 0; `pnpm test` 6/6; `pnpm build` exit 0; probe A/B/C as described, plus the 3.24.5-vs-3.24.6 transcript pair; `prettier --check` clean for the 6 changed source files and for `package.json`/`pnpm-workspace.yaml` (2 unrelated files already fail, and `pnpm-lock.yaml` already failed prettier at `origin/main`, so it was left alone); `eslint` on the changed files reports nothing (the 8 remaining errors are all pre-existing, in files E3 does not touch).
**Files committed:** `package.json`, `pnpm-lock.yaml`, and the 6 files under `src/api/`. After L15 `pnpm-workspace.yaml` is byte-identical to `origin/main`, so it is not part of the change. No new test file: for a version bump the probe A/B/C transcript is the evidence, and the existing suite already covers behavior. `odd/`, `bruno/` and `.atl/` stay out of git per the standing rule.
**Forced config change: none in the final state.** While `mysql2@3.24.6` was pinned, pnpm wrote `minimumReleaseAgeExclude: [mysql2@3.24.6]` into `pnpm-workspace.yaml` because pnpm 11 defaults `minimumReleaseAge` to 1440 minutes (24h). L15 removed both the pin and the entry, and `pnpm install --frozen-lockfile` then passes the policy check with no exclusion at all.

**Commit:** `a83b4b2` on `deps/typeorm-1x-mysql2` - `chore(deps): upgrade typeorm to 1.x`, signed, 9 files, +99/-101.

**Native review of this candidate: blocked by the environment, not by the change.** Flow so far: `review assess --base-ref 37d0d19 --committed-only` -> `risk: high`, `review_due_reason: high_risk` -> STATUS preflight -> START -> consent envelope (`high`, 9 files, 200 lines) -> the user granted it -> transaction frozen and `reviewing`. Then all three lens Tasks failed identically:
`opencode_review_transport_relay_refused (reason: provider_failed)`.
Root cause found in the runtime log, not in gentle-ai: every OpenCode Task child in this session fails with `OpenCode's free tier can only be used from within OpenCode`. Confirmed with a plain `gentle-ai-explore` probe (the child session `ses_ec5d13e6dffecIJiVSmbSzFuX4` died before running any tool, with the same message). The reviewer agents declare no `model`, so they inherit the session model (`opencode/big-pickle`), and that provider refuses child sessions.
Consequences: no receipt, nothing approved, delivery not affected; `review-risk`/`review-resilience`/`review-reliability` remain offered for the same frozen binding. Delegation (explore/worker/verify) is equally unavailable in this session, so E3 was and stays inline.
Re-entry once a working model is configured for the reviewer agents (this is the frozen binding's own re-entry command):
`gentle-ai review status --contract=gentle-ai.review-integration/v2 --next-transition=true --lineage=review-0ef879768a7fec26 --repository-context=rctx2_5a3323dac7a24c7b15a9d73a6484867740037930861ac8af1964b58b4eeba03a --agent=opencode --base-ref=8b049d7334d7a3db3194a81d2e1b628b72ca82fe --committed-only=true`


L15 — User decision, verbatim: "Si, vamos". It answered the question in L14: should `mysql2` stay pinned to 3.24.6 (which only needed the exception because pnpm 11 defaults `minimumReleaseAge` to 1440 minutes = 24h), or drop a version?

Changes (made to the E3 commit, which was amended):
- `package.json`: `mysql2` floor `^3.6.1` -> `^3.24.5`. The resolved version is 3.24.5, the same the lock already had; 3.24.6 is dropped.
- `pnpm-lock.yaml`: `mysql2@3.24.5` (`specifier: ^3.24.5`).
- `pnpm-workspace.yaml`: exclusion removed - now byte-identical to `origin/main`, so it leaves the E3 diff (9 files -> 8).
- Commit `a83b4b2` amended to **`f13acf6`** (signed, 8 files, +92/-96).

Evidence:
- `pnpm install --frozen-lockfile` passes the supply-chain policy with no exclusion entry; nothing in the lock resolves to `mysql2` 3.24.6.
- `pnpm exec tsc --noEmit` exit 0; `pnpm test` 6/6; `pnpm build` exit 0.
- Probe re-run on the shipped bytes: masked against the 1.1.2 + 3.24.6 transcript it is **identical**; masked against the 0.3.31 baseline it shows the same two endpoint diffs and the same `lineas ERROR` 6 -> 8 as L14. So dropping to 3.24.5 changes nothing observable and E3's conclusion stands unchanged.

Advisory (pre-existing, NOT introduced by E3): a *fresh* install of `origin/main` exits 1 with `[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: @parcel/watcher@2.6.0, unrs-resolver@1.12.2`. Reproduced by dumping `origin/main`'s `package.json`, `pnpm-lock.yaml` and `pnpm-workspace.yaml` into an empty directory and running `pnpm install --frozen-lockfile` there (same two packages, same exit 1). Both are transitive and do carry scripts (`@parcel/watcher`: `install: node scripts/build-from-source.js`; `unrs-resolver`: `postinstall: node postinstall.js`), and neither is named in `allowBuilds` - whose own comment warns that an unlisted blocked script fails the whole install. Fix not applied (the user decides): name both in `allowBuilds` with `false`, the same convention as `@nestjs/core` and `@scarf/scarf`.

Effect on the pending native review: the frozen binding in L14 pointed at the pre-amend candidate, so it is now stale. Nothing was approved and no receipt exists; reviewing the current candidate needs a fresh START.

L16 — Fresh installs unblocked (closes L15's advisory). User's answer, verbatim: "Si", to the question "¿Sumo @parcel/watcher y unrs-resolver con false a allowBuilds (2 líneas) para destrabar la instalación limpia, y arranco E4?"

Where it was committed: a **new branch `deps/runtime-misc`, created from `f13acf6`** (E3's HEAD) and not from `origin/main`. Reason: E3 is committed but not pushed or merged, and E4 has to be built and verified on the tree that actually ships; branching from `origin/main` would have reverted the whole `typeorm` 1.x migration out of the working tree. This makes the branch a stack on top of E3, so a later rebase onto `main` (after E3 lands) is what isolates E4's diff if separate PRs are wanted.

Change: `pnpm-workspace.yaml` +8 lines. `@parcel/watcher: false` and `unrs-resolver: false` now appear under `allowBuilds`, the same convention as `@nestjs/core` and `@scarf/scarf`. Both use `false` (not `true`) because neither script is wanted here - `node scripts/build-from-source.js` and `node postinstall.js` respectively, while the prebuilt binaries arrive as optional dependencies, which is already how they are consumed today. What mattered was naming them: pnpm fails the whole install for an unlisted blocked script.

Evidence:
- Clean directory with `package.json` + `pnpm-lock.yaml` + the patched `pnpm-workspace.yaml`: `pnpm install --frozen-lockfile` -> **exit 0**, "Done in 3.4s using pnpm v11.28.2". The same directory with `origin/main`'s three files exited 1 with the same two packages (reproduced in L15).
- `prettier --check pnpm-workspace.yaml` -> clean.
- Commit: **`88c9820`** "fix(pnpm): declare the two transitive build scripts pnpm blocks" (signed ED25519, 1 file, +8).

L17 — E4 executed (branch `deps/runtime-misc`, stacked on E3).

Versions bumped in `package.json`:

| package | before (range -> resolved) | after (range -> resolved) |
|---|---|---|
| `bcrypt` | `^5.1.1` -> 5.1.1 | `^6.0.0` -> 6.0.0 |
| `class-validator` | `^0.14.0` -> 0.14.x | `^0.15.1` -> 0.15.1 |
| `dotenv` | `^16.3.1` -> 16.6.1 | `^18.0.7` -> 18.0.7 |
| `reflect-metadata` | `^0.1.13` -> 0.1.x | `^0.2.2` -> 0.2.2 |
| `handlebars` | `^4.7.8` -> 4.7.10 | `^4.7.10` -> 4.7.10 |
| `class-transformer` | `^0.5.1` -> 0.5.1 | **unchanged** |

- `class-transformer` has no newer release: 0.5.1 is still the latest, so the item was checked rather than skipped.
- `handlebars` already resolved to 4.7.10 (`^4.7.8` allows it), so only the floor moved. The installed copy does not change.

`bcrypt` 6.0.0 is a native-addon change, not just a version: the install script went from `node-pre-gyp install --fallback-to-build` to `node-gyp-build`, the dependencies are `node-addon-api ^8.3.0` + `node-gyp-build ^4.8.4`, and the engine floor is Node >= 18 (this environment is on v26.5.0). The existing `allowBuilds: bcrypt: true` entry is still exactly what is needed, because the install script still exists under the same package name.

**Forced upstream behavior change, reported and NOT mitigated:**
- `dotenv` >= 17 prints a line to stdout when it loads. The call site is `src/shared/decorators/public.ts:4` (`dotenv.config()`), so the app now logs `◇ injected env (10) from .env` as its **first** line, before Nest's `Starting Nest application...`. On dotenv 16 that output did not exist. Nothing was added to silence it (`quiet: true` would do it) because that is a decision, not a fix.
- `bcrypt` 6, `reflect-metadata` 0.2 and `class-validator` 0.15 changed nothing observable here: see the probe evidence below. No source change was needed for any of the four.

Checks (all observed):
- `pnpm install` -> exit 0. `pnpm install --frozen-lockfile` -> exit 0 (the lock is reproducible from a clean tree).
- `pnpm exec tsc --noEmit` -> 0 errors.
- `pnpm test` -> 6/6 pass.
- `pnpm build` -> exit 0.
- `pnpm exec prettier --check package.json` -> clean.
- bcrypt 6 native binding, loaded directly: version 6.0.0, `hashSync('s3cret', 4)` then `compareSync` -> `true` for the hashed password and `false` for a different one. Resolves from `node_modules/.pnpm/bcrypt@6.0.0/node_modules/bcrypt/bcrypt.js`.
- Runtime probe (the E3 harness, `e3_probe` scratch DB, 3099): re-run on the current tree -> **the 183 non-JWT lines are byte-identical to the E3 shipped-state transcript** (`### VERSIONES` banner, DDL for all 6 tables, endpoint by endpoint, MySQL state after every step, the delete/cascade section, and `### D. BOOT` with 26 mapped routes). Unmasked, the only difference is rows 5/6 of `auth` flipping, which is the probe's own documented property (two rows minted in the same second carry byte-identical JWTs) and not version-dependent.
- No RED test: this task added no requested behavior, so the test-first policy's applicability exception applies exactly as in E3; the diff is `package.json` + `pnpm-lock.yaml` and the proof is the byte-comparable probe.

Commit: **`bc0d1f2`** "chore(deps): bump bcrypt, dotenv, reflect-metadata and class-validator" (signed ED25519, `package.json` + `pnpm-lock.yaml`, +80/-334; the lock shrinks because 3 majors pruned transitive deps).

Not bumped on purpose: `dotenv` was taken to the current major (18) rather than a version pin, and no `minimumReleaseAgeExclude` was needed this time - `pnpm install` passed the supply-chain policy as-is.

Review state of these two commits (same root cause as L14, re-reproduced today): receipt-driven development reads `on (decided by global)`, and `gentle-ai review assess --base-ref 37d0d19 --committed-only` answers `risk: high`, `review_due: true`, `review_due_reason: high_risk`, with `reasons: [unassessable]` because the three untracked directories (`.atl/`, `bruno/`, `odd/`) are untracked on purpose and need the explicit declaration flags. The review itself still cannot run: a fresh child session (`ses_ec5a3a815ffesjRsaRCwTFp1Im`) died with the same provider message - `OpenCode's free tier can only be used from within OpenCode` - which is the client/provider condition behind `opencode_review_transport_relay_refused (reason: provider_failed)` in L14, not a Gentle AI defect. No receipt was created and nothing was approved; delegation remains unavailable in this session too, so E4 stayed inline.

L18 — E5 executed (branch `deps/toolchain`, from `bc0d1f2`). Toolchain: ESLint 8 -> 10 with flat config, `@types/node` 20 -> 26, `prettier`, `supertest` 6->7.

Version moves (all observed in the install output):
- `eslint` 8.57.1 -> **10.12.0**; `@typescript-eslint/eslint-plugin` + `@typescript-eslint/parser` 6.21.0 -> the single `typescript-eslint` **8.71.2** package.
- `eslint-plugin-sonarjs` 0.25.1 -> **4.2.2**; `eslint-config-prettier` 9.1.2 -> **10.1.8**; `eslint-import-resolver-typescript` 3.10.1 -> **4.4.5**.
- `@types/node` 20.19.x -> **26.6.5**; `supertest` 6.3.4 -> **7.3.1**; `@types/supertest` 2.0.16 -> **7.2.1**; `prettier` 3.9.9 -> **3.9.10**.
- New: `@eslint/js` ^10.0.1 and `globals` ^17.13.0 (they carry the `env: { node, jest }` halves of the old config).

Config rewrite: `.eslintrc.js` (89 lines) deleted, `eslint.config.mjs` (104 lines) added. ESLint 10 removed eslintrc support, so the file had to move to flat. Every rule the old `rules` block declared explicitly is preserved with the same options (`no-restricted-imports` for `../*`, the `import-x/order` groups/newlines/alphabetize object, `@typescript-eslint/no-unused-vars`, the `sonarjs` and `prettier` presets, prettier last).

**Forced ecosystem changes, reported and NOT mitigated:**
- **`eslint-config-airbnb-base` 15.0.0 dropped.** It ships no flat config and its peer range is `eslint: ^7.32.0 || ^8.2.0`. `eslint:recommended` (which airbnb pulled in) is restored through `@eslint/js`; the explicit project rules are preserved verbatim.
- **`eslint-plugin-import` 2.32.0 replaced by `eslint-plugin-import-x` 4.17.1** (its peer range stops at `eslint: ^9`). Identical rule names under the `import-x/` prefix, and `importX.flatConfigs.typescript` restores the old `settings['import/resolver']` TS resolution.
- Dropped as part of the same swap: `@typescript-eslint/eslint-plugin`/`parser` (the meta package now owns both) and the file-level `parserOptions.project`/`sourceType`, unused by the non-type-checked recommended set.

Lint delta on unchanged sources (the honest count, same command both times):
- Before (`eslint 8.57.1` + `.eslintrc.js`): 15 problems — 9 `import/order`, 3 `prettier/prettier`, 1 `sonarjs/no-duplicate-string`, 1 `import/no-useless-path-segments`, 1 `lines-between-class-members`.
- After (`eslint 10.12.0` + `eslint.config.mjs`): 16 problems — 9 `import-x/order`, 3 `prettier/prettier`, 1 `import-x/no-useless-path-segments`, 2 `sonarjs/class-name`, 1 `sonarjs/pseudo-random`.
- Gained: `sonarjs/class-name` x2 and `sonarjs/pseudo-random`, rules added to sonarjs 4.x `recommended`; they fire on pre-existing code (`code.interface.ts:1`, `generate-code.ts:6`) and were not "fixed" because no source change is in scope.
- Lost: `lines-between-class-members` (airbnb) and `sonarjs/no-duplicate-string` (not in the v4 recommended set).
- Exit code is 1 before and after; no source file was touched.

`minimumReleaseAgeExclude`: `pnpm install` tried to add one for `eslint-plugin-prettier@5.5.7` (published less than 24h earlier). Same criterion as E3's `mysql2` decision (L15) -> the package stays on **5.5.6** and `pnpm-workspace.yaml` needs no exception: it is byte-identical to the file committed in `88c9820`.

Checks (all observed):
- `pnpm install` -> exit 0; `pnpm install --frozen-lockfile` -> exit 0.
- `pnpm exec eslint '{src,apps,libs,test}/**/*.ts'` -> exit 1 with the 16 findings above (same class as the baseline's exit 1).
- `pnpm exec tsc --noEmit` -> 0 errors. `pnpm test` -> 6/6 pass. `pnpm build` -> exit 0.
- `pnpm test:e2e` -> the identical pre-existing failure as before the `supertest` 7 bump: `Cannot find module '@api/auth/auth.module' from '../src/app.module.ts'` (1 failed suite, 0 tests in both runs).
- `pnpm exec prettier --check package.json eslint.config.mjs 'src/**/*.ts' 'test/**/*.ts'` -> the same 2 pre-existing failing files (`update-supermarket-product.dto.ts`, `mail.service.spec.ts`); both config files are clean.
- No runtime probe: E5 touches devDependencies only — no source file and no runtime dependency, so the runtime transcript cannot differ by construction.

Commit: **`6ff1b2e`** "chore(toolchain): migrate ESLint 8 to 10 with flat config" (signed ED25519, 4 files, +880/-929: `package.json`, `pnpm-lock.yaml`, `eslint.config.mjs` added, `.eslintrc.js` deleted).

Native review of the unreviewed range `37d0d19..6ff1b2e` (E3 + E4 + E5): still blocked by the environment, not by the change. Observed here:
- `gentle-ai review assess --base-ref 37d0d19 --committed-only` -> `review_due: true`, `review_due_reason: high_risk`. The first run reported `reasons: [{code: unassessable}]` because of the three intentionally untracked directories (`.atl/`, `bruno/`, `odd/`).
- Re-run with the declaration the preflight itself returned (`--untracked-scope=exclude --expected-untracked-inventory=sha256:58937b882fac165936cca7b24832f175c1e3b08b36bf35d846471a33e9f84cd6`) -> clean assessment, `next_transition` = `review.status`.
- That STATUS returns `action: start`, projection `base-diff`/`workspace`, target `sha256:f831325762c0375962b294efdcf80e72c0de08081914b00469e73cb4c5bb7b3b`, 11 paths (`.eslintrc.js`, `eslint.config.mjs`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` and the 6 services); no candidate exists yet and its `collect` step asks for `--intended-untracked-selection`.
- Not pursued: the reviewer transport is the dead one from L14/L17 (`OpenCode's free tier can only be used from within OpenCode` -> `opencode_review_transport_relay_refused`, `provider_failed`). It was not re-tested today, so whether it is still down is unproven; a frozen candidate could not have produced a receipt. Left as a pending user decision: configure a working model for the reviewer agents, accept the unreviewed commits, or `gentle-ai review mode disable --scope clone`.

L19 — E6 evaluated in detail (read-only; no repo test was touched). Verified facts, no speculation.

What is installed vs what exists:
- `typescript` **6.0.3** in the workspace (published 2026-04-16). It is the newest 6.x on the registry: the whole 6.x line is 6.0.2 and 6.0.3.
- Registry `latest` is **7.0.2** (2026-07-08), the native Go port ("10x faster", 8-12x on large codebases). It is the only 7.x published besides 7.0.1-rc; nothing in between exists.

Why the workspace is pinned where it is:
- `@nestjs/cli` 12.0.8 declares `typescript: ~6.0.2` as a **dependency**, not a peer.
- `@nestjs/schematics` 12 peer `typescript: >=6.0.0`; `@nestjs/swagger` 12 peer `typescript: ^5.5.0 || ^6.0.0` (TS 7 not allowed).
- `ts-jest` 29.4.14 (the current latest) peer `typescript: >=4.3 <7`.
- `typescript-eslint` 8.71.2 (installed in E5) peer `typescript: >=4.8.4 <6.1.0`.
- `pnpm why typescript` today: one copy, 6.0.3, shared by all of the above.

A/B experiment instead of theory. Copy of the tree in `$TMPDIR/opencode/e6-ts7` with a single change, `typescript: 6.0.3 -> 7.0.2`:
- `pnpm install` -> exit 0. Two copies end up installed: 7.0.2 at the root, 6.0.3 kept for `@nestjs/cli`, `@nestjs/schematics`, `eslint-plugin-sonarjs` and `ts-api-utils`.
- `pnpm exec tsc --noEmit` -> **exit 0**. The type checker accepts the whole tree unchanged; no `tsconfig` migration is needed (the repo already uses `module`/`moduleResolution: nodenext`, `types: ["node","jest"]`, no `baseUrl`, no `downlevelIteration`).
- `pnpm build` (`nest build`) -> **exit 1**: "The installed TypeScript version (7.0.2) does not expose the programmatic compiler API that the Nest CLI requires. TypeScript 7.0 ships the "tsc" executable only; the compiler API is expected to return in 7.1."
- `pnpm test` -> **exit 1**, same root cause in ts-jest: "The installed TypeScript version (7.0.2) does not expose the programmatic compiler API". The repo's only runnable tests run through ts-jest.
- `pnpm exec eslint 'src/**/*.ts'` -> the loader throws before linting a single file: "typescript-eslint does not support TS 7.0", pointing at the TS 7 blog's side-by-side section and at typescript-eslint issue #10940 (tracking TS >= 7.1).
- Speed *in this repo* (small, not a large codebase): `tsc --noEmit --incremental false` real 1.34s / 0.95s with 6.0.3 vs 0.41s with 7.0.2.

Conclusion: 7.0.2 is not adoptable here. Not because of the app's code (it type-checks unchanged, exit 0) but because three of the four tools the repo runs need the programmatic compiler API that 7.0 does not ship: Nest CLI, ts-jest and typescript-eslint. The shape TypeScript itself recommends (and the one the error messages point to) is side-by-side: 7.0.2 for `tsc`, 6.x for the embedding tools — which means keeping two TypeScripts installed while `nest build` and jest still run on 6, in exchange for a typecheck that goes from ~1s to ~0.4s in this repo. The E6 row's original target ("5.9 -> 7.x") is stale at both ends: the repo is already on 6.0.3 and 7.x cannot be satisfied.

L20 — E6 closed by the agent's decision. The user delegated it ("Decidelo tú") after the detailed evaluation in L19.

**Decision: E6 is NOT APPLICABLE. TypeScript stays at 6.0.3 and no manifest file is touched.** The devDep spec remains `^6.0.0`, which today can only resolve to 6.0.2 or 6.0.3 — the only two 6.x versions published — so the resolved tree is what the four consumers already share (`@nestjs/cli` `~6.0.2`, `typescript-eslint` `>=4.8.4 <6.1.0`, `ts-jest` `>=4.3 <7`, `@nestjs/swagger` `^5.5.0 || ^6.0.0`).

Alternatives considered and rejected:
- **Dual install** (7.0.2 for `tsc`, 6.x for the tools): the only shape TS 7 supports today. Rejected — two compilers in the tree, alias fragility in how eslint/ts-jest/nest resolve TypeScript, and `nest build` plus jest keep running TS 6 anyway, all to move `tsc --noEmit` from ~1s to ~0.4s in a 26-route app.
- **Range tightening** (`^6.0.0` -> `~6.0.2`): rejected as churn. Nothing else can resolve today, the ceiling is already enforced by the consumers' peer ranges, and a failing lint/test is the natural gate if a 6.1 line ever appears.

Revisit trigger, all three at once: TypeScript 7.1 (ships the compiler API that 7.0 omits) + `typescript-eslint` (issue #10940) and `ts-jest` supporting it + a `@nestjs/cli` that stops pinning TypeScript 6.

This closes S2's acceptance criterion for the TypeScript workstream: it is a recorded decision with observed evidence (L19), not an oversight and not a silent omission. No source file, no build output and no test was affected by this task; the only artifact it produces is this record.

L21 — Delivery: the three branches were pushed and the PR stack was opened (user's explicit decision: "3 PRs apilados").

- `origin`: `deps/typeorm-1x-mysql2` (f13acf6), `deps/runtime-misc` (88c9820, bc0d1f2), `deps/toolchain` (6ff1b2e). All four commits verified signed (`%G?` = `G`) before pushing. `.env` confirmed untracked and gitignored; the stack touches 12 files, all app/config — `bruno/`, `.atl/` and `odd/` stayed untracked and were not pushed.
- PR **#7** `chore(deps): upgrade typeorm to 1.x` — base `main`, 8 files, 40 authored lines. PR **#8** `chore(deps): bump bcrypt, dotenv, reflect-metadata and class-validator` — base `deps/typeorm-1x-mysql2`, 3 files, 18 authored lines. PR **#9** `chore(toolchain): migrate ESLint 8 to 10 with flat config` — base `deps/runtime-misc`, 4 files, 221 authored lines.
- Chained-diff check run after creation: each PR lists exactly its own files, no parent contamination (7 -> 8 files, 8 -> 3 files, 9 -> 4 files).
- Chain constraint recorded in every body: **merge in order #7 -> #8 -> #9 with merge commits, never squash**, because the children are based on those exact SHAs; squashing rewrites them and the child diff would re-show the parent's changes.
- Per-PR review budget from the `chained-pr` skill: the authored diffs are 40, 18 and 221 lines; the raw diffs are 188, 422 and 1,809, dominated by the generated `pnpm-lock.yaml` (148, 404, 1,588 lines) which cannot be split cleanly, so the lockfile carries a de-facto `size:exception`.
- The `branch-pr` skill's issue-first enforcement (approved issue, one `type:*` label, PR template, CI gate) does not exist in this repository: there is no `.github/` directory, no workflows, and the only labels are GitHub's defaults. The PRs therefore use this repository's own convention (Conventional title, summary, changes table, test plan) and no issue or label was invented.

L22 — Delivery incident: the stack merged into its own branches, not into `main`. Recovery PR #10 opened.

What happened: the three PRs were merged in the intended order (#7 then #8 then #9), but a stacked PR must have its **base retargeted to `main` after the parent merges**. The repository does not auto-delete head branches, so GitHub never retargeted the children and each child merged into its parent branch instead of `main`:
- `main` @ `d2fffb1` contained only `f13acf6` (E3/TypeORM 1.x).
- `88c9820` (E4b), `bc0d1f2` (E4) and `6ff1b2e` (E5) were reachable only from `deps/*` (`origin/deps/typeorm-1x-mysql2` -> 8d4d3e8, `origin/deps/runtime-misc` -> 015ba73).
- Nothing was lost and nothing needed reverting; no commit had to be rewritten.

Root cause in the instructions given to the user: the merge order and the no-squash rule were stated, but the retarget step was omitted. The bodies said "merge in order with merge commits" without "retarget the child's base to `main` before merging it". That omission is on the agent, not on the user.

Recovery: PR **#10** `chore(deps): land the runtime and toolchain workstreams on main`, head `deps/toolchain` (`6ff1b2e`), base `main`. Because `f13acf6` is already in `main`'s history, the merge base is correct and the PR carries exactly the three remaining commits (`88c9820`, `bc0d1f2`, `6ff1b2e`) with no contamination. Verified file list: `.eslintrc.js`, `eslint.config.mjs`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` — 5 files, no `src/`.
- First attempt at creating this PR used the wrong body file and published PR #9's text; corrected immediately with `gh pr edit 10 --body-file` and read back.
- After merging #10 with a merge commit, `main` holds the whole modernization and the three `deps/*` branches become deletable.

Lesson for any future stack in this repository: either retarget each child's base to `main` right after its parent merges, or enable auto-delete of head branches so GitHub retargets automatically.

L23 — Verification of the merged `main` (user: "ya se hizo merge, revisa").

State: `main` = `a7c6305` (merge of PR #10). All four work commits are ancestors of it (`f13acf6`, `88c9820`, `bc0d1f2`, `6ff1b2e`), `git log origin/main..origin/deps/toolchain` is empty, and `main`'s tree is `5ac369cae6c0fd6ba7d0a79d1ee9aa527e0c74ec` — **byte-identical** to the branch that was verified workstream by workstream. `37d0d19..main` touches 11 files (the six service files, `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `eslint.config.mjs`, deleted `.eslintrc.js`) and nothing else: no `.env`, no `bruno/`, no `odd/`.

Verified on an extraction of `origin/main` (`git archive origin/main | tar -x`), since the working tree is still on `deps/toolchain`:
- `pnpm install --frozen-lockfile` -> 0 (installs `typescript` 6.0.3 and `typescript-eslint` 8.71.2 clean)
- `pnpm exec tsc --noEmit` -> 0
- `pnpm test` -> 6/6 passed
- `pnpm build` -> 0
- `pnpm exec eslint "{src,apps,libs,test}/**/*.ts"` -> exit 1 with 16 findings (same class as the baseline)
- `pnpm exec prettier --check` -> the same 2 pre-existing files (`src/api/supermarket-products/dto/update-supermarket-product.dto.ts`, `src/shared/mail/mail.service.spec.ts`)
The end-to-end runtime probe was not re-run: the tree hash proves `main` is byte-identical to the content that probe ran against, so that evidence transfers exactly.

Re-derived baseline A/B (the original evidence files had been purged from the temp directory, so they were regenerated from `bc0d1f2`): with the real `lint` glob, pre-E5 eslint 8.57.1 + `.eslintrc.js` gives **15** findings (9 `import/order`, 3 `prettier/prettier`, 1 `sonarjs/no-duplicate-string`, 1 `lines-between-class-members`, 1 `import/no-useless-path-segments`) and the committed state gives **16** (9 `import-x/order`, 3 `prettier/prettier`, 1 `import-x/no-useless-path-segments`, 2 `sonarjs/class-name`, 1 `sonarjs/pseudo-random`). L18's numbers hold.

Nuance worth keeping, because it caused a false alarm during this verification: **the count depends on the glob.** `lint` runs `"{src,apps,libs,test}/**/*.ts"` and that set includes `test/app.e2e-spec.ts`; the narrower `'src/**/*.ts'` reports 14 before and 15 after. The delta is +1 either way, but any lint count quoted in this project must name the glob it was measured with.

Branch cleanup pending (user's call): `origin/deps/toolchain` is fully contained in `main`; `deps/typeorm-1x-mysql2` and `deps/runtime-misc` each carry only the extra merge commit GitHub created on them (`git log origin/main..<branch>` = 1, and it contains no changes of its own). All three are safe to delete.

L24 — Cleanup applied on the user's instruction. The working copy is now on `main` @ `a7c6305` (fast-forward pull from `d2fffb1`, no conflicts, working tree clean apart from the untracked `.atl/`, `bruno/`, `odd/`), and the three remote branches were deleted (`git push origin --delete` reported `[deleted]` for `deps/typeorm-1x-mysql2`, `deps/runtime-misc` and `deps/toolchain`). `origin` now holds only `main`, `develop`, `qa`, `integration/main-sync`, `feature/supermarkets-products` and `fix/authorization-home-scoping`. The three local `deps/*` branches were left in place on purpose (their upstreams read `gone`; deleting them needs `-D` because of GitHub's merge commits), pending the user's word.

L25 — Remote-branch cleanup completed by the user, and audited. `origin` now holds **only `main`** (`develop`, `qa`, `integration/main-sync`, `feature/supermarkets-products`, `fix/authorization-home-scoping` and the three `deps/*` are all gone). Containment audit before/near deletion: `develop`, `qa`, `feature/supermarkets-products` and `fix/authorization-home-scoping` were listed by `git branch -r --merged origin/main` as ancestors of `main`, so no unique commit was lost; `integration/main-sync` was NOT in that list, but PR #5 (`head=integration/main-sync@4231754`, MERGED) and the local branch at that same SHA are ancestors of `main` — the remote tip was almost certainly a staging merge of `main` back into that branch, whose content was already in `main` (the branch's own title is "bring NestJS 12, Resend and supermarket-products onto main"). All local branches — `deps/typeorm-1x-mysql2` (f13acf6), `deps/runtime-misc` (bc0d1f2), `deps/toolchain` (6ff1b2e), `feature/supermarkets-products` (2e4a465), `fix/authorization-home-scoping` (08165d3), `integration/main-sync` (4231754) — are ancestors of `origin/main` (0 commits outside it), their upstreams read `gone`, and `main` local == `origin/main` == `a7c6305`. Nothing pending in git; the only open items are process-level (the RDD review of `37d0d19..6ff1b2e`) and pre-existing repository debt (e2e path mapper, 16 lint findings, dotenv's first stdout line).

L26 — The six stale local branches were deleted with `git branch -d` (all were ancestors of `main`, so no force needed): `deps/typeorm-1x-mysql2`, `deps/runtime-misc`, `deps/toolchain`, `feature/supermarkets-products`, `fix/authorization-home-scoping`, `integration/main-sync`. The repository now holds only `main` (local `a7c6305` == `origin/main`). Git-side work on this feature is closed; what remains is process-level (RDD review of `37d0d19..6ff1b2e`) and pre-existing debt unrelated to these bumps.

L27 — Pre-existing runtime failure reported by the user while testing the modernized `main`: `"expiresIn" should be a number of seconds or string representing a timespan`. Root cause is configuration, not the dependency work: `src/api/auth/auth.module.ts:25` builds the access token from `configService.get('JWT_ACCESS_TOKEN_EXPIRY')` and `src/api/auth/auth.service.ts:97,132` build the refresh token from `JWT_REFRESH_TOKEN_EXPIRY`, but the local `.env` defines only `JWT_SECRET` — neither expiry variable exists, so both values are `undefined`. jsonwebtoken 9.0.3 validates the *presence* of the key: measured directly against the installed package, `{expiresIn: undefined}` and `{expiresIn: ''}` throw that exact message, while `{expiresIn: '1h'}` and an options object with no `expiresIn` key at all are fine. Attribution: jsonwebtoken was already 9.0.x before this work (the lockfile superseded by `2e4a465` lists 9.0.0/9.0.2, and the resolved 9.0.3 is identical at `37d0d19` and at `main`), and `@nestjs/jwt` 10.2.0 + jsonwebtoken 9.0.3 throws identically, so neither the E3–E5 bumps nor the 10 → 12 upgrade introduced it; the `.env` simply does not carry the two variables the code requires (it is untracked, so its history is not auditable). Same class as the other pre-existing debt: the project has no tracked `.env.example` to keep the required keys visible.

L28 — Applied the fix for L27 with the user's authorization: two lines inserted in `.env` right after `JWT_SECRET` (`JWT_ACCESS_TOKEN_EXPIRY=1h`, `JWT_REFRESH_TOKEN_EXPIRY=30d`), preserving the file's mode (644) and adding the missing final newline. Verified by loading that `.env` through dotenv and signing with the real `@nestjs/jwt` service, i.e. the exact path that threw: access token `exp - iat = 3600 s`, refresh token `exp - iat = 2592000 s` (30 d), both 3-part tokens. No backup copy of `.env` was kept (the `.env` is untracked and the sandbox backup attempt failed), so the edit is only attested by reproducing the masked structure and by a successful signature with the same `JWT_SECRET`. A key-coverage audit of code reads vs `.env` definitions found one further variable read by the code but absent from the environment — `ENV` — plus four definitions whose static read the grep could not see (`ENCRYPT_PASSWORD`, `PREFIX`, `RESEND_API_KEY`, `RESEND_MAIL_FROM`).
