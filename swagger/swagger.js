const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

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
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Quiz Manager API Docs'
  }));

  // Serve raw JSON spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

module.exports = { setupSwagger };
