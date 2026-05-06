const authService = require('../services/authService');
const enrollmentRepository = require('../repositories/enrollmentRepository');
const restrictionService = require('../services/restrictionService');

const SESSION_COOKIE_NAME = 'auth_token';

function parseCookies(cookieHeader = '') {
  return cookieHeader
    .split(';')
    .map(part => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separator = part.indexOf('=');
      if (separator === -1) return cookies;

      const name = part.slice(0, separator);
      const rawValue = part.slice(separator + 1);
      try {
        cookies[name] = decodeURIComponent(rawValue);
      } catch (err) {
        cookies[name] = rawValue;
      }
      return cookies;
    }, {});
}

function getSessionToken(req) {
  if (req.headers.cookie) {
    return parseCookies(req.headers.cookie)[SESSION_COOKIE_NAME] || '';
  }

  return '';
}

function requireAuth(req, res, next) {
  const token = getSessionToken(req);
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
  getSessionToken,
  SESSION_COOKIE_NAME,
  requireAuth,
  requireCourseAccess,
  requireCourseManager,
  requireRole
};
