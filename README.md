# Employee Reimbursement Management System — Backend

A RESTful backend API built with **Express.js**, **Drizzle ORM**, and **PostgreSQL** (Supabase) for managing employee reimbursement requests with a multi-role approval workflow.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express.js v5 |
| ORM | Drizzle ORM |
| Database | PostgreSQL (Supabase) |
| Auth | JWT stored in httpOnly cookie |
| Validation | Zod |
| Password hashing | bcrypt |

---

## Roles

| Role | Description |
|---|---|
| `EMP` | Employee — default on registration. Can create reimbursements. |
| `RM` | Reporting Manager — assigned by CFO. Approves/rejects subordinate reimbursements. |
| `APE` | Accounts Payable Executive — assigned by CFO. Final approver after RM. |
| `CFO` | Root user — seeded. Assigns roles and manager mappings. |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/chron303/emp_backend_razorpay.git
cd emp_backend_razorpay
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your actual values
```

### 3. Run database migrations

```bash
npm run db:generate    # generate SQL from schema
npm run db:migrate     # apply migrations to DB
```

### 4. Seed the CFO account

```bash
npm run db:seed-data
```

CFO credentials:
- Email: `cfo@org.com`
- Password: `CFO#ORG@April2026`

### 5. Start development server

```bash
npm run dev
# Server runs on http://localhost:7002
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | ✅ | Token lifetime (e.g. `7d`) |
| `PORT` | ✅ | Server port — must be `7002` |
| `NODE_ENV` | ✅ | `development` or `production` |
| `CLIENT_ORIGIN` | optional | CORS allowed frontend origin |

See [.env.example](.env.example) for a template.

---

## API Endpoints

All endpoints are prefixed with `/rest`.

### Authentication (public)

| Method | Path | Description |
|---|---|---|
| `POST` | `/rest/onboardings/register` | Register a new user (EMP role assigned automatically) |
| `POST` | `/rest/onboardings/login` | Login — sets httpOnly `auth` cookie |
| `POST` | `/rest/onboardings/logout` | Logout — clears auth cookie |

### Role Management (CFO only)

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/rest/roles/assign` | `{ userId, role }` | Assign a role to a user |

### Employee Management

| Method | Path | Body | Who | Description |
|---|---|---|---|---|
| `GET` | `/rest/employees` | — | RM, APE, CFO | List employees (scoped by role) |
| `POST` | `/rest/employees/assign` | `{ employeeId, managerId }` | CFO | Assign EMP to RM |
| `DELETE` | `/rest/employees/assign` | `{ employeeId }` | CFO | Remove EMP's manager assignment |

### Reimbursements

| Method | Path | Body | Who | Description |
|---|---|---|---|---|
| `POST` | `/rest/reimbursements` | `{ title, description, amount }` | EMP | Create request |
| `GET` | `/rest/reimbursements` | — | all | List (scoped by role) |
| `GET` | `/rest/reimbursements/:userId` | — | all | All reimbursements for a user |
| `PATCH` | `/rest/reimbursements` | `{ reimbursementId, decision }` | RM, APE, CFO | Approve/reject |

---

## Approval Flow

```
EMP creates → status: PENDING, rmDecision: PENDING, apeDecision: PENDING
      ↓
RM approves → rmDecision: APPROVED, status: PENDING
      ↓
APE approves → apeDecision: APPROVED, status: APPROVED
```

If RM **rejects** → `rmDecision: REJECTED`, `status: REJECTED` (final)  
If APE **rejects** → `apeDecision: REJECTED`, `status: REJECTED` (final)

---

## Response Format

### Success
```json
{ "success": true, "message": "...", "data": { ... } }
```

### Error
```json
{ "success": false, "message": "...", "errors": { ... } }
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with nodemon |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate SQL migrations from schema |
| `npm run db:migrate` | Apply migrations to database |
| `npm run db:seed-data` | Seed CFO account |
