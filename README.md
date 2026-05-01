# Quiz Manager 📝

A full-stack web application for managing quiz categories, questions, and taking interactive quizzes. Built with Node.js, Express, SQLite, and Vanilla JavaScript.

## Features

- **Full CRUD Operations** — Create, read, update, and delete both categories and questions
- **RESTful API** — Clean REST endpoints with proper HTTP methods and status codes
- **Interactive Frontend** — Single-page application (SPA) with hash-based routing
- **Quiz Mode** — Take randomized quizzes filtered by category and difficulty
- **Search & Filter** — Find questions by text, category, difficulty, or type
- **Swagger API Docs** — Interactive API documentation at `/api-docs`
- **Input Validation** — Both frontend and backend validation
- **Unit Tests** — Jest tests for all business logic

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML, CSS, JavaScript (SPA) |
| Backend | Node.js + Express |
| Database | SQLite (via better-sqlite3) |
| API Docs | Swagger UI + swagger-jsdoc |
| Testing | Jest |

## Project Structure

```
quiz-web/
├── server.js                 # Express entry point
├── database/
│   └── db.js                 # SQLite initialization & seed data
├── services/
│   ├── categoryService.js    # Category business logic
│   └── questionService.js    # Question business logic
├── routes/
│   ├── categoryRoutes.js     # /api/categories endpoints
│   └── questionRoutes.js     # /api/questions endpoints
├── middleware/
│   └── validation.js         # Input validation middleware
├── swagger/
│   └── swagger.js            # Swagger/OpenAPI configuration
├── tests/
│   ├── category.test.js      # Category service unit tests
│   └── question.test.js      # Question service unit tests
├── public/                   # Frontend (served as static files)
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── api.js            # API client (fetch wrapper)
│       ├── app.js            # SPA router & dashboard/quiz logic
│       ├── categories.js     # Categories page UI
│       └── questions.js      # Questions page UI
├── package.json
└── README.md
```

## Setup & Installation

### Prerequisites
- **Node.js** v18 or higher
- **npm** (comes with Node.js)

### Steps

1. **Navigate to the project directory:**
   ```bash
   cd quiz-web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - Application: [http://localhost:3000](http://localhost:3000)
   - Swagger API Docs: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

The database file (`quiz.db`) is created automatically on first run with sample seed data.

## Running Tests

```bash
npm test
```

This runs Jest unit tests for the category and question services. Tests cover:
- All CRUD operations
- Input validation and edge cases
- Filtering and search
- Error handling

## API Endpoints

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| GET | `/api/categories/:id` | Get a category by ID |
| POST | `/api/categories` | Create a category |
| PUT | `/api/categories/:id` | Update a category |
| DELETE | `/api/categories/:id` | Delete a category (cascades to questions) |

### Questions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/questions` | List all questions (supports query filters) |
| GET | `/api/questions/random` | Get random questions for a quiz |
| GET | `/api/questions/:id` | Get a question by ID |
| POST | `/api/questions` | Create a question |
| PUT | `/api/questions/:id` | Update a question |
| DELETE | `/api/questions/:id` | Delete a question |

### Query Parameters for GET /api/questions

| Parameter | Type | Description |
|-----------|------|-------------|
| `categoryId` | integer | Filter by category |
| `difficulty` | string | `EASY`, `MEDIUM`, or `HARD` |
| `type` | string | `MC`, `TF`, or `FB` |
| `search` | string | Search in question text |

### Example: Create a Question

```bash
curl -X POST http://localhost:3000/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": 1,
    "text": "What is the capital of Turkey?",
    "type": "MC",
    "options": ["Istanbul", "Ankara", "Izmir", "Antalya"],
    "correctAnswer": "1",
    "difficulty": "EASY"
  }'
```

## API Documentation (Swagger)

Interactive API documentation is available at:
```
http://localhost:3000/api-docs
```

You can explore all endpoints, view request/response schemas, and test the API directly from the browser.

## Data Model

### Category
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| name | TEXT | Unique category name |
| description | TEXT | Category description |
| createdAt | TEXT | Creation timestamp |

### Question
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| categoryId | INTEGER | Foreign key → categories(id) |
| text | TEXT | Question text |
| type | TEXT | `MC` / `TF` / `FB` |
| options | TEXT | JSON array (for MC) |
| correctAnswer | TEXT | Correct answer |
| difficulty | TEXT | `EASY` / `MEDIUM` / `HARD` |
| createdAt | TEXT | Creation timestamp |
