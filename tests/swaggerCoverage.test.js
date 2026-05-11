const fs = require('fs');
const path = require('path');

const ROUTE_PREFIXES = {
  'academicRoutes.js': '/api/academic',
  'analyticsRoutes.js': '/api/analytics',
  'auditRoutes.js': '/api/audit',
  'authRoutes.js': '/api/auth',
  'categoryRoutes.js': '/api/categories',
  'courseRoutes.js': '/api/courses',
  'courseWeekRoutes.js': '/api/weeks',
  'discussionRoutes.js': '/api/discussion',
  'importRoutes.js': '/api/imports',
  'issueRoutes.js': '/api/issues',
  'questionRoutes.js': '/api/questions',
  'quizRoutes.js': '/api/quizzes',
  'restrictionRoutes.js': '/api/restrictions',
  'settingsRoutes.js': '/api/settings',
  'userRoutes.js': '/api/users'
};

function expressPathToOpenApi(routePrefix, routePath) {
  const joined = routePath === '/' ? routePrefix : `${routePrefix}${routePath}`;
  return joined.replace(/\/+/g, '/').replace(/:([A-Za-z0-9_]+)/g, '{$1}');
}

function routeMethodsFor(fileName, source) {
  const prefix = ROUTE_PREFIXES[fileName];
  const methods = [];
  const pattern = /router\.(get|post|put|delete|patch)\(\s*['"]([^'"]*)/g;
  let match;

  while ((match = pattern.exec(source)) !== null) {
    methods.push({
      method: match[1],
      path: expressPathToOpenApi(prefix, match[2])
    });
  }

  return methods;
}

function swaggerMethodsFor(source) {
  const methods = new Set();
  const lines = source.split(/\r?\n/);
  let currentPath = null;

  lines.forEach(line => {
    const pathMatch = line.match(/\*\s+(\/api\/[^:\s]+):\s*$/);
    if (pathMatch) {
      currentPath = pathMatch[1];
      return;
    }

    const methodMatch = line.match(/\*\s{3}(get|post|put|delete|patch):\s*$/);
    if (currentPath && methodMatch) {
      methods.add(`${methodMatch[1].toUpperCase()} ${currentPath}`);
    }
  });

  return methods;
}

describe('Swagger route coverage', () => {
  test('every Express route method has a Swagger method block', () => {
    const routesDir = path.join(__dirname, '..', 'routes');
    const missing = [];

    Object.keys(ROUTE_PREFIXES).forEach(fileName => {
      const source = fs.readFileSync(path.join(routesDir, fileName), 'utf8');
      const documented = swaggerMethodsFor(source);

      routeMethodsFor(fileName, source).forEach(route => {
        const key = `${route.method.toUpperCase()} ${route.path}`;
        if (!documented.has(key)) {
          missing.push(`${fileName}: ${key}`);
        }
      });
    });

    expect(missing).toEqual([]);
  });
});
