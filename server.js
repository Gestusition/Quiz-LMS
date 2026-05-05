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

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

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
