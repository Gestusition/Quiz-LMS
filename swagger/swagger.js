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
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'auth_token'
        }
      },
      responses: {
        '400BadRequest': {
          description: 'Validation or business logic error',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
        },
        '401Unauthorized': {
          description: 'Unauthenticated or invalid session',
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
            error: { type: 'string' },
            field: { type: 'string' },
            message: { type: 'string' },
            code: { type: 'string' },
            restriction_type: { type: 'string' }
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
            identifier: { type: 'string', description: 'Role-based login identifier: student_number for students, email for teachers, email/username for admins' },
            password: { type: 'string' }
          }
        },
        AuthSession: {
          type: 'object',
          properties: {
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
            mustChangeCredentials: { type: 'boolean' },
            studentNumber: { type: 'string', description: 'Student profile field, present for students' },
            cohort: { type: 'string', description: 'Student profile field, present for students' },
            facultyId: { type: 'integer', nullable: true },
            departmentId: { type: 'integer', nullable: true },
            classYearId: { type: 'integer', nullable: true },
            sectionId: { type: 'integer', nullable: true },
            facultyName: { type: 'string' },
            departmentName: { type: 'string' },
            classYearName: { type: 'string' },
            sectionName: { type: 'string' },
            department: { type: 'string', description: 'Teacher profile field, present for teachers' },
            academicTitle: { type: 'string' },
            staffNumber: { type: 'string' },
            officeHours: { type: 'string', description: 'Teacher profile field, present for teachers' },
            displayName: { type: 'string', description: 'Admin profile field, present for admins' },
            adminTitle: { type: 'string' }
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
            status: { type: 'string', enum: ['active', 'disabled'] },
            mustChangeCredentials: { type: 'boolean' },
            studentNumber: { type: 'string', description: 'Required when role is student' },
            cohort: { type: 'string' },
            facultyId: { type: 'integer', nullable: true },
            departmentId: { type: 'integer', nullable: true },
            classYearId: { type: 'integer', nullable: true },
            sectionId: { type: 'integer', nullable: true },
            facultyName: { type: 'string' },
            departmentName: { type: 'string' },
            classYearName: { type: 'string' },
            sectionName: { type: 'string' },
            department: { type: 'string' },
            academicTitle: { type: 'string' },
            staffNumber: { type: 'string' },
            officeHours: { type: 'string' },
            displayName: { type: 'string' },
            adminTitle: { type: 'string' },
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
            status: { type: 'string', enum: ['active', 'disabled'] },
            mustChangeCredentials: { type: 'boolean' },
            studentNumber: { type: 'string', description: 'Required when role is student; unique across student profiles' },
            cohort: { type: 'string' },
            facultyId: { type: 'integer', nullable: true },
            departmentId: { type: 'integer', nullable: true },
            classYearId: { type: 'integer', nullable: true },
            sectionId: { type: 'integer', nullable: true },
            department: { type: 'string' },
            academicTitle: { type: 'string' },
            staffNumber: { type: 'string' },
            officeHours: { type: 'string' },
            displayName: { type: 'string' },
            adminTitle: { type: 'string' }
          }
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'teacher', 'student'] },
            status: { type: 'string', enum: ['active', 'disabled'] },
            mustChangeCredentials: { type: 'boolean' },
            password: { type: 'string' },
            studentNumber: { type: 'string', description: 'Required if resulting role is student and no existing student number exists' },
            cohort: { type: 'string' },
            facultyId: { type: 'integer', nullable: true },
            departmentId: { type: 'integer', nullable: true },
            classYearId: { type: 'integer', nullable: true },
            sectionId: { type: 'integer', nullable: true },
            department: { type: 'string' },
            academicTitle: { type: 'string' },
            staffNumber: { type: 'string' },
            officeHours: { type: 'string' },
            displayName: { type: 'string' },
            adminTitle: { type: 'string' }
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
            identifier: { type: 'string', description: 'Email or academic identifier' }
          }
        },
        PasswordResetCompleteRequest: {
          type: 'object',
          required: ['identifier', 'code', 'newPassword'],
          properties: {
            identifier: { type: 'string', description: 'Email or academic identifier' },
            code: { type: 'string' },
            newPassword: { type: 'string' }
          }
        },
        UserListResponse: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/User' }
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' }
              }
            }
          }
        },
        PasswordResetCodeResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            userId: { type: 'integer' },
            username: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string' },
            code: { type: 'string' },
            expiresAt: { type: 'string', format: 'date-time' }
          }
        },
        PasswordResetRequestStatus: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            userId: { type: 'integer' },
            requestedUsername: { type: 'string' },
            status: { type: 'string' },
            expiresAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            issuedAt: { type: 'string', format: 'date-time', nullable: true },
            name: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            userStatus: { type: 'string' }
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
            departmentId: { type: 'integer', nullable: true },
            departmentName: { type: 'string', nullable: true },
            credits: { type: 'integer' },
            visibility: { type: 'string', enum: ['private', 'published', 'archived'] },
            startDate: { type: 'string', format: 'date-time', nullable: true },
            endDate: { type: 'string', format: 'date-time', nullable: true },
            createdBy: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            studentCount: { type: 'integer' },
            teacherCount: { type: 'integer' },
            quizCount: { type: 'integer' },
            offeringCount: { type: 'integer' }
          }
        },
        CreateCourseRequest: {
          type: 'object',
          required: ['code', 'title'],
          properties: {
            code: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            departmentId: { type: 'integer', nullable: true },
            credits: { type: 'integer' },
            visibility: { type: 'string', enum: ['private', 'published', 'archived'] },
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
            departmentId: { type: 'integer', nullable: true },
            credits: { type: 'integer' },
            visibility: { type: 'string', enum: ['private', 'published', 'archived'] },
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
            status: { type: 'string', enum: ['active', 'suspended'] },
            enrolledAt: { type: 'string', format: 'date-time' }
          }
        },
        Participant: {
          type: 'object',
          properties: {
            enrollmentId: { type: 'integer' },
            courseRole: { type: 'string', enum: ['teacher', 'student'] },
            enrollmentStatus: { type: 'string', enum: ['active', 'suspended'] },
            enrolledAt: { type: 'string', format: 'date-time' },
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'teacher', 'student'] },
            status: { type: 'string', enum: ['active', 'disabled'] },
            studentNumber: { type: 'string', description: 'Present for student participants' },
            cohort: { type: 'string', description: 'Present for student participants' },
            department: { type: 'string', description: 'Present for teacher participants' }
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
            status: { type: 'string', enum: ['active', 'suspended'] }
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
            type: { type: 'string', enum: ['link', 'file', 'page'] },
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
            type: { type: 'string', enum: ['link', 'file', 'page'] },
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
                  id: { type: 'integer' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  studentNumber: { type: 'string' },
                  cohort: { type: 'string' },
                  average: { type: 'number' },
                  quizzes: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        quizId: { type: 'integer' },
                        quizTitle: { type: 'string' },
                        percentage: { type: 'number' },
                        score: { type: 'number' },
                        maxScore: { type: 'number' }
                      }
                    }
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
            type: { type: 'string', enum: ['MC', 'TF', 'FB', 'MT', 'MP', 'SA', 'ES', 'OR', 'MR'] },
            options: { type: 'array', items: { type: 'string' } },
            correctAnswer: { type: 'string' },
            acceptedAnswers: { type: 'array', items: { type: 'string' } },
            caseSensitive: { type: 'boolean' },
            richText: { type: 'string' },
            explanationText: { type: 'string' },
            hintText: { type: 'string' },
            mediaUrl: { type: 'string' },
            parts: { type: 'array', items: { type: 'object' } },
            tableConfig: { type: 'object' },
            status: { type: 'string', enum: ['valid', 'invalid'] },
            validationMessage: { type: 'string' },
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
          required: ['categoryId', 'text', 'type'],
          properties: {
            categoryId: { type: 'integer' },
            text: { type: 'string' },
            type: { type: 'string', enum: ['MC', 'TF', 'FB', 'MT', 'MP', 'SA', 'ES', 'OR', 'MR'] },
            options: { type: 'array', items: { type: 'string' } },
            correctAnswer: { type: 'string' },
            acceptedAnswers: { type: 'array', items: { type: 'string' } },
            caseSensitive: { type: 'boolean' },
            richText: { type: 'string' },
            explanationText: { type: 'string' },
            hintText: { type: 'string' },
            mediaUrl: { type: 'string', description: 'http(s) URL or /uploads/... raster image path' },
            parts: { type: 'array', items: { type: 'object' } },
            tableConfig: { type: 'object' },
            difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
            points: { type: 'number' }
          }
        },
        UpdateQuestionRequest: {
          type: 'object',
          properties: {
            categoryId: { type: 'integer' },
            text: { type: 'string' },
            type: { type: 'string', enum: ['MC', 'TF', 'FB', 'MT', 'MP', 'SA', 'ES', 'OR', 'MR'] },
            options: { type: 'array', items: { type: 'string' } },
            correctAnswer: { type: 'string' },
            acceptedAnswers: { type: 'array', items: { type: 'string' } },
            caseSensitive: { type: 'boolean' },
            richText: { type: 'string' },
            explanationText: { type: 'string' },
            hintText: { type: 'string' },
            mediaUrl: { type: 'string', description: 'http(s) URL or /uploads/... raster image path' },
            parts: { type: 'array', items: { type: 'object' } },
            tableConfig: { type: 'object' },
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
            status: { type: 'string', enum: ['draft', 'published', 'closed'] },
            startAt: { type: 'string', format: 'date-time', nullable: true },
            endAt: { type: 'string', format: 'date-time', nullable: true },
            durationMinutes: { type: 'integer' },
            maxAttempts: { type: 'integer' },
            shuffleQuestions: { type: 'boolean' },
            shuffleOptions: { type: 'boolean' },
            showCorrectAnswers: { type: 'boolean' },
            showResultPolicy: { type: 'string', enum: ['immediately', 'after_close', 'after_manual_release', 'never'] },
            gradingMode: { type: 'string', enum: ['standard', 'negative_marking', 'manual_review'] },
            penaltyEnabled: { type: 'boolean' },
            penaltyPerWrong: { type: 'number' },
            penaltyRatio: { type: 'number' },
            requiresSeb: { type: 'boolean' },
            sebConfigName: { type: 'string' },
            sebConfigUrl: { type: 'string' },
            manualResultReleasedAt: { type: 'string', format: 'date-time', nullable: true },
            templateName: { type: 'string' },
            createdBy: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            courseTitle: { type: 'string' },
            courseCode: { type: 'string' },
            questionCount: { type: 'integer' },
            maxScore: { type: 'number' },
            isOpen: { type: 'boolean' }
          }
        },
        CreateQuizRequest: {
          type: 'object',
          required: ['courseId', 'title'],
          properties: {
            courseId: { type: 'integer' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['draft', 'closed'], description: 'New quizzes must be created as draft or closed; publish after assigning valid questions.' },
            startAt: { type: 'string', format: 'date-time', nullable: true },
            endAt: { type: 'string', format: 'date-time', nullable: true },
            durationMinutes: { type: 'integer' },
            maxAttempts: { type: 'integer' },
            shuffleQuestions: { type: 'boolean' },
            shuffleOptions: { type: 'boolean' },
            showCorrectAnswers: { type: 'boolean' },
            showResultPolicy: { type: 'string', enum: ['immediately', 'after_close', 'after_manual_release', 'never'] },
            gradingMode: { type: 'string', enum: ['standard', 'negative_marking', 'manual_review'] },
            penaltyEnabled: { type: 'boolean' },
            penaltyPerWrong: { type: 'number' },
            requiresSeb: { type: 'boolean' },
            sebConfigName: { type: 'string' },
            sebConfigUrl: { type: 'string' },
            templateName: { type: 'string' }
          }
        },
        UpdateQuizRequest: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['draft', 'published', 'closed'] },
            startAt: { type: 'string', format: 'date-time', nullable: true },
            endAt: { type: 'string', format: 'date-time', nullable: true },
            durationMinutes: { type: 'integer' },
            maxAttempts: { type: 'integer' },
            shuffleQuestions: { type: 'boolean' },
            shuffleOptions: { type: 'boolean' },
            showCorrectAnswers: { type: 'boolean' },
            showResultPolicy: { type: 'string', enum: ['immediately', 'after_close', 'after_manual_release', 'never'] },
            gradingMode: { type: 'string', enum: ['standard', 'negative_marking', 'manual_review'] },
            penaltyEnabled: { type: 'boolean' },
            penaltyPerWrong: { type: 'number' },
            requiresSeb: { type: 'boolean' },
            sebConfigName: { type: 'string' },
            sebConfigUrl: { type: 'string' },
            templateName: { type: 'string' }
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
            maxScore: { type: 'number', nullable: true },
            percentage: { type: 'number', nullable: true },
            letterGrade: { type: 'string', nullable: true },
            gradeStatus: { type: 'string', enum: ['ready', 'pending_review', 'hidden'] },
            gradeMessage: { type: 'string' },
            hiddenByPolicy: { type: 'boolean' },
            policyMessage: { type: 'string' },
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
        },
        Faculty: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            code: { type: 'string' }
          }
        },
        Department: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            facultyId: { type: 'integer' },
            name: { type: 'string' },
            code: { type: 'string' }
          }
        },
        AcademicTerm: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            academicYear: { type: 'string' },
            semesterType: { type: 'string' },
            startDate: { type: 'string' },
            endDate: { type: 'string' },
            isActive: { type: 'integer' }
          }
        },
        CourseOffering: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            courseId: { type: 'integer' },
            termId: { type: 'integer' },
            instructorId: { type: 'integer', nullable: true },
            status: { type: 'string' },
            courseCode: { type: 'string' },
            courseTitle: { type: 'string' },
            termName: { type: 'string' },
            instructorName: { type: 'string' },
            studentCount: { type: 'integer' }
          }
        },
        Assignment: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            courseOfferingId: { type: 'integer' },
            termId: { type: 'integer' },
            title: { type: 'string' },
            description: { type: 'string' },
            dueDate: { type: 'string' },
            status: { type: 'string' }
          }
        },
        AssignmentSubmission: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            assignmentId: { type: 'integer' },
            studentId: { type: 'integer' },
            submissionText: { type: 'string' },
            submissionUrl: { type: 'string' },
            grade: { type: 'string' },
            feedback: { type: 'string' },
            status: { type: 'string' }
          }
        },
        AttendanceSession: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            courseOfferingId: { type: 'integer' },
            termId: { type: 'integer' },
            sessionDate: { type: 'string' },
            topic: { type: 'string' }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' }
          }
        },
        UserRestriction: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            userId: { type: 'integer' },
            restrictionType: {
              type: 'string',
              enum: ['account_suspended', 'quiz_blocked', 'assignment_blocked', 'chat_muted', 'course_access_blocked', 'manual_review_required']
            },
            scopeType: { type: 'string', enum: ['global', 'course', 'quiz', 'assignment'] },
            scopeId: { type: 'integer', nullable: true },
            reason: { type: 'string' },
            startsAt: { type: 'string', format: 'date-time' },
            endsAt: { type: 'string', format: 'date-time', nullable: true },
            createdBy: { type: 'integer', nullable: true },
            isActive: { type: 'integer', enum: [0, 1] },
            createdAt: { type: 'string', format: 'date-time' },
            userName: { type: 'string' },
            userEmail: { type: 'string' },
            createdByName: { type: 'string', nullable: true }
          }
        },
        CreateUserRestrictionRequest: {
          type: 'object',
          required: ['userId', 'restrictionType'],
          properties: {
            userId: { type: 'integer' },
            restrictionType: {
              type: 'string',
              enum: ['account_suspended', 'quiz_blocked', 'assignment_blocked', 'chat_muted', 'course_access_blocked', 'manual_review_required']
            },
            scopeType: { type: 'string', enum: ['global', 'course', 'quiz', 'assignment'], default: 'global' },
            scopeId: { type: 'integer', nullable: true },
            reason: { type: 'string' },
            startsAt: { type: 'string', format: 'date-time' },
            endsAt: { type: 'string', format: 'date-time' },
            isActive: { type: 'boolean' }
          }
        },
        ValidationIssue: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            entityType: { type: 'string' },
            entityId: { type: 'integer', nullable: true },
            severity: { type: 'string', enum: ['info', 'warning', 'error', 'critical'] },
            field: { type: 'string' },
            message: { type: 'string' },
            status: { type: 'string', enum: ['open', 'resolved', 'ignored'] },
            visibleToUser: { type: 'integer', enum: [0, 1] },
            relatedCourseId: { type: 'integer', nullable: true },
            relatedUserId: { type: 'integer', nullable: true },
            resolvedBy: { type: 'integer', nullable: true },
            resolvedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            resolvedByName: { type: 'string', nullable: true }
          }
        },
        CreateValidationIssueRequest: {
          type: 'object',
          required: ['entityType', 'message'],
          properties: {
            entityType: { type: 'string' },
            entityId: { type: 'integer', nullable: true },
            severity: { type: 'string', enum: ['info', 'warning', 'error', 'critical'], default: 'error' },
            field: { type: 'string' },
            message: { type: 'string' },
            status: { type: 'string', enum: ['open', 'resolved', 'ignored'], default: 'open' },
            visibleToUser: { type: 'boolean' },
            relatedCourseId: { type: 'integer', nullable: true },
            relatedUserId: { type: 'integer', nullable: true }
          }
        },
        UpdateValidationIssueStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['open', 'resolved', 'ignored'] }
          }
        },
        ImportBatch: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            type: { type: 'string', enum: ['users', 'students', 'teachers', 'questions', 'enrollments'] },
            uploadedBy: { type: 'integer', nullable: true },
            fileName: { type: 'string' },
            status: { type: 'string', enum: ['processed', 'partially_failed', 'failed', 'completed'] },
            totalRows: { type: 'integer' },
            successCount: { type: 'integer' },
            failedCount: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateImportBatchRequest: {
          type: 'object',
          required: ['type', 'fileName'],
          properties: {
            type: { type: 'string', enum: ['users', 'students', 'teachers', 'questions', 'enrollments'] },
            fileName: { type: 'string' },
            status: { type: 'string', enum: ['processed', 'partially_failed', 'failed', 'completed'], default: 'processed' },
            totalRows: { type: 'integer' },
            successCount: { type: 'integer' },
            failedCount: { type: 'integer' }
          }
        },
        ImportError: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            batchId: { type: 'integer' },
            rowNumber: { type: 'integer' },
            rawDataJson: { type: 'string' },
            errorField: { type: 'string' },
            errorMessage: { type: 'string' },
            status: { type: 'string', enum: ['unresolved', 'fixed', 'ignored'] },
            fixedDataJson: { type: 'string' },
            resolvedBy: { type: 'integer', nullable: true },
            resolvedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateImportErrorRequest: {
          type: 'object',
          required: ['rowNumber', 'errorMessage'],
          properties: {
            rowNumber: { type: 'integer' },
            rawDataJson: { type: 'string' },
            rawData: { type: 'object' },
            errorField: { type: 'string' },
            errorMessage: { type: 'string' }
          }
        },
        ResolveImportErrorRequest: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['unresolved', 'fixed', 'ignored'], default: 'fixed' },
            fixedDataJson: { type: 'string' },
            fixedData: { type: 'object' }
          }
        },
        DiscussionThread: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            courseId: { type: 'integer' },
            title: { type: 'string' },
            body: { type: 'string' },
            createdBy: { type: 'integer', nullable: true },
            status: { type: 'string', enum: ['open', 'locked', 'archived'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            createdByName: { type: 'string', nullable: true },
            replyCount: { type: 'integer' },
            lastReplyAt: { type: 'string', format: 'date-time', nullable: true }
          }
        },
        CreateDiscussionThreadRequest: {
          type: 'object',
          required: ['title', 'body'],
          properties: {
            title: { type: 'string' },
            body: { type: 'string' }
          }
        },
        UpdateDiscussionThreadStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['open', 'locked', 'archived'] }
          }
        },
        DiscussionReply: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            threadId: { type: 'integer' },
            body: { type: 'string' },
            createdBy: { type: 'integer', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            createdByName: { type: 'string', nullable: true },
            createdByRole: { type: 'string', nullable: true }
          }
        },
        CreateDiscussionReplyRequest: {
          type: 'object',
          required: ['body'],
          properties: {
            body: { type: 'string' }
          }
        },
        CourseWeek: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            courseId: { type: 'integer' },
            weekNumber: { type: 'integer' },
            title: { type: 'string' },
            description: { type: 'string' },
            startsAt: { type: 'string', format: 'date-time', nullable: true },
            endsAt: { type: 'string', format: 'date-time', nullable: true },
            visible: { type: 'integer', enum: [0, 1] },
            createdBy: { type: 'integer', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            resourceCount: { type: 'integer' }
          }
        },
        CreateCourseWeekRequest: {
          type: 'object',
          required: ['weekNumber', 'title'],
          properties: {
            weekNumber: { type: 'integer', minimum: 1, maximum: 60 },
            title: { type: 'string' },
            description: { type: 'string' },
            startsAt: { type: 'string', format: 'date-time' },
            endsAt: { type: 'string', format: 'date-time' },
            visible: { type: 'boolean' }
          }
        },
        UpdateCourseWeekRequest: {
          type: 'object',
          properties: {
            weekNumber: { type: 'integer', minimum: 1, maximum: 60 },
            title: { type: 'string' },
            description: { type: 'string' },
            startsAt: { type: 'string', format: 'date-time' },
            endsAt: { type: 'string', format: 'date-time' },
            visible: { type: 'boolean' }
          }
        },
        WeekResource: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            weekId: { type: 'integer' },
            title: { type: 'string' },
            type: { type: 'string', enum: ['link', 'file', 'page'] },
            content: { type: 'string' },
            visibleFrom: { type: 'string', format: 'date-time', nullable: true },
            visibleUntil: { type: 'string', format: 'date-time', nullable: true },
            createdBy: { type: 'integer', nullable: true },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateWeekResourceRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string' },
            type: { type: 'string', enum: ['link', 'file', 'page'], default: 'link' },
            content: { type: 'string' },
            url: { type: 'string', description: 'Alias for content' },
            visibleFrom: { type: 'string', format: 'date-time' },
            visibleUntil: { type: 'string', format: 'date-time' }
          }
        },
        AuditLog: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            actorUserId: { type: 'integer', nullable: true },
            actorName: { type: 'string' },
            actorRole: { type: 'string' },
            action: { type: 'string' },
            entityType: { type: 'string' },
            entityId: { type: 'integer', nullable: true },
            details: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    security: [{ cookieAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Login, logout, and current user endpoints' },
      { name: 'Users', description: 'Admin user management endpoints' },
      { name: 'Courses', description: 'Course, enrollment, content, and gradebook endpoints' },
      { name: 'Quizzes', description: 'Quiz publishing, attempts, and grading endpoints' },
      { name: 'Categories', description: 'Question category management endpoints' },
      { name: 'Questions', description: 'Question bank endpoints' },
      { name: 'Academic', description: 'University hierarchy, terms, offerings, assignments, and attendance endpoints' },
      { name: 'Analytics', description: 'Admin academic analytics endpoints' },
      { name: 'Restrictions', description: 'User restriction and partial access control endpoints' },
      { name: 'Issues', description: 'Validation issue tracking endpoints' },
      { name: 'Imports', description: 'Import batch and import error workflows' },
      { name: 'Discussion', description: 'Course discussion threads and replies' },
      { name: 'Weeks', description: 'Weekly course material and resources' },
      { name: 'Audit', description: 'Audit log activity endpoints' }
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
