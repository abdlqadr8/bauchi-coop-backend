
---

### 🧾 File 2: `docs/PRD_PROJECT_TRACKER.md`

Copy and paste this:

```markdown
# PRD — Project Requirement Document & Progress Tracker

**Project:** Cooperative Registration and Recertification Portal  
**Backend Stack:** NestJS + Prisma + PostgreSQL  
**Frontend:** React + Vite + Tailwind (Lovable.dev)  
**Dev Tool:** GitHub Copilot  

---

## 🧩 Module Progress Table

| Module | Scope / Description | Example Endpoints | Key Models | Acceptance Criteria | Owner | Completion |
|---------|--------------------|-------------------|-------------|--------------------|--------|-------------|
| Auth | JWT login, refresh, logout, RBAC | `POST /auth/login`, `POST /auth/refresh` | User, RefreshToken | Secure login + protected routes | Backend | ⬜ Not started |
| Users | Manage ministry staff & roles | `GET /admin/users`, `POST /admin/users` | User, ActivityLog | Create/edit/disable users + logs | Backend | ⬜ Not started |
| Applications | Cooperative registration & review | `POST /applications`, `GET /admin/applications` | Application, Document | Create, approve/reject, flag apps | Backend | ⬜ Not started |
| Payments | Handle transactions & webhooks | `POST /payments`, `POST /payments/webhook` | Payment | Record + verify payments | Backend | ⬜ Not started |
| Certificates | Generate, revoke, verify | `POST /admin/certificates`, `GET /certificates/verify/:regNo` | Certificate | Manage digital certificates | Backend | ⬜ Not started |
| Reports | KPIs, charts, export | `GET /admin/reports/summary`, `/export` | Aggregates | Charts + export reports | Backend | ⬜ Not started |
| Dashboard | Overview metrics & stats | `GET /admin/dashboard` | Aggregates | Returns KPIs + recent apps | Backend | ⬜ Not started |
| Notifications | Email & SMS sending | `POST /notifications/send-test` | NotificationLog | Test + send system alerts | Backend | ⬜ Not started |
| Settings | System, payment, notification config | `GET /admin/settings`, `PATCH /admin/settings` | Setting | Persistent config values | Backend | ⬜ Not started |
| Storage | File uploads via presigned URLs | `POST /uploads/presign` | Document | Store & retrieve uploaded docs | Backend | ⬜ Not started |
| Tests | Unit & E2E tests | - | - | Passing tests for key flows | Backend | ⬜ Not started |
| CI/CD | Docker + Prisma migrations | - | - | Build & deploy successfully | DevOps | ⬜ Not started |
| Observability | Logging, metrics, health | `/health` | - | Monitored health endpoint | Backend | ⬜ Not started |

---

## 📅 Roadmap (Sprints)

| Sprint | Focus | Expected Output |
|--------|--------|----------------|
| Sprint 0 | Setup + Auth | NestJS + Prisma setup, DB connection, Auth JWT |
| Sprint 1 | Applications + Users | App submission + Admin management |
| Sprint 2 | Payments + Certificates | Paystack integration + certificate generation |
| Sprint 3 | Reports + Dashboard | Metrics endpoints & analytics aggregation |
| Sprint 4 | Settings + Notifications | Admin system config + test notifications |
| Sprint 5 | Tests + CI/CD | Final polish, tests, migrations, deployment |

---

## ✅ Progress Legend
- ⬜ Not started  
- 🟨 In progress (add % or note)  
- ✅ Completed  

> Example:  
> `Auth | ... | ... | ... | Backend | 🟨 In progress (60%) - JWT implemented, refresh pending`

---

## 📋 Notes
- Update this table after every major commit or merge.  
- Each module should correspond to a NestJS feature module folder under `src/modules/`.  
- Use this PRD to guide Copilot and teammates during development.  

---

_Last updated: {{ insert date when you paste }}_
