const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Quiz Manager API',
      version: '1.0.0',
      description: 'RESTful API for managing quiz categories and questions. Supports full CRUD operations with filtering, search, and random quiz generation.',
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
    tags: [
      { name: 'Categories', description: 'Category management endpoints' },
      { name: 'Questions', description: 'Question management endpoints' }
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
