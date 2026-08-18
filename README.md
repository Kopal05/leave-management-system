# Leave Management System

A simple internal Leave Management System built with **Spring Boot 3 (Java 21)** on the
backend and **Angular 20 + Angular Material** on the frontend. Intentionally kept lean —
no approval workflows, no leave balances, no departments — just enough for employees to
plan leaves and for admins to see team availability.

---

## 1. Project Folder Structure

```
lms/
├── backend/                          Spring Boot API (Java 21, Maven)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/lms/
│       │   ├── LeaveManagementSystemApplication.java
│       │   ├── config/                SecurityConfig, DataSeeder
│       │   ├── security/              JWT util, filter, UserDetails
│       │   ├── entity/                User, Leave, Role, LeaveStatus
│       │   ├── repository/            UserRepository, LeaveRepository
│       │   ├── dto/                   Request/response DTOs
│       │   ├── service/               AuthService, UserService, LeaveService, DashboardService
│       │   ├── controller/            Auth, User, Leave, Calendar, Dashboard
│       │   └── exception/             GlobalExceptionHandler + custom exceptions
│       └── resources/
│           └── application.properties
│
├── database/
│   ├── schema.sql                    Table definitions (reference — JPA also auto-creates them)
│   └── sample_data.sql               Sample employees + sample leave records
│
└── frontend/                         Angular 20 app (standalone components)
    ├── angular.json / package.json / tsconfig*.json
    └── src/
        ├── environments/
        └── app/
            ├── app.component.ts / app.config.ts / app.routes.ts
            ├── core/
            │   ├── models/            TypeScript interfaces mirroring the DTOs
            │   ├── services/          AuthService, UserService, LeaveService
            │   ├── guards/            authGuard, adminGuard
            │   └── interceptors/      jwtInterceptor
            └── features/
                ├── login/
                ├── navbar/
                ├── dashboard/          Adapts its content for ADMIN vs USER
                ├── manage-users/       Admin only
                ├── apply-leave/
                ├── my-leaves/
                ├── team-calendar/
                └── shared/             Reusable confirm-dialog
```

Layering on the backend follows **Controller → Service → Repository → Database**, with DTOs
at the controller boundary so entities never leak into API responses.

---

## 2. Database Schema

Two tables only — see `database/schema.sql` for the full DDL.

**users**

| Column     | Type          | Notes                     |
|------------|---------------|----------------------------|
| id         | BIGINT PK     | auto increment             |
| name       | VARCHAR(100)  |                             |
| email      | VARCHAR(150)  | unique                     |
| password   | VARCHAR(255)  | BCrypt hash                |
| role       | VARCHAR(20)   | `ADMIN` or `USER`          |
| created_at | DATETIME      |                             |

**leaves**

| Column     | Type          | Notes                              |
|------------|---------------|--------------------------------------|
| id         | BIGINT PK     | auto increment                       |
| user_id    | BIGINT FK     | → users.id                           |
| title      | VARCHAR(150)  |                                       |
| reason     | VARCHAR(500)  |                                       |
| start_date | DATE          |                                       |
| end_date   | DATE          |                                       |
| status     | VARCHAR(20)   | `PLANNED` or `CANCELLED`             |
| created_at | DATETIME      |                                       |
| updated_at | DATETIME      |                                       |

No leave balance, leave-type, approval, department, team, or holiday tables — by design.

---

## 3. Entity Diagram

```
┌───────────────────┐         ┌───────────────────────┐
│       User         │ 1     * │         Leave          │
├───────────────────┤─────────├───────────────────────┤
│ id (PK)            │         │ id (PK)                │
│ name                │         │ user_id (FK -> User.id)│
│ email (unique)      │         │ title                  │
│ password            │         │ reason                 │
│ role (ADMIN/USER)   │         │ startDate               │
│ createdAt           │         │ endDate                 │
└───────────────────┘         │ status (PLANNED/CANCELLED)│
                                 │ createdAt / updatedAt   │
                                 └───────────────────────┘
```

One `User` has many `Leave` records (created by them). No other relationships exist.

---

## 4. REST API Design

All responses are wrapped as `{ "success": bool, "message": string, "data": ... }`.

| Method | Endpoint          | Access        | Description                              |
|--------|-------------------|---------------|-------------------------------------------|
| POST   | `/auth/login`      | Public        | Returns JWT + user info                   |
| GET    | `/users`           | ADMIN         | List all users                            |
| GET    | `/users/{id}`      | ADMIN         | Get one user                              |
| POST   | `/users`           | ADMIN         | Create a user                             |
| PUT    | `/users/{id}`      | ADMIN         | Update a user                             |
| DELETE | `/users/{id}`      | ADMIN         | Delete a user                             |
| POST   | `/leaves`          | Authenticated | Apply for leave (returns overlap warning if any) |
| GET    | `/leaves`          | Authenticated | All planned leaves                        |
| GET    | `/leaves/my`        | Authenticated | Current user's leaves                     |
| PUT    | `/leaves/{id}`     | Owner or ADMIN | Edit a leave (blocked after cutoff)      |
| DELETE | `/leaves/{id}`     | Owner or ADMIN | Cancel a leave (blocked after cutoff)    |
| GET    | `/calendar`        | Authenticated | All planned leaves, calendar-friendly shape |
| GET    | `/dashboard`       | Authenticated | Role-aware dashboard payload              |

---

## 5–7. Backend, Security & Business Rules

- **JWT auth**: `POST /auth/login` issues a signed JWT (HS256) containing the user's id, email,
  and role. `JwtAuthenticationFilter` validates it on every request; `SecurityConfig` enforces
  role-based access (`/users/**` requires `ROLE_ADMIN`, everything else just requires
  authentication).
- **Edit/cancel cutoff**: `leave.edit-cutoff-days` in `application.properties` (default `5`)
  controls how many days before the start date a leave can still be edited or cancelled. This is
  enforced in `LeaveService.isEditable()` and surfaced to the frontend as `editable: true/false`
  on every leave so the UI can disable the buttons and explain why.
- **Overlap detection**: `LeaveService.applyLeave()`/`updateLeave()` check for other employees'
  planned leaves in the same date range and return a **warning message** — the leave is never
  blocked. The admin dashboard additionally computes a full overlap matrix across all employees.
- **No public registration**: There's no `/auth/register` endpoint. A default admin
  (`admin@lms.com` / `Admin@123`, configurable via `app.default-admin.*`) is seeded automatically
  on first startup so you always have a way in.

---

## 8. Angular Frontend

Standalone-components Angular 20 app (no NgModules), Angular Material for UI:

- **Login** — JWT stored in `localStorage`; `jwtInterceptor` attaches it to every request and
  logs the user out automatically on a 401.
- **Dashboard** — one component, content adapts by role (`AuthService.isAdmin()`): everyone sees
  their upcoming leaves and the team calendar; admins additionally see all employees and a
  cross-employee overlap-warning list.
- **Manage Users** (ADMIN only, guarded by `adminGuard`) — create/edit/delete users inline.
- **Apply Leave** — Material datepickers, client-side validation mirrors the backend rules.
- **My Leaves** — table of the user's leaves with inline edit; edit/cancel buttons disable
  themselves (with a tooltip) once the cutoff has passed.
- **Team Calendar** — simple month-grid view showing employee name against each day they're on
  leave, with prev/next/today navigation.

---

## 9. MySQL Scripts & Sample Data

- `database/schema.sql` — CREATE DATABASE + CREATE TABLE statements (optional; Spring's
  `spring.jpa.hibernate.ddl-auto=update` will also create/update these automatically on startup).
- `database/sample_data.sql` — 4 sample employees (password: `password` for all of them) and a
  few sample leave records. Run this **after** the backend has started at least once.

---

## 10. Step-by-Step Setup Instructions

### Prerequisites
- Java 21+, Maven 3.9+
- Node.js 20+, npm, Angular CLI (`npm i -g @angular/cli`)
- MySQL 8+ running locally

### Backend
```bash
cd backend

# create the database (or let ddl-auto=update do it for you)
mysql -u root -p < ../database/schema.sql

# adjust src/main/resources/application.properties if your MySQL
# username/password/port differ from the defaults (root / root / 3306)

mvn spring-boot:run
```
The API starts on **http://localhost:8080**. On first run it prints and creates a default admin:
`admin@lms.com` / `Admin@123`.

Optionally load sample data:
```bash
mysql -u root -p leave_management_system < database/sample_data.sql
```

### Frontend
```bash
cd frontend
npm install
ng serve
```
The app runs on **http://localhost:4200** and talks to the API at `http://localhost:8080`
(see `src/environments/environment.ts` to change this).

### First login
1. Go to `http://localhost:4200`.
2. Log in as `admin@lms.com` / `Admin@123`.
3. Create your team members from **Manage Users** (they'll log in with whatever password you set).
4. Log out and log back in as a `USER` to try Apply Leave / My Leaves / Team Calendar.

---

## 11. Future Enhancements

These were intentionally left out to keep the project simple, but would be natural next steps:

- Leave approval workflow (currently any planned leave is automatically visible to the team)
- Leave types and leave balances/accrual
- Email or in-app notifications when a leave is applied/edited/cancelled
- Departments/teams so the calendar and overlap checks can be scoped per group
- Public holiday calendar integration
- Audit log of who changed what and when
- Pagination and search/filtering on the users and leaves tables
- Unit/integration test suite (JUnit + Mockito on the backend, Jasmine/Karma on the frontend)
