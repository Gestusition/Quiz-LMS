const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase, seedDatabase } = require('./database/db');
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
const resourceUploadRoot = path.join(publicDir, 'uploads', 'resources');
const submissionUploadRoot = path.join(publicDir, 'uploads', 'submissions');

// Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'"
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

app.use(express.static(publicDir, {
  setHeaders(res, filePath) {
    const uploadRoots = [resourceUploadRoot, submissionUploadRoot];
    const isUploadedFile = uploadRoots.some(root => {
      const relative = path.relative(root, filePath);
      return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
    });
    if (!isUploadedFile) return;

    const safeName = path.basename(filePath).replace(/["\r\n]/g, '');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    res.setHeader('Content-Security-Policy', "sandbox; default-src 'none'");
  }
}));

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// Initialize database and start server
if (require.main === module) {
  initDatabase();
  seedDatabase();
  app.listen(PORT, () => {
    console.log(`\n🚀 Quiz Manager is running!`);
    console.log(`   App:     http://localhost:${PORT}`);
    console.log(`   API:     http://localhost:${PORT}/api`);
    console.log(`   Swagger: http://localhost:${PORT}/api-docs\n`);
  });
}

module.exports = app;
