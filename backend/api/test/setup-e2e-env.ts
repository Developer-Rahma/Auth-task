const testMongoUri = process.env.MONGODB_TEST_URI;

if (!testMongoUri) {
  throw new Error(
    'MONGODB_TEST_URI must point to a dedicated MongoDB test database.',
  );
}

let testDatabaseName: string;
try {
  const parsedUri = new URL(testMongoUri);
  if (!['mongodb:', 'mongodb+srv:'].includes(parsedUri.protocol)) {
    throw new Error();
  }
  testDatabaseName = parsedUri.pathname.slice(1);
} catch {
  throw new Error('MONGODB_TEST_URI must be a valid MongoDB connection URI.');
}

if (!testDatabaseName || !testDatabaseName.toLowerCase().includes('test')) {
  throw new Error(
    'MONGODB_TEST_URI must use a database name containing "test".',
  );
}

const configuredMongoUri = process.env.MONGODB_URI;
if (configuredMongoUri) {
  let configuredDatabaseName: string;
  try {
    configuredDatabaseName = new URL(configuredMongoUri).pathname.slice(1);
  } catch {
    throw new Error(
      'MONGODB_URI could not be checked against the test database.',
    );
  }
  if (configuredDatabaseName.toLowerCase() === testDatabaseName.toLowerCase()) {
    throw new Error(
      'MONGODB_TEST_URI must use a database different from MONGODB_URI.',
    );
  }
}

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = testMongoUri;
process.env.JWT_ACCESS_SECRET = 'auth-e2e-access-secret-not-for-production';
process.env.JWT_REFRESH_SECRET = 'auth-e2e-refresh-secret-not-for-production';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.COOKIE_SECURE = process.env.AUTH_TEST_COOKIE_SECURE ?? 'false';
process.env.COOKIE_SAME_SITE = process.env.AUTH_TEST_COOKIE_SAME_SITE ?? 'lax';
process.env.CORS_ORIGIN = 'http://localhost:5173';
