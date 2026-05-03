# Quiz LMS

> **🚧 Work in Progress:** Development of this application is ongoing. The current README might reflect an older version of the application or lack details about newly added features and recent architectural changes.

A vanilla JavaScript, Express, and SQLite learning management system focused on secure quiz delivery. It keeps the SAD project requirements intact: SPA frontend, REST API, full CRUD, validation, service-layer business logic, unit tests, Swagger documentation, and Git-friendly structure.

## Features

- Role-based accounts: `admin`, `teacher`, and `student`
- Password hashing with per-user salt plus application-level spice via `PASSWORD_SPICE`
- Session-token login/logout with server-side session storage
- Admin-issued one-time password reset codes for teacher and student accounts
- Course CRUD, enrollment, participants, announcements, and resources
- Teacher/admin question bank with categories, difficulty, points, and question types
- Quiz publishing with attempts allowed, shuffle flag, time limit field, and answer visibility setting
- Student quiz attempts with server-side grading and hidden correct answers during the attempt
- Gradebook per course for teachers/admins
- Multi-database SQLite layout with one file per bounded context
- SQLite WAL mode for concurrent local access
- Swagger UI at `/api-docs`
- Jest unit tests for business logic

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Vanilla HTML, CSS, JavaScript SPA |
| Backend | Node.js + Express |
| Database | SQLite through `node:sqlite` |
| API Docs | Swagger UI + swagger-jsdoc |
| Testing | Jest |

## Setup

```bash
npm install
npm run dev
```

Open:

- App: `http://localhost:3000`
- Swagger: `http://localhost:3000/api-docs`

The databases are created automatically under `data/`:

| File | Responsibility |
| --- | --- |
| `data/quiz.users.sqlite` | All users, salted password hashes, sessions, and password reset requests |
| `data/quiz.admin.sqlite` | Admin-only profile records |
| `data/quiz.teacher.sqlite` | Teacher-only profile records |
| `data/quiz.student.sqlite` | Student-only profile records |
| `data/quiz.learning.sqlite` | Courses, enrollments, and question categories |
| `data/quiz.assessment.sqlite` | Questions, quizzes, attempts, answers, and grades |
| `data/quiz.content.sqlite` | Announcements and resources |

If an old single-file `quiz.db` or older `data/quiz.identity.sqlite` exists, the app attempts a one-time copy into the split databases before seeding missing demo data. Runtime uses only the split `data/quiz.*.sqlite` files, so legacy database files can be removed after migration. Runtime database files are ignored by Git.

## Default Accounts

These accounts are seeded on first run. Login accepts either username or email.

| Role | Username | Email | Password | First-login action |
| --- | --- | --- | --- | --- |
| Admin | `admin` | `admin@example.com` | `Admin123!` | Must change username and password |
| Teacher | `teacher` | `teacher@example.com` | `Teacher123!` | None |
| Student | `student` | `student@example.com` | `Student123!` | None |

The default admin can authenticate, but every protected endpoint is blocked until `POST /api/auth/change-credentials` replaces both the default username and password.

For production-like use, set a strong secret before first run:

```bash
$env:PASSWORD_SPICE="replace-with-a-long-random-secret"
npm run dev
```

Changing `PASSWORD_SPICE` after users are created invalidates existing password hashes, which is expected for a pepper/spice secret.

## Scripts

```bash
npm test
npm start
```

`npm test` runs the service-layer tests. Current coverage includes category CRUD, question CRUD/validation, seeded auth login, invalid-password rejection, and server-side quiz attempt grading.

## API Overview

Authentication:

- `POST /api/auth/login`
- `POST /api/auth/password-reset/request`
- `POST /api/auth/password-reset/complete`
- `POST /api/auth/change-credentials`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Users:

- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/:id`
- `PUT /api/users/:id/password`
- `GET /api/users/password-reset-requests`
- `POST /api/users/:id/password-reset-code`
- `DELETE /api/users/:id`

Courses:

- `GET /api/courses`
- `POST /api/courses`
- `GET /api/courses/:id`
- `PUT /api/courses/:id`
- `DELETE /api/courses/:id`
- `GET /api/courses/:id/participants`
- `POST /api/courses/:id/enrollments`
- `GET /api/courses/:id/announcements`
- `POST /api/courses/:id/announcements`
- `GET /api/courses/:id/resources`
- `POST /api/courses/:id/resources`
- `GET /api/courses/:id/gradebook`

Question Bank:

- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`
- `GET /api/questions`
- `POST /api/questions`
- `PUT /api/questions/:id`
- `DELETE /api/questions/:id`

Quizzes:

- `GET /api/quizzes`
- `POST /api/quizzes`
- `GET /api/quizzes/:id`
- `PUT /api/quizzes/:id`
- `PUT /api/quizzes/:id/questions`
- `POST /api/quizzes/:id/attempts`
- `GET /api/quizzes/:id/attempts`
- `GET /api/quizzes/attempts/:id`
- `POST /api/quizzes/attempts/:id/submit`

Authenticated API requests use:

```http
Authorization: Bearer <session-token>
```

## Project Structure

```text
quiz-web/
├── constants/                # Application constants and enums
├── data/                     # Local runtime SQLite files, ignored by Git
├── database/                 # Database connection and setup
├── middleware/               # Express middleware (auth, validation)
├── public/                   # Vanilla JS frontend SPA (HTML/CSS/JS)
├── repositories/             # Data access layer
├── routes/                   # Express API route definitions
├── serializers/              # Response formatting and data transformation
├── services/                 # Core business logic layer
├── swagger/                  # OpenAPI/Swagger documentation configurations
├── tests/                    # Jest unit tests
├── utils/                    # Shared utility functions
├── validators/               # Input validation schemas and logic
└── server.js                 # Application entry point
```
