Here is the write-up converted to Markdown format:

# 🏆 Best Practices — Backend (NestJS + Prisma + PostgreSQL)

> **Purpose**: Practical, bite-sized rules & examples to keep the codebase maintainable, secure, and easy to onboard into (for someone coming from Express/Objection).

---

## 1\. Project Layout (Recommended)

Use **feature modules** and keep controllers/services/repositories grouped per domain.

```
src/
├─ modules/
│ ├─ auth/
│ │ ├─ auth.controller.ts
│ │ ├─ auth.service.ts
│ │ ├─ auth.module.ts
│ │ ├─ dto/
│ │ └─ guards/
│ ├─ users/
│ ├─ applications/
│ ├─ payments/
│ ├─ certificates/
│ └─ reports/
├─ common/
│ ├─ filters/
│ ├─ interceptors/
│ ├─ pipes/
│ ├─ decorators/
│ └─ utils/
├─ prisma/
│ └─ prisma.service.ts
├─ main.ts
└─ app.module.ts
```

---

## 2\. Use Prisma as a Single Source of Truth for Schema

- Keep schema in `prisma/schema.prisma`.
- Use `prisma migrate dev` during development and `prisma migrate deploy` in CI/CD.
- Run `npx prisma format` before commits.

**Commands**

```bash
npx prisma migrate dev --name init
npx prisma db push # for quick sync (dev only)
npx prisma generate
npx prisma studio
```

---

## 3\. Database Transactions & Isolation

For multi-step operations (create application + payment record + audit log), always use **Prisma transactions** (`$transaction`) or **interactiveTransactions** when you need rollback semantics.

Keep transactions short and lightweight.

```typescript
await prisma.$transaction(async (tx) => {
  await tx.application.create({...});
  await tx.payment.create({...});
});
```

---

## 4\. Error Handling & Validation

- Use **DTOs** and **class-validator** for request validation.
- Centralize HTTP error mapping using **exception filters** (e.g., map DB unique constraint to `409 Conflict`).
- **Never leak raw DB errors to clients.**

<!-- end list -->

```typescript
// Example DTO
export class CreateApplicationDto {
  @IsString() name: string;
  @IsEnum(CooperativeType) type: CooperativeType;
}
```

---

## 5\. Auth & RBAC

- Use **JWT** for auth; refresh tokens stored securely in DB if needed.
- **RBAC** via custom `RolesGuard` using metadata decorators `@Roles(...)`.
- Protect admin routes under `/admin/*` and implement `AdminRole` authority checks.

<!-- end list -->

```typescript
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin', 'director')
@Get('admin/applications')
```

---

## 6\. API Design & Versioning

- Use clear **REST resources** and **versioning**: `/api/v1/admin/applications`.
- Keep **controllers thin**; business logic lives in services.
- Return **consistent response shapes**:

<!-- end list -->

```json
{ "status": "success", "data": {}, "meta": {} }
```

---

## 7\. Logging & Observability

- Use a **structured logger** (Winston or Pino). Log request ids, user id, route.
- Include **correlation IDs** (attach to requests via middleware).
- Log levels: `debug`/`info`/`warn`/`error`. Rotate logs in production.

---

## 8\. File Uploads & Storage

- Store uploaded documents in **S3** (or chosen blob store). Save only metadata & URLs in Postgres.
- Validate file types/sizes on upload.
- Use **presigned URLs** for direct client upload.

---

## 9\. Payments Integration

- Keep **gateway keys in env vars** and **never commit them**.
- Use **webhooks** for payment confirmation (validate signature).
- Record both **gateway payload** and **normalized transaction record** in DB for reconciliation.

---

## 10\. Tests

- **Unit tests** for services (Jest).
- **E2E tests** for critical flows (registration → payment → certificate issuance).
- Use an **ephemeral Postgres** (docker-compose / testcontainers) in CI.

**Commands**

```bash
# run unit tests
npm run test
# run e2e (with test DB)
npm run test:e2e
```

---

## 11\. Migrations & CI/CD

- Migrations committed to repo. CI should run `prisma migrate deploy` (production) or `prisma migrate dev` (staging).
- Use **database backup step** before running migrations in production.

**Example CI Steps:**

```bash
Run npm ci
npx prisma migrate deploy
npm run build
Deploy container
```

---

## 12\. Environment & Secrets

- Use `.env` for local dev; store secrets in **HashiCorp Vault / GitHub Secrets / DigitalOcean Secrets** for production.
- Do not store keys in code or logs.

---

## 13\. Security Checklist 🛡️

- **HTTPS** everywhere (TLS).
- **Rate limiting** on auth endpoints.
- **Sanitize inputs**, avoid SQL injection (Prisma helps).
- Implement CSP, XSS protections on front-end side.
- **Rotate keys** periodically.

---

## 14\. Contracts & API Docs

- Use **OpenAPI (Swagger)** with NestJS decorators. Keep docs accurate and gated (only for dev / internal).
- Keep DTOs and API schemas strict.

---

## 15\. Developer Ergonomics (Copilot Tips)

- Commit small PRs; use feature flags.
- Add concise **TODO** comments to guide Copilot code completions.
- Provide Copilot with clear **function names and types** — it helps generate correct service logic and tests.

---

## 16\. PR & Code Review Expectations

- Small PRs (**\<= 300 lines**).
- Include **unit tests** for new logic.
- Run **lint and typecheck** before requesting review.
- Use descriptive **commit messages**.

---

## 17\. Quick Onboard Checklist for New Dev (First Run) 🚀

1.  `git clone repo`
2.  `copy .env.example to .env` and fill secrets
3.  `npm ci`
4.  `npx prisma migrate dev --name init`
5.  `npm run start:dev`
6.  Use `npx prisma studio` to inspect DB

---

## 18\. Useful Commands Summary

```bash
# dev
npm run start:dev
# tests
npm run test
# prisma
npx prisma migrate dev --name update
npx prisma generate
npx prisma studio
# build
npm run build
```

---

## 19\. Minimal Monitoring & Alerts

- Expose **health check endpoint** (`/health`).
- Integrate basic metrics: Prometheus exporter or host provider metrics.
- Configure **alerts** for high error rates and DB connectivity loss.

---

## 20\. Documentation

- Keep **README** updated: setup, env vars, DB migration, testing, deployment.
- Add an **ARCHITECTURE.md** that maps modules to DB tables and endpoints (we’ll create that as we build).
