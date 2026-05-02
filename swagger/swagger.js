const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { requireAuth, requireRole } = require('../middleware/auth');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Quiz Manager API',
      version: '1.0.0',
      description: 'RESTful API for a role-based quiz LMS. Supports secure auth, users, courses, enrollments, question bank CRUD, quiz publishing, attempts, grading, and course content.',
      contact: {
        name: 'Quiz Manager'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer'
        }
      },
      responses: {
        '400BadRequest': {
          description: 'Validation or business logic error',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
        },
        '401Unauthorized': {
          description: 'Unauthenticated or invalid token',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
        },
        '403Forbidden': {
          description: 'Forbidden - Insufficient permissions or role',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
        },
        '404NotFound': {
          description: 'Resource not found',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
        },
        '500ServerError': {
          description: 'Internal server error',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
        }
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        },
        MessageResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['identifier', 'password'],
          properties: {
            identifier: { type: 'string', description: 'Username or email' },
            password: { type: 'string' }
          }
        },
        AuthSession: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            expiresAt: { type: 'string', format: 'date-time' },
            user: { $ref: '#/components/schemas/CurrentUser' }
          }
        },
        CurrentUser: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            mustChangeCredentials: { type: 'integer' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'teacher', 'student'] },
            status: { type: 'string', enum: ['active', 'inactive'] },
            mustChangeCredentials: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateUserRequest: {
          type: 'object',
          required: ['name', 'username', 'email', 'role', 'password'],
          properties: {
            name: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'teacher', 'student'] },
            password: { type: 'string' },
            status: { type: 'string', enum: ['active', 'inactive'] },
            mustChangeCredentials: { type: 'boolean' }
          }
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'teacher', 'student'] },
            status: { type: 'string', enum: ['active', 'inactive'] },
            mustChangeCredentials: { type: 'boolean' },
            password: { type: 'string' }
          }
        },
        SetUserPasswordRequest: {
          type: 'object',
          required: ['password'],
          properties: {
            password: { type: 'string' }
          }
        },
        PasswordResetRequest: {
          type: 'object',
          required: ['identifier'],
          properties: {
            identifier: { type: 'string', description: 'Username or email' }
          }
        },
        PasswordResetCompleteRequest: {
          type: 'object',
          required: ['username', 'code', 'newPassword'],
          properties: {
            username: { type: 'string' },
            code: { type: 'string' },
            newPassword: { type: 'string' }
          }
        },
        ChangeCredentialsRequest: {
          type: 'object',
          required: ['username', 'currentPassword', 'newPassword'],
          properties: {
            username: { type: 'string' },
            currentPassword: { type: 'string' },
            newPassword: { type: 'string' }
          }
        },
        Course: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            visibility: { type: 'string', enum: ['public', 'private'] },
            startDate: { type: 'string', format: 'date-time', nullable: true },
            endDate: { type: 'string', format: 'date-time', nullable: true },
            createdBy: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            studentCount: { type: 'integer' },
            teacherCount: { type: 'integer' },
            quizCount: { type: 'integer' }
          }
        },
        CreateCourseRequest: {
          type: 'object',
          required: ['code', 'title'],
          properties: {
            code: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            visibility: { type: 'string', enum: ['public', 'private'] },
            startDate: { type: 'string', format: 'date-time', nullable: true },
            endDate: { type: 'string', format: 'date-time', nullable: true }
          }
        },
        UpdateCourseRequest: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            visibility: { type: 'string', enum: ['public', 'private'] },
            startDate: { type: 'string', format: 'date-time', nullable: true },
            endDate: { type: 'string', format: 'date-time', nullable: true }
          }
        },
        Enrollment: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            courseId: { type: 'integer' },
            userId: { type: 'integer' },
            role: { type: 'string', enum: ['teacher', 'student'] },
            status: { type: 'string', enum: ['active', 'dropped'] },
            enrolledAt: { type: 'string', format: 'date-time' }
          }
        },
        Participant: {
          type: 'object',
          properties: {
            enrollmentId: { type: 'integer' },
            userId: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['teacher', 'student'] },
            status: { type: 'string', enum: ['active', 'dropped'] },
            enrolledAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateEnrollmentRequest: {
          type: 'object',
          required: ['userId', 'role'],
          properties: {
            userId: { type: 'integer' },
            role: { type: 'string', enum: ['teacher', 'student'] }
          }
        },
        UpdateEnrollmentRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['active', 'dropped'] }
          }
        },
        Announcement: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            courseId: { type: 'integer' },
            title: { type: 'string' },
            body: { type: 'string' },
            createdBy: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateAnnouncementRequest: {
          type: 'object',
          required: ['title', 'body'],
          properties: {
            title: { type: 'string' },
            body: { type: 'string' }
          }
        },
        Resource: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            courseId: { type: 'integer' },
            title: { type: 'string' },
            type: { type: 'string' },
            url: { type: 'string' },
            description: { type: 'string' },
            createdBy: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateResourceRequest: {
          type: 'object',
          required: ['title', 'url'],
          properties: {
            title: { type: 'string' },
            type: { type: 'string' },
            url: { type: 'string' },
            description: { type: 'string' }
          }
        },
        Gradebook: {
          type: 'object',
          properties: {
            quizzes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  title: { type: 'string' },
                  maxScore: { type: 'number' }
                }
              }
            },
            students: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  userId: { type: 'integer' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  scores: {
                    type: 'object',
                    additionalProperties: { type: 'number' },
                    description: 'Key is quizId, value is the score'
                  }
                }
              }
            }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            courseId: { type: 'integer', nullable: true },
            name: { type: 'string' },
            description: { type: 'string' },
            courseTitle: { type: 'string', nullable: true },
            questionCount: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateCategoryRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            courseId: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' }
          }
        },
        UpdateCategoryRequest: {
          type: 'object',
          properties: {
            courseId: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' }
          }
        },
        Question: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            categoryId: { type: 'integer' },
            text: { type: 'string' },
            type: { type: 'string', enum: ['MC', 'TF', 'FB'] },
            options: { type: 'array', items: { type: 'string' } },
            correctAnswer: { type: 'string' },
            difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
            points: { type: 'number' },
            createdBy: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            categoryName: { type: 'string' },
            courseId: { type: 'integer', nullable: true },
            courseTitle: { type: 'string', nullable: true }
          }
        },
        CreateQuestionRequest: {
          type: 'object',
          required: ['categoryId', 'text', 'type', 'correctAnswer'],
          properties: {
            categoryId: { type: 'integer' },
            text: { type: 'string' },
            type: { type: 'string', enum: ['MC', 'TF', 'FB'] },
            options: { type: 'array', items: { type: 'string' } },
            correctAnswer: { type: 'string' },
            difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
            points: { type: 'number' }
          }
        },
        UpdateQuestionRequest: {
          type: 'object',
          properties: {
            categoryId: { type: 'integer' },
            text: { type: 'string' },
            type: { type: 'string', enum: ['MC', 'TF', 'FB'] },
            options: { type: 'array', items: { type: 'string' } },
            correctAnswer: { type: 'string' },
            difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
            points: { type: 'number' }
          }
        },
        Quiz: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            courseId: { type: 'integer' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['draft', 'published', 'archived'] },
            openAt: { type: 'string', format: 'date-time', nullable: true },
            closeAt: { type: 'string', format: 'date-time', nullable: true },
            timeLimitMinutes: { type: 'integer', nullable: true },
            attemptsAllowed: { type: 'integer' },
            shuffleQuestions: { type: 'integer' },
            showCorrectAnswers: { type: 'integer' },
            createdBy: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            courseTitle: { type: 'string' },
            courseCode: { type: 'string' },
            questionCount: { type: 'integer' },
            maxScore: { type: 'number' },
            isOpen: { type: 'integer' }
          }
        },
        CreateQuizRequest: {
          type: 'object',
          required: ['courseId', 'title'],
          properties: {
            courseId: { type: 'integer' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['draft', 'published', 'archived'] },
            openAt: { type: 'string', format: 'date-time', nullable: true },
            closeAt: { type: 'string', format: 'date-time', nullable: true },
            timeLimitMinutes: { type: 'integer', nullable: true },
            attemptsAllowed: { type: 'integer' },
            shuffleQuestions: { type: 'boolean' },
            showCorrectAnswers: { type: 'boolean' }
          }
        },
        UpdateQuizRequest: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['draft', 'published', 'archived'] },
            openAt: { type: 'string', format: 'date-time', nullable: true },
            closeAt: { type: 'string', format: 'date-time', nullable: true },
            timeLimitMinutes: { type: 'integer', nullable: true },
            attemptsAllowed: { type: 'integer' },
            shuffleQuestions: { type: 'boolean' },
            showCorrectAnswers: { type: 'boolean' }
          }
        },
        SetQuizQuestionsRequest: {
          type: 'object',
          required: ['questionIds'],
          properties: {
            questionIds: { type: 'array', items: { type: 'integer' } }
          }
        },
        QuizAttempt: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            quizId: { type: 'integer' },
            userId: { type: 'integer' },
            attemptNumber: { type: 'integer' },
            status: { type: 'string', enum: ['in_progress', 'submitted'] },
            startedAt: { type: 'string', format: 'date-time' },
            submittedAt: { type: 'string', format: 'date-time', nullable: true },
            score: { type: 'number', nullable: true },
            maxScore: { type: 'number' },
            percentage: { type: 'number', nullable: true },
            timeSpentSeconds: { type: 'integer', nullable: true },
            quizTitle: { type: 'string' },
            courseId: { type: 'integer' },
            studentName: { type: 'string' },
            studentEmail: { type: 'string' }
          }
        },
        SubmitAttemptRequest: {
          type: 'object',
          properties: {
            answers: {
              type: 'object',
              additionalProperties: { type: 'string' },
              description: 'Key is questionId, value is the answer'
            },
            timeSpentSeconds: { type: 'integer' }
          }
        },
        AttemptAnswer: {
          type: 'object',
          properties: {
            questionId: { type: 'integer' },
            answer: { type: 'string' },
            isCorrect: { type: 'integer' },
            pointsAwarded: { type: 'number' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Login, logout, and current user endpoints' },
      { name: 'Users', description: 'Admin user management endpoints' },
      { name: 'Courses', description: 'Course, enrollment, content, and gradebook endpoints' },
      { name: 'Quizzes', description: 'Quiz publishing, attempts, and grading endpoints' },
      { name: 'Categories', description: 'Question category management endpoints' },
      { name: 'Questions', description: 'Question bank endpoints' }
    ]
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * Setup Swagger UI middleware on the given Express app.
 * @param {import('express').Application} app - The Express application.
 */
function setupSwagger(app) {
  app.use('/api-docs', requireAuth, requireRole('admin'), swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Quiz Manager API Docs'
  }));

  // Serve raw JSON spec
  app.get('/api-docs.json', requireAuth, requireRole('admin'), (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

module.exports = { setupSwagger };
