const authService = require('../services/authService');
const { getDatabase } = require('../database/db');

function getBearerToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  if (req.headers['x-session-token']) return req.headers['x-session-token'];
  
  if (req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|;\s*)auth_token=([^;]*)/);
    if (match) return match[1];
  }
  
  return req.query.token || '';
}

function requireAuth(req, res, next) {
  const token = getBearerToken(req);
  const user = authService.getUserByToken(token);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  req.authToken = token;
  req.user = user;

  if (user.mustChangeCredentials && !isCredentialRotationRoute(req)) {
    return res.status(403).json({
      code: 'CREDENTIAL_CHANGE_REQUIRED',
      error: 'You must change the default username and password before continuing.'
    });
  }
  next();
}

function isCredentialRotationRoute(req) {
  if (req.baseUrl !== '/api/auth') return false;
  return ['/me', '/logout', '/change-credentials'].includes(req.path);
}

function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user || !allowed.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to perform this action.' });
    }
    next();
  };
}

function canManageCourse(user, courseId) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role !== 'teacher') return false;

  const db = getDatabase();
  const enrollment = db.prepare(`
    SELECT id FROM enrollments
    WHERE courseId = ? AND userId = ? AND role = 'teacher' AND status = 'active'
  `).get(courseId, user.id);

  return !!enrollment;
}

function canAccessCourse(user, courseId) {
  if (!user) return false;
  if (user.role === 'admin') return true;

  const db = getDatabase();
  const enrollment = db.prepare(`
    SELECT id FROM enrollments
    WHERE courseId = ? AND userId = ? AND status = 'active'
  `).get(courseId, user.id);

  return !!enrollment;
}

function requireCourseAccess(paramName = 'courseId') {
  return (req, res, next) => {
    const courseId = Number(req.params[paramName] || req.body.courseId || req.query.courseId);
    if (!courseId || !canAccessCourse(req.user, courseId)) {
      return res.status(403).json({ error: 'Course access required.' });
    }
    next();
  };
}

function requireCourseManager(paramName = 'courseId') {
  return (req, res, next) => {
    const courseId = Number(req.params[paramName] || req.body.courseId || req.query.courseId);
    if (!courseId || !canManageCourse(req.user, courseId)) {
      return res.status(403).json({ error: 'Teacher or admin course access required.' });
    }
    next();
  };
}

module.exports = {
  canAccessCourse,
  canManageCourse,
  requireAuth,
  requireCourseAccess,
  requireCourseManager,
  requireRole
};
