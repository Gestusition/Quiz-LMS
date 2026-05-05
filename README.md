# Quiz LMS (UZEM / Moodle-Style)

A vanilla JavaScript + Express + SQLite LMS with layered architecture (`routes -> services -> repositories`) and defensive academic workflows.

## What Is Implemented

- Role-based LMS: `admin`, `teacher`, `student`
- Secure auth with salted+spiced passwords and session tokens
- Login by **unique identifier**: `email` (primary), `student_number`, `employee_number` (teacher profile), legacy unique username fallback
- Admin user management with search/filter/pagination and profile editing
- Duplicate protection with safe conflict responses (`409`) for email/student number/employee number
- Course + offering + enrollment + term/faculty/department/class/section management
- Quiz/exam lifecycle with timed attempts, max attempts, result visibility policy, negative marking, SEB compatible mode checks
- Question integrity checks and invalid-question isolation
- Grade scheme + letter-grade pending-review safety behavior
- Assignment and attendance modules
- Course weekly materials and discussion board
- Validation issue tracking (`validation_issues`)
- Import batch/error workflow foundation (`import_batches`, `import_errors`)
- User restriction system (`user_restrictions`) with scoped blocks
- Audit logging (`audit_logs`) for key academic/admin events
- Role dashboards and richer course detail UI
- Swagger docs and Jest tests

## Architecture

- `repositories/`: raw SQLite queries only
- `services/`: business rules, access checks, grading logic, restrictions
- `validators/`: centralized limits and field-safe validation errors
- `serializers/`: response normalization
- `routes/`: thin HTTP layer

No SQL in route handlers, no frontend-only fake logic for backend features.

## Security and Identity

Authentication is based on unique academic identifiers, not display-name collisions.

Login identifier resolution order:
1. `email`
2. `student_number`
3. `employee_number`
4. legacy `username` (only as compatibility fallback)

If an identifier is ambiguous, login is rejected with a safe message.

## SEB Compatibility Note

This project implements **SEB compatible mode checks** (request header/user-agent style gating) for quiz start restrictions. It does **not** claim full production-grade Safe Exam Browser hard security integration.

## Run

```bash
npm install
npm run dev
```

- App: `http://localhost:3000`
- Swagger: `http://localhost:3000/api-docs`

## Test

```bash
npm test
```

## Main API Groups

- `/api/auth`
- `/api/users`
- `/api/courses`
- `/api/categories`
- `/api/questions`
- `/api/quizzes`
- `/api/academic`
- `/api/analytics`
- `/api/restrictions`
- `/api/issues`
- `/api/imports`
- `/api/discussion`
- `/api/weeks`
- `/api/audit`

## Project Structure

```text
quiz-web/
├── constants/
├── database/
├── middleware/
├── public/
├── repositories/
├── routes/
├── serializers/
├── services/
├── swagger/
├── tests/
├── utils/
├── validators/
└── server.js
```
