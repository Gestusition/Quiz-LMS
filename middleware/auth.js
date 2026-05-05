const authService = require('../services/authService');
const enrollmentRepository = require('../repositories/enrollmentRepository');
const restrictionService = require('../services/restrictionService');

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

  try {
    restrictionService.assertAccessAllowed({
      user,
      restrictionType: 'account_suspended',
      scopeType: 'global',
      safeMessage: 'Your account is currently restricted. Please contact your instructor or administrator.'
    });
  } catch (err) {
    return res.status(403).json({
      error: 'Access restricted',
      restriction_type: 'account_suspended',
      message: 'Your account is currently restricted. Please contact your instructor or administrator.'
    });
  }

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
  return enrollmentRepository.canManageCourse(user, courseId);
}

function canAccessCourse(user, courseId) {
  return enrollmentRepository.canAccessCourse(user, courseId);
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
