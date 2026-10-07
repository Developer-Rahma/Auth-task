import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { jest } from '@jest/globals';
import { getModelToken } from '@nestjs/mongoose';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Model } from 'mongoose';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { AppLogger } from '../src/common/logging/app-logger.service';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import {
  RefreshSessionDocument,
  RefreshSessionModel,
} from '../src/modules/auth/infrastructure/schemas/refresh-session.schema';
import {
  UserDocument,
  UserModel,
} from '../src/modules/auth/infrastructure/schemas/user.schema';
import { PasswordHasherService } from '../src/modules/auth/infrastructure/security/password-hasher.service';
import { RefreshTokenHasherService } from '../src/modules/auth/infrastructure/security/refresh-token-hasher.service';
import { JwtTokenService } from '../src/modules/auth/infrastructure/security/jwt-token.service';
import { ErrorCode } from '../src/common/errors/error-codes';

const signupBody = {
  name: 'Rahma Samy',
  email: 'rahma@example.com',
  password: 'Password@123',
};

function responseCookies(
  headers: Record<string, string | string[] | undefined>,
): string[] {
  const setCookie = headers['set-cookie'];
  if (Array.isArray(setCookie)) {
    return setCookie;
  }
  return setCookie ? [setCookie] : [];
}

function cookieValue(cookies: string[], name: string): string {
  const cookie = cookies.find((value) => value.startsWith(`${name}=`));
  expect(cookie).toBeDefined();
  return cookie?.split(';', 1)[0].slice(name.length + 1) ?? '';
}

function cookieHeader(cookies: string[], names: string[]): string {
  return names
    .map((name) => `${name}=${cookieValue(cookies, name)}`)
    .join('; ');
}

function expectSafeAuthResponse(body: unknown): void {
  expect(body).not.toHaveProperty('password');
  expect(body).not.toHaveProperty('passwordHash');
  expect(body).not.toHaveProperty('accessToken');
  expect(body).not.toHaveProperty('refreshToken');
}

describe('Authentication API (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<UserDocument>;
  let refreshSessionModel: Model<RefreshSessionDocument>;
  let passwordHasher: PasswordHasherService;
  let refreshTokenHasher: RefreshTokenHasherService;
  let jwtTokenService: JwtTokenService;
  let logger: AppLogger;
  let accessSecret: string;
  let cookieSecure: boolean;
  let sameSite: string;

  beforeAll(async () => {
    accessSecret = process.env.JWT_ACCESS_SECRET ?? '';
    cookieSecure = process.env.COOKIE_SECURE === 'true';
    sameSite = process.env.COOKIE_SAME_SITE ?? 'lax';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const config = app.get(ConfigService);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api');
    app.use(helmet());
    app.enableCors({
      origin: config.getOrThrow<string[]>('app.corsOrigins'),
      credentials: true,
    });
    app.use(cookieParser());
    app.useGlobalFilters(new GlobalExceptionFilter(app.get(AppLogger)));
    await app.init();

    userModel = app.get<Model<UserDocument>>(getModelToken(UserModel.name));
    refreshSessionModel = app.get<Model<RefreshSessionDocument>>(
      getModelToken(RefreshSessionModel.name),
    );
    passwordHasher = app.get(PasswordHasherService);
    refreshTokenHasher = app.get(RefreshTokenHasherService);
    jwtTokenService = app.get(JwtTokenService);
    logger = app.get(AppLogger);
  });

  beforeEach(async () => {
    jest.restoreAllMocks();
    await Promise.all([
      userModel.deleteMany({}),
      refreshSessionModel.deleteMany({}),
    ]);
  });

  afterAll(async () => {
    if (app) {
      await Promise.all([
        userModel.deleteMany({}),
        refreshSessionModel.deleteMany({}),
      ]);
      await app.close();
    }
  });

  async function createUser(email = signupBody.email) {
    const response = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ ...signupBody, email })
      .expect(201);
    return response;
  }

  function expectError(
    response: { body: Record<string, unknown> },
    status: number,
    code: string,
  ): void {
    expect(response.body).toMatchObject({
      success: false,
      error: {
        code,
        message: expect.any(String),
      },
      requestId: expect.any(String),
    });
    expect(response.status).toBe(status);
  }

  describe('POST /api/auth/signup', () => {
    it('creates a user, hashes the password, and returns only safe data with auth cookies', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(signupBody)
        .expect(201);
      await request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({
          email: signupBody.email,
          password: 'DifferentPassword@456',
        })
        .expect(401);

      expect(response.body).toEqual({
        id: expect.any(String),
        name: signupBody.name,
        email: signupBody.email,
      });
      expectSafeAuthResponse(response.body);

      const setCookies = responseCookies(response.headers);
      const accessCookie = setCookies.find((cookie) =>
        cookie.startsWith('access_token='),
      );
      const refreshCookie = setCookies.find((cookie) =>
        cookie.startsWith('refresh_token='),
      );
      expect(accessCookie).toBeDefined();
      expect(refreshCookie).toBeDefined();
      expect(accessCookie).toContain('HttpOnly');
      expect(refreshCookie).toContain('HttpOnly');
      expect(accessCookie).toContain('Path=/');
      expect(accessCookie).toContain('Max-Age=900');
      expect(refreshCookie).toContain('Path=/api/auth');
      expect(refreshCookie).toContain('Max-Age=604800');
      expect(accessCookie).toContain(
        `SameSite=${sameSite[0].toUpperCase()}${sameSite.slice(1)}`,
      );
      expect(refreshCookie).toContain(
        `SameSite=${sameSite[0].toUpperCase()}${sameSite.slice(1)}`,
      );
      expect(accessCookie?.includes('Secure')).toBe(cookieSecure);
      expect(refreshCookie?.includes('Secure')).toBe(cookieSecure);

      const storedUser = await userModel.findOne({ email: signupBody.email });
      expect(storedUser).not.toBeNull();
      expect(storedUser?.passwordHash).not.toBe(signupBody.password);
      expect(storedUser?.passwordHash).toMatch(/^\$2[aby]\$12\$/);
      await expect(
        passwordHasher.compare(
          signupBody.password,
          storedUser?.passwordHash ?? '',
        ),
      ).resolves.toBe(true);

      const refreshToken = cookieValue(setCookies, 'refresh_token');
      const payload = await jwtTokenService.verifyRefreshToken(refreshToken);
      const session = await refreshSessionModel.findOne({ jti: payload.jti });
      expect(session?.tokenHash).toBe(refreshTokenHasher.hash(refreshToken));
      expect(session?.tokenHash).not.toBe(refreshToken);
      expect(session?.toObject()).not.toHaveProperty('refreshToken');
    });

    it.each([
      ['invalid email', { ...signupBody, email: 'not-an-email' }],
      ['name shorter than three characters', { ...signupBody, name: 'Al' }],
      [
        'password shorter than eight characters',
        { ...signupBody, password: 'Ab1@xyz' },
      ],
      ['password without a letter', { ...signupBody, password: '1234567@' }],
      ['password without a number', { ...signupBody, password: 'Password@' }],
      [
        'password without a special character',
        { ...signupBody, password: 'Password123' },
      ],
      ['missing required fields', {}],
    ])('rejects %s', async (_scenario, body) => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(body)
        .expect(400);
      expectError(response, 400, ErrorCode.VALIDATION_ERROR);
    });

    it('returns the global conflict error format for a duplicate email', async () => {
      await createUser();

      const response = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(signupBody)
        .set('X-Request-ID', 'duplicate-email-test')
        .expect(409);

      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'An account with this email already exists.',
        },
        requestId: 'duplicate-email-test',
      });
    });
  });

  describe('POST /api/auth/signin', () => {
    it('authenticates valid credentials and returns tokens only in HttpOnly cookies', async () => {
      await createUser();

      const response = await request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({ email: signupBody.email, password: signupBody.password })
        .expect(200);

      expect(response.body).toEqual({
        id: expect.any(String),
        email: signupBody.email,
      });
      expectSafeAuthResponse(response.body);

      const setCookies = responseCookies(response.headers);
      expect(
        setCookies.some((cookie) => cookie.startsWith('access_token=')),
      ).toBe(true);
      expect(
        setCookies.some((cookie) => cookie.startsWith('refresh_token=')),
      ).toBe(true);
      expect(setCookies.every((cookie) => cookie.includes('HttpOnly'))).toBe(
        true,
      );
    });

    it('returns the same generic authentication error for wrong password and unknown email', async () => {
      await createUser();

      const wrongPassword = await request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({ email: signupBody.email, password: 'WrongPassword@123' })
        .expect(401);
      const unknownEmail = await request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({ email: 'unknown@example.com', password: 'WrongPassword@123' })
        .expect(401);

      expectError(wrongPassword, 401, ErrorCode.INVALID_CREDENTIALS);
      expectError(unknownEmail, 401, ErrorCode.INVALID_CREDENTIALS);
      expect(wrongPassword.body.error.message).toBe(
        'Invalid email or password.',
      );
      expect(unknownEmail.body.error.message).toBe(
        'Invalid email or password.',
      );
      expect(wrongPassword.body.error.message).toBe(
        unknownEmail.body.error.message,
      );
    });

    it('rejects an invalid request body', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({ email: 'invalid', password: '' })
        .expect(400);
      expectError(response, 400, ErrorCode.VALIDATION_ERROR);
    });
  });

  describe('GET /api/auth/me', () => {
    it('rejects requests without an access token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
      expectError(response, 401, ErrorCode.UNAUTHORIZED);
    });

    it.each(['invalid', 'expired'])(
      'rejects an %s access token',
      async (kind) => {
        const token =
          kind === 'expired'
            ? await app.get(JwtService).signAsync(
                {
                  sub: 'test-user',
                  email: 'test@example.com',
                  type: 'access',
                  exp: Math.floor(Date.now() / 1000) - 60,
                },
                { secret: accessSecret },
              )
            : 'not-a-valid-jwt';
        const response = await request(app.getHttpServer())
          .get('/api/auth/me')
          .set('Cookie', `access_token=${token}`)
          .expect(401);
        expectError(response, 401, ErrorCode.UNAUTHORIZED);
      },
    );

    it('returns only safe authenticated user information with a valid access token', async () => {
      const signup = await createUser();
      const accessCookie = responseCookies(signup.headers).find((cookie) =>
        cookie.startsWith('access_token='),
      );

      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Cookie', accessCookie?.split(';', 1)[0] ?? '')
        .expect(200);

      expect(response.body).toEqual({
        id: signup.body.id,
        email: signupBody.email,
      });
      expectSafeAuthResponse(response.body);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('rotates a valid refresh session and issues new HttpOnly cookies', async () => {
      const signup = await createUser();
      const initialCookies = responseCookies(signup.headers);
      const oldRefreshToken = cookieValue(initialCookies, 'refresh_token');
      const oldPayload =
        await jwtTokenService.verifyRefreshToken(oldRefreshToken);
      const oldSession = await refreshSessionModel.findOne({
        jti: oldPayload.jti,
      });
      expect(oldSession?.revokedAt).toBeNull();

      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', `refresh_token=${oldRefreshToken}`)
        .expect(200);

      expect(response.body).toEqual({
        id: signup.body.id,
        email: signupBody.email,
      });
      expectSafeAuthResponse(response.body);
      const newCookies = responseCookies(response.headers);
      const newAccessCookie = newCookies.find((cookie) =>
        cookie.startsWith('access_token='),
      );
      const newRefreshCookie = newCookies.find((cookie) =>
        cookie.startsWith('refresh_token='),
      );
      expect(newAccessCookie).toContain('HttpOnly');
      expect(newRefreshCookie).toContain('HttpOnly');

      const newRefreshToken = cookieValue(newCookies, 'refresh_token');
      const newPayload =
        await jwtTokenService.verifyRefreshToken(newRefreshToken);
      const updatedOldSession = await refreshSessionModel.findOne({
        jti: oldPayload.jti,
      });
      const newSession = await refreshSessionModel.findOne({
        jti: newPayload.jti,
      });
      expect(updatedOldSession?.revokedAt).toBeInstanceOf(Date);
      expect(newSession?.revokedAt).toBeNull();
      expect(newSession?.tokenHash).toBe(
        refreshTokenHasher.hash(newRefreshToken),
      );
      expect(newSession?.tokenHash).not.toBe(newRefreshToken);
      expect(newSession?.toObject()).not.toHaveProperty('refreshToken');
    });

    it('rejects a missing refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .expect(401);
      expectError(response, 401, ErrorCode.UNAUTHORIZED);
    });

    it.each(['invalid', 'expired'])(
      'rejects an %s refresh token',
      async (kind) => {
        const token =
          kind === 'expired'
            ? await app.get(JwtService).signAsync(
                {
                  sub: 'test-user',
                  jti: 'expired-session',
                  type: 'refresh',
                  exp: Math.floor(Date.now() / 1000) - 60,
                },
                { secret: process.env.JWT_REFRESH_SECRET ?? '' },
              )
            : 'not-a-valid-jwt';
        const response = await request(app.getHttpServer())
          .post('/api/auth/refresh')
          .set('Cookie', `refresh_token=${token}`)
          .expect(401);
        expectError(response, 401, ErrorCode.UNAUTHORIZED);
      },
    );

    it('rejects a revoked refresh session', async () => {
      const signup = await createUser();
      const token = cookieValue(
        responseCookies(signup.headers),
        'refresh_token',
      );
      const payload = await jwtTokenService.verifyRefreshToken(token);
      await refreshSessionModel.updateOne(
        { jti: payload.jti },
        { $set: { revokedAt: new Date() } },
      );

      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', `refresh_token=${token}`)
        .expect(401);
      expectError(response, 401, ErrorCode.UNAUTHORIZED);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('revokes refresh sessions and clears auth cookies for an authenticated user', async () => {
      const signup = await createUser();
      const cookies = responseCookies(signup.headers);
      const accessCookie = cookies.find((cookie) =>
        cookie.startsWith('access_token='),
      );
      const response = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Cookie', accessCookie?.split(';', 1)[0] ?? '')
        .expect(204);

      const clearedCookies = responseCookies(response.headers);
      expect(
        clearedCookies.some((cookie) => /^access_token=;/.test(cookie)),
      ).toBe(true);
      expect(
        clearedCookies.some((cookie) => /^refresh_token=;/.test(cookie)),
      ).toBe(true);
      expect(
        clearedCookies.find((cookie) => cookie.startsWith('access_token=;')),
      ).toContain('Path=/');
      expect(
        clearedCookies.find((cookie) => cookie.startsWith('refresh_token=;')),
      ).toContain('Path=/api/auth');

      const sessions = await refreshSessionModel.find({
        userId: signup.body.id,
      });
      expect(sessions.length).toBeGreaterThan(0);
      expect(
        sessions.every((session) => session.revokedAt instanceof Date),
      ).toBe(true);

      const meResponse = await request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
      expectError(meResponse, 401, ErrorCode.UNAUTHORIZED);
    });

    it('rejects logout without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .expect(401);
      expectError(response, 401, ErrorCode.UNAUTHORIZED);
    });
  });

  describe('security and error handling', () => {
    it('does not write passwords, password hashes, or token values to application logs', async () => {
      const infoSpy = jest.spyOn(logger, 'info');
      const warnSpy = jest.spyOn(logger, 'warn');
      const errorSpy = jest.spyOn(logger, 'error');
      const response = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(signupBody)
        .expect(201);

      const cookies = responseCookies(response.headers);
      const accessToken = cookieValue(cookies, 'access_token');
      const refreshToken = cookieValue(cookies, 'refresh_token');
      const storedUser = await userModel.findOne({ email: signupBody.email });
      const loggedValues = JSON.stringify([
        infoSpy.mock.calls,
        warnSpy.mock.calls,
        errorSpy.mock.calls,
      ]);

      expect(loggedValues).not.toContain(signupBody.password);
      expect(loggedValues).not.toContain('DifferentPassword@456');
      expect(loggedValues).not.toContain(storedUser?.passwordHash ?? 'no-hash');
      expect(loggedValues).not.toContain(accessToken);
      expect(loggedValues).not.toContain(refreshToken);
    });

    it('returns a generic internal error and includes the request ID for unexpected failures', async () => {
      const errorSpy = jest
        .spyOn(logger, 'error')
        .mockImplementation(() => undefined);
      jest
        .spyOn(passwordHasher, 'hash')
        .mockRejectedValueOnce(new Error('synthetic unexpected failure'));

      const response = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .set('X-Request-ID', 'unexpected-error-test')
        .send(signupBody)
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong. Please try again later.',
        },
        requestId: 'unexpected-error-test',
      });
      expect(JSON.stringify(errorSpy.mock.calls)).not.toContain(
        signupBody.password,
      );
    });
  });
});
