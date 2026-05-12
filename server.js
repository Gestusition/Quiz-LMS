const express = require('express');
const cors = require('cors');
const path = require('path');
const database = require('./database/db');
const { setupSwagger } = require('./swagger/swagger');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const questionRoutes = require('./routes/questionRoutes');
const quizRoutes = require('./routes/quizRoutes');
const academicRoutes = require('./routes/academicRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const restrictionRoutes = require('./routes/restrictionRoutes');
const issueRoutes = require('./routes/issueRoutes');
const importRoutes = require('./routes/importRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const courseWeekRoutes = require('./routes/courseWeekRoutes');
const auditRoutes = require('./routes/auditRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');

// Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' data: https:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'"
  );
  next();
});
app.use(cors({
  origin(origin, callback) {
    const allowed = (process.env.CORS_ORIGINS || '')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
    const localOrigins = [`http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`];
    if (!origin) return callback(null, false);
    if (allowed.includes(origin) || localOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Serve static frontend files
app.use(['/uploads/resources', '/uploads/submissions'], (req, res) => {
  res.status(404).json({ error: 'Use the protected download endpoint for course files.' });
});

app.use(express.static(publicDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/restrictions', restrictionRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/imports', importRoutes);
app.use('/api/discussion', discussionRoutes);
app.use('/api/weeks', courseWeekRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/settings', settingsRoutes);

// Swagger API Documentation
setupSwagger(app);

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check API health
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: API status and current server timestamp
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * @swagger
 * /api:
 *   get:
 *     summary: List public API entry points
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: API index with links to docs, health, and common route groups
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 status:
 *                   type: string
 *                 docs:
 *                   type: string
 *                 health:
 *                   type: string
 *                 routes:
 *                   type: object
 *                   additionalProperties:
 *                     type: string
 */
app.get('/api', (req, res) => {
  res.json({
    name: 'Quiz LMS API',
    status: 'ok',
    docs: '/api-docs',
    health: '/api/health',
    routes: {
      auth: '/api/auth/login',
      courses: '/api/courses',
      users: '/api/users',
      categories: '/api/categories',
      questions: '/api/questions',
      quizzes: '/api/quizzes',
      academic: '/api/academic',
      analytics: '/api/analytics/admin',
      restrictions: '/api/restrictions',
      issues: '/api/issues',
      imports: '/api/imports/batches',
      discussion: '/api/discussion',
      weeks: '/api/weeks',
      audit: '/api/audit',
      settings: '/api/settings/maintenance'
    }
  });
});

// Unknown API routes should fail fast instead of leaving the request open.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found.' });
});

// SPA fallback — serve index.html for any non-API route
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// Error handling middleware
function handleUnhandledError(err, req, res, next) {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
}

app.use(handleUnhandledError);

function startServer(port = PORT) {
  database.initDatabase();
  database.seedDatabase();
  return app.listen(port, () => {
    console.log(`\n🚀 Quiz LMS is running!`);
    console.log(`   App:     http://localhost:${port}`);
    console.log(`   API:     http://localhost:${port}/api`);
    console.log(`   Swagger: http://localhost:${port}/api-docs\n`);
  });
}

// Initialize database and start server
/* istanbul ignore next -- direct CLI startup is covered by startServer unit tests. */
if (require.main === module) {
  startServer();
}

module.exports = app;
module.exports.handleUnhandledError = handleUnhandledError;
module.exports.startServer = startServer;
