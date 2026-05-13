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

const SERVER_API_ROUTES = new Set(['/api', '/api/health']);

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

function appMethodsFor(source) {
  const methods = [];
  const pattern = /app\.(get|post|put|delete|patch)\(\s*['"]([^'"]*)/g;
  let match;

  while ((match = pattern.exec(source)) !== null) {
    if (SERVER_API_ROUTES.has(match[2])) {
      methods.push({
        method: match[1],
        path: match[2]
      });
    }
  }

  return methods;
}

function swaggerMethodsFor(source) {
  const methods = new Set();
  const lines = source.split(/\r?\n/);
  let currentPath = null;

  lines.forEach(line => {
    const pathMatch = line.match(/\*\s+(\/api(?:\/[^:\s]+)?):\s*$/);
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

function keyFor(route) {
  return `${route.method.toUpperCase()} ${route.path}`;
}

function routeInventory() {
  const routesDir = path.join(__dirname, '..', 'routes');
  const serverSource = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  const routes = appMethodsFor(serverSource).map(route => ({ ...route, source: 'server.js' }));

  Object.keys(ROUTE_PREFIXES).forEach(fileName => {
    const source = fs.readFileSync(path.join(routesDir, fileName), 'utf8');
    routeMethodsFor(fileName, source).forEach(route => {
      routes.push({ ...route, source: fileName });
    });
  });

  return routes;
}

function swaggerInventory() {
  const routesDir = path.join(__dirname, '..', 'routes');
  const sources = [
    ['server.js', fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8')],
    ...Object.keys(ROUTE_PREFIXES).map(fileName => [
      fileName,
      fs.readFileSync(path.join(routesDir, fileName), 'utf8')
    ])
  ];
  const docs = [];

  sources.forEach(([sourceName, source]) => {
    swaggerMethodsFor(source).forEach(key => {
      docs.push({ key, source: sourceName });
    });
  });

  return docs;
}

describe('Swagger route coverage', () => {
  test('every Express API route method has exactly one Swagger method block', () => {
    const routes = routeInventory();
    const docs = swaggerInventory();
    const routeKeys = new Map(routes.map(route => [keyFor(route), route.source]));
    const docCounts = docs.reduce((counts, doc) => {
      counts.set(doc.key, (counts.get(doc.key) || 0) + 1);
      return counts;
    }, new Map());

    const missing = routes
      .map(route => ({ key: keyFor(route), source: route.source }))
      .filter(route => !docCounts.has(route.key))
      .map(route => `${route.source}: ${route.key}`);
    const orphaned = docs
      .filter(doc => !routeKeys.has(doc.key))
      .map(doc => `${doc.source}: ${doc.key}`);
    const duplicated = [...docCounts.entries()]
      .filter(([, count]) => count > 1)
      .map(([key, count]) => `${key} (${count} docs)`);

    expect(missing).toEqual([]);
    expect(orphaned).toEqual([]);
    expect(duplicated).toEqual([]);
  });

  test('generated OpenAPI spec contains complete operation basics for every route', () => {
    const { swaggerSpec } = require('../swagger/swagger');
    const missing = [];

    routeInventory().forEach(route => {
      const operation = swaggerSpec.paths?.[route.path]?.[route.method];
      if (!operation) {
        missing.push(`${route.source}: ${keyFor(route)} missing from generated spec`);
        return;
      }

      if (!operation.summary) missing.push(`${route.source}: ${keyFor(route)} missing summary`);
      if (!Array.isArray(operation.tags) || operation.tags.length === 0) {
        missing.push(`${route.source}: ${keyFor(route)} missing tag`);
      }
      if (!operation.responses || Object.keys(operation.responses).length === 0) {
        missing.push(`${route.source}: ${keyFor(route)} missing responses`);
      }
    });

    expect(missing).toEqual([]);
  });

  test('protected routes explicitly show cookie auth security in generated docs', () => {
    const { swaggerSpec } = require('../swagger/swagger');
    const publicRoutes = new Set([
      'GET /api/health'
    ]);
    const missing = [];

    routeInventory().forEach(route => {
      const key = keyFor(route);
      const operation = swaggerSpec.paths?.[route.path]?.[route.method];
      if (!operation) return;

      if (publicRoutes.has(key)) {
        if (JSON.stringify(operation.security) !== '[]') {
          missing.push(`${route.source}: ${key} should remain public`);
        }
        return;
      }

      const hasCookieAuth = Array.isArray(operation.security) &&
        operation.security.some(item => Object.prototype.hasOwnProperty.call(item, 'cookieAuth'));
      if (!hasCookieAuth) {
        missing.push(`${route.source}: ${key} missing explicit cookieAuth security`);
      }
    });

    expect(missing).toEqual([]);
  });

  test('system routes document consistent health and admin index responses', () => {
    const { swaggerSpec } = require('../swagger/swagger');
    const health = swaggerSpec.paths?.['/api/health']?.get;
    const index = swaggerSpec.paths?.['/api']?.get;
    const apiIndexSchema = swaggerSpec.components?.schemas?.ApiIndex;
    const apiIndexFields = apiIndexSchema?.allOf?.[1];

    expect(swaggerSpec.components?.schemas?.HealthStatus).toBeDefined();
    expect(apiIndexSchema).toBeDefined();
    expect(apiIndexFields?.required).toEqual(expect.arrayContaining(['docs', 'docsJson', 'health']));
    expect(apiIndexFields?.properties?.docs?.description).toMatch(/Swagger UI/);
    expect(apiIndexFields?.properties?.docsJson?.description).toMatch(/OpenAPI JSON/);
    expect(apiIndexFields?.properties?.health?.description).toMatch(/health check/);
    expect(health?.security).toEqual([]);
    expect(health?.responses?.['200']?.content?.['application/json']?.schema).toEqual({
      $ref: '#/components/schemas/HealthStatus'
    });
    expect(health?.responses?.['503']?.content?.['application/json']?.schema).toEqual({
      $ref: '#/components/schemas/HealthStatus'
    });
    expect(index?.security).toEqual([{ cookieAuth: [] }]);
    expect(index?.responses?.['200']?.content?.['application/json']?.schema).toEqual({
      $ref: '#/components/schemas/ApiIndex'
    });
    expect(index?.responses?.['401']).toBeDefined();
    expect(index?.responses?.['403']).toBeDefined();
    expect(index?.responses?.['503']?.content?.['application/json']?.schema).toEqual({
      $ref: '#/components/schemas/ApiIndex'
    });
  });
});
