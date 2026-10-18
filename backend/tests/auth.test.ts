import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import './setup';

describe('Authentication & Session API Tests', () => {
  let studentCookie = '';

  it('1. Successfully registers a new student with valid bilingual details', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nameKh: 'ចាន់ សុខា',
        nameEn: 'Chan Sokha',
        identifier: 'stu-101', // Lowercase with hyphen, should be normalized
        category: 'STUDENT',
        faculty: 'Information Technology',
        major: 'Computer Science',
        classGroup: 'Year 2 - Class A',
        email: 'chan.sokha@student.edu.kh',
        phone: '012345678',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.identifier).toBe('STU-101'); // Normalized
    expect(res.body.user.status).toBe('ACTIVE');

    // Should receive persistent session cookie
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    studentCookie = cookies[0];
  });

  it('2. Rejects duplicate registration with identical Student ID', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nameKh: 'ចាន់ សុខា ២',
        nameEn: 'Chan Sokha Two',
        identifier: 'STU-101', // Already registered
        category: 'STUDENT',
        faculty: 'Information Technology',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('IDENTIFIER_ALREADY_EXISTS');
  });

  it('3. Rejects registration when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nameKh: '',
        identifier: 'STU-999',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('4. Returning user is automatically recognized on same device via persistent session', async () => {
    const res = await request(app)
      .get('/api/auth/session')
      .set('Cookie', studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.authenticated).toBe(true);
    expect(res.body.user.identifier).toBe('STU-101');
    expect(res.body.user.nameEn).toBe('Chan Sokha');
  });

  it('5. Option B: Successfully identifies returning user on a new device using Student ID + Khmer Name', async () => {
    const res = await request(app)
      .post('/api/auth/identify')
      .send({
        identifier: 'stu-101',
        name: 'ចាន់ សុខា',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.identifier).toBe('STU-101');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('6. Option B: Successfully identifies returning user using English Name with varied casing', async () => {
    const res = await request(app)
      .post('/api/auth/identify')
      .send({
        identifier: 'STU-101',
        name: 'chan sokha', // Lowercase
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.identifier).toBe('STU-101');
  });

  it('7. Option B: Rejects identification when Name does not match ID (Generic 401 error)', async () => {
    const res = await request(app)
      .post('/api/auth/identify')
      .send({
        identifier: 'STU-101',
        name: 'Wrong Name',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('8. Option B: Rejects identification for non-existent ID (Generic 401 error without enumeration)', async () => {
    const res = await request(app)
      .post('/api/auth/identify')
      .send({
        identifier: 'DOES-NOT-EXIST-999',
        name: 'Some Name',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('9. Logs out user and invalidates session', async () => {
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', studentCookie);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);

    // Verify session is now invalidated
    const sessionRes = await request(app)
      .get('/api/auth/session')
      .set('Cookie', studentCookie);

    expect(sessionRes.body.authenticated).toBe(false);
  });
});
