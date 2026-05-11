const userRepository = require('../repositories/userRepository');
const enrollmentRepository = require('../repositories/enrollmentRepository');
const { verifyJwt } = require('../utils/security');
const sessionRepository = require('../repositories/sessionRepository');
const { serializeCurrentUser } = require('../serializers/userSerializer');
const settingsService = require('../services/settingsService');

const SESSION_COOKIE_NAME = 'auth_token';
const { MAINTENANCE_MODE_CODE, MAINTENANCE_MESSAGE } = settingsService;

function extractToken(req) {
  const cookieHeader = req.headers && req.headers.cookie;
  if (typeof cookieHeader === 'string') {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith('auth_token=')) {
        return cookie.substring('auth_token='.length);
      }
    }
  }
  return '';
}

function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/'
  });
}

/**
 * Resolve user data from a decoded JWT without re-verifying the token.
 * @param {object} decoded - Decoded JWT payload (must have sub and jti)
 * @returns {object|null} Serialized user or null if invalid
 */
function resolveUserFromDecoded(decoded) {
  const session = sessionRepository.findById(Number(decoded.jti));
  if (!session) return null;
  if (session.tokenType !== 'jwt') return null;

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    sessionRepository.deleteById(Number(decoded.jti));
    return null;
  }

  const user = userRepository.findPublicById(decoded.sub);
  if (!user || user.status !== 'active') {
    sessionRepository.deleteById(Number(decoded.jti));
    return null;
  }

  sessionRepository.updateLastSeen(Number(decoded.jti), new Date().toISOString());
  return serializeCurrentUser(user);
}

/**
 * Attach user data and token to the request object.
 */
function attachUserToRequest(req, user, decoded, token) {
  req.user = user;
  req.userId = user.id;
  req.userRole = decoded ? (decoded.role || user.role) : user.role;
  req.token = token;
  req.ctx = {
    user,
    userId: user.id,
    userRole: decoded ? (decoded.role || user.role) : user.role,
    ...(decoded && decoded.jti ? { sessionId: Number(decoded.jti) } : {})
  };
}

function checkMaintenanceMode(user, decoded) {
  if (!user || !decoded || !decoded.jti || !settingsService.isRoleBlocked(user.role)) {
    return null;
  }

  sessionRepository.deleteById(Number(decoded.jti));
  return {
    status: 401,
    json: {
      status: 'error',
      code: MAINTENANCE_MODE_CODE,
      message: MAINTENANCE_MESSAGE
    }
  };
}

function checkCredentialsChange(req, user) {
  if (user.mustChangeCredentials) {
    const requestPath = req.originalUrl || req.path;
    const isAuthRoute = requestPath.startsWith('/api/auth') || requestPath.startsWith('/api/users/me/credentials');
    if (!isAuthRoute) {
      return {
        status: 403,
        json: {
          status: 'error',
          code: 'CREDENTIAL_CHANGE_REQUIRED',
          message: 'You must change your username and password before proceeding.'
        }
      };
    }
  }
  return null;
}

/**
 * JWT Authentication Middleware
 */
function authenticate(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication token is missing. Please sign in.'
      });
    }

    const decoded = verifyJwt(token);
    if (decoded && decoded.sub && decoded.jti) {
      const user = resolveUserFromDecoded(decoded);
      if (user) {
        const maintenance = checkMaintenanceMode(user, decoded);
        if (maintenance) {
          clearSessionCookie(res);
          return res.status(maintenance.status).json(maintenance.json);
        }

        const restriction = checkCredentialsChange(req, user);
        if (restriction) return res.status(restriction.status).json(restriction.json);

        attachUserToRequest(req, user, decoded, token);
        return next();
      }
      return res.status(401).json({
        status: 'error',
        message: 'Session has been revoked or user not found. Please sign in again.'
      });
    }

    return res.status(401).json({
      status: 'error',
      message: 'Session expired or invalid. Please sign in again.'
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Authentication failed due to an internal error.'
    });
  }
}

/**
 * Optional authentication.
 * Attaches req.user if a valid token is present, otherwise continues without error.
 */
function optionallyAuthenticate(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return next();
    }

    const decoded = verifyJwt(token);
    if (decoded && decoded.sub && decoded.jti) {
      const user = resolveUserFromDecoded(decoded);
      if (user) {
        const maintenance = checkMaintenanceMode(user, decoded);
        if (maintenance) {
          clearSessionCookie(res);
          return next();
        }

        attachUserToRequest(req, user, decoded, token);
      }
      return next();
    }

    next();
  } catch (err) {
    next();
  }
}

/**
 * Session validation middleware.
 * This is used by routes that need to confirm the session is still valid
 * and re-attach user data.
 */
function validateSession(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Session token is missing.'
      });
    }

    const decoded = verifyJwt(token);
    if (decoded && decoded.sub && decoded.jti) {
      const user = resolveUserFromDecoded(decoded);
      if (user) {
        const maintenance = checkMaintenanceMode(user, decoded);
        if (maintenance) {
          clearSessionCookie(res);
          return res.status(maintenance.status).json(maintenance.json);
        }

        attachUserToRequest(req, user, decoded, token);
        return next();
      }
      return res.status(401).json({
        status: 'error',
        message: 'Session expired or invalid.'
      });
    }

    return res.status(401).json({
      status: 'error',
      message: 'Session expired or invalid.'
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Session validation failed.'
    });
  }
}

/**
 * Role-based access middleware.
 */
function requireRole(...allowedRoles) {
  const roles = Array.isArray(allowedRoles[0]) ? allowedRoles[0] : allowedRoles;
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. No role assigned.'
      });
    }

    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        status: 'error',
        message: `Access denied. Required role: ${roles.join(' or ')}.`
      });
    }

    next();
  };
}

/**
 * Check whether a user can access a given course (student, teacher, or admin).
 */
function canAccessCourse(user, courseId) {
  return enrollmentRepository.canAccessCourse(user, courseId);
}

/**
 * Check whether a user can manage a given course (teacher or admin).
 */
function canManageCourse(user, courseId) {
  return enrollmentRepository.canManageCourse(user, courseId);
}

module.exports = {
  authenticate,
  optionallyAuthenticate,
  validateSession,
  requireRole,
  extractToken,
  canAccessCourse,
  canManageCourse,
  requireAuth: authenticate
};
