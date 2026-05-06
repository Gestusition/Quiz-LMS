# Quiz LMS (UZEM / Moodle-Style)

A vanilla JavaScript + Express + SQLite LMS with layered architecture (`routes -> services -> repositories`) and defensive academic workflows.

## What Is Implemented

- Role-based LMS: `admin`, `teacher`, `student`
- Secure auth with salted+spiced passwords and session tokens
- Strict academic login identifiers by role: admins use `email` or `username`, teachers use `email`, students use `student_number`
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

Authentication is based on role-specific academic identifiers, not display-name collisions.

Login identifiers are intentionally strict:
1. Admins can log in with `email` or `username`.
2. Teachers must log in with `email`.
3. Students must log in with `student_number`.

Student email login, teacher employee-number login, and teacher username login are rejected even when the password is correct. If an identifier is ambiguous across academic identifiers, login is rejected with a safe message.

This is a SPA bearer-token demo implementation. Production should use server-set HttpOnly, Secure, SameSite cookies and should not accept session tokens through query parameters.

## SEB Compatibility Note

This project implements **SEB compatible mode checks** (request header/user-agent style gating) for quiz start restrictions. It does **not** claim full production-grade Safe Exam Browser hard security integration.

## Run

Requires Node.js `>=22.13.0` because the database layer uses `node:sqlite`.

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
