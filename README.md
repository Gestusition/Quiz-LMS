# Quiz LMS

Quiz LMS is a full-stack course and quiz management system built for the System Analysis and Design CRUD project requirements. It uses a vanilla JavaScript single-page frontend, an Express REST API, and SQLite databases with a layered backend structure.

The project is intentionally backend-heavy: routes stay thin, business rules live in services, SQL lives in repositories, and tests exercise the academic workflows instead of only checking that pages render.

## Requirement Coverage

- Vanilla JavaScript SPA: `public/index.html` and `public/js/` use browser modules and `fetch`, with no React/Vue/Angular.
- Node.js + Express backend: `server.js` mounts the REST API and static SPA.
- Database-backed CRUD: SQLite stores users, courses, categories, questions, quizzes, attempts, enrollments, academic records, audit logs, settings, and more.
- REST/JSON API: endpoints use standard HTTP methods and JSON request/response bodies.
- Validation: backend validators and service checks protect academic identifiers, question formats, quiz settings, uploads, passwords, and scoped access rules.
- Modular code quality: `routes -> services -> repositories`, plus `validators`, `serializers`, `constants`, and middleware.
- Swagger: interactive API documentation is available at `/api-docs`.
- Tests: Jest covers auth, maintenance mode, quiz attempts, academic workflows, validators, rate limiting, route mounts, and LMS regressions.

## Main Features

- Role-based accounts for `admin`, `teacher`, and `student`.
- Strict academic login identifiers:
  - admins log in with `username` or `email`
  - teachers log in with `email`
  - students log in with `student_number`
- Maintenance mode for fresh installs and controlled rollout.
- Admin user management with search, filtering, pagination, duplicate protection, profile data, and password reset codes.
- Course, offering, enrollment, term, faculty, department, class year, and section management.
- Question bank with categories, difficulty, multiple question types, math/table questions, image upload, validation issues, and sharing controls.
- Quiz lifecycle with drafts, publishing, timed attempts, max attempts, result visibility policies, negative marking, manual review, templates, grade schemes, and SEB-compatible checks.
- Assignment submission and grading workflows.
- Attendance sessions, self-attendance, instructor records, record removal notes, and summaries.
- Weekly course materials, protected resource downloads, and discussion threads.
- User restrictions, scoped access blocking, audit logging, import batch/error workflow foundation, and admin analytics.

## First Run / Maintenance Mode

Fresh installs start in maintenance mode. Teachers and students cannot sign in until an admin disables maintenance mode.

Default admin:

- username: `admin`
- password: `Admin123!`

After first login, the default admin must change the username and password. Then open `Maintenance` from the admin navbar and turn maintenance mode off. Teacher and student logins will work after that.

Default seeded demo users:

- teacher: `teacher@example.com` / `Teacher123!`
- student: `STU-0003` / `Student123!`

## Setup

Requires Node.js `>=22.13.0` because the database layer uses `node:sqlite`.

```bash
npm ci
npm run dev
```

- App: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/api-docs`
- Raw OpenAPI JSON: `http://localhost:3000/api-docs.json`
- Health check: `http://localhost:3000/api/health`

Swagger is admin-only, so sign in as an admin first.

## Environment

Development works without a `.env` file. Production should set these:

- `NODE_ENV=production`
- `PASSWORD_SPICE`: required in production for password/session hashing.
- `JWT_SECRET`: required in production for session JWT signing.
- `PORT`: optional, defaults to `3000`.
- `CORS_ORIGINS`: optional comma-separated list for non-localhost origins.

Session cookies are `HttpOnly` and `SameSite=Strict`. They use the `Secure` attribute in production so HTTPS deployments stay protected, while local `http://localhost:3000` browser testing keeps sessions across refreshes.

## Tests

```bash
npm test
npm run coverage
```

The main suite includes backend unit/integration tests for auth, maintenance mode, user identity rules, quiz attempts and grading, academic records, validators, route mounts, and API documentation coverage.

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
- `/api/settings`

## Architecture

```text
quiz-web/
|-- constants/      Shared enums, limits, and issue codes
|-- database/       SQLite initialization, schema, and seed data
|-- middleware/     Auth, rate limiting, validation, and upload guards
|-- public/         Vanilla JS SPA, CSS, and client-side pages
|-- repositories/   Raw SQLite data access
|-- routes/         Thin Express route handlers and Swagger JSDoc
|-- serializers/    API response normalization
|-- services/       Business rules and academic workflows
|-- swagger/        Swagger/OpenAPI setup
|-- tests/          Jest test suites
|-- utils/          Security, validation, and error helpers
|-- validators/     Input validation modules
`-- server.js       Express app entry point
```

## Security Notes

- Passwords are stored as salted and spiced `scrypt` hashes, never plaintext.
- Session tokens are server-set cookies; the frontend does not store tokens in `localStorage`.
- Query-string, Authorization header, and custom-header session tokens are rejected.
- Maintenance mode blocks teacher/student login and revokes existing non-admin sessions when re-enabled.
- Protected upload directories are not directly browsable; downloads go through authenticated endpoints.
- Production startup fails fast if required crypto secrets are missing.

## SEB Compatibility Note

Quiz LMS implements SEB-compatible request checks for quiz start restrictions. It does not claim full production-grade Safe Exam Browser hard security integration.

## License

MIT. See [LICENSE](LICENSE).
