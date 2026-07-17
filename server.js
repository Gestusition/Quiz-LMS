require('dotenv').config({ quiet: true });
const express = require('express');
const cors = require('cors');
const path = require('path');
const database = require('./database/db');
const { setupSwagger } = require('./swagger/swagger');
const { requireAuth, requireRole } = require('./middleware/auth');
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
const aiQuizRoutes = require('./routes/aiQuizRoutes');

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
app.use('/api/ai', aiQuizRoutes.settingsRouter);
app.use('/api/courses', aiQuizRoutes.courseRouter);

// Swagger API Documentation
setupSwagger(app);

function checkApiHealth() {
  const timestamp = new Date().toISOString();

  try {
    const usersTable = database.getDatabase()
      .prepare("SELECT name FROM users.sqlite_master WHERE type = 'table' AND name = 'users'")
      .get();
    if (!usersTable) throw new Error('users table missing');
    return { status: 'ok', database: 'ok', timestamp };
  } catch (err) {
    return { status: 'not_ok', database: 'not_ok', timestamp };
  }
}

function healthStatusCode(health) {
  return health.status === 'ok' ? 200 : 503;
}

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
 *               $ref: '#/components/schemas/HealthStatus'
 *       503:
 *         description: API is running but a dependency health check failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 */
app.get('/api/health', (req, res) => {
  const health = checkApiHealth();
  res.status(healthStatusCode(health)).json(health);
});

/**
 * @swagger
 * /api:
 *   get:
 *     summary: List admin API entry points
 *     tags: [System]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Admin API index with links to docs, health, and common route groups
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiIndex'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       503:
 *         description: Admin API index returned with failing dependency status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiIndex'
 */
app.get('/api', requireAuth, requireRole('admin'), (req, res) => {
  const health = checkApiHealth();
  res.status(healthStatusCode(health)).json({
    name: 'Quiz LMS API',
    status: health.status,
    database: health.database,
    timestamp: health.timestamp,
    docs: '/api-docs',
    docsJson: '/api-docs.json',
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
      settings: '/api/settings/maintenance',
      ai: '/api/ai/settings/status'
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
  if (err?.type === 'entity.too.large' || err?.status === 413) {
    return res.status(413).json({
      error: 'Request payload too large.',
      message: 'Reduce the request size and try again.'
    });
  }
  console.error('Unhandled error:', {
    name: String(err?.name || 'Error').slice(0, 80),
    code: String(err?.code || 'UNEXPECTED_ERROR').slice(0, 80),
    status: Number(err?.status) || 500
  });
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
