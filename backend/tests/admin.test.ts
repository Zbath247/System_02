import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/prisma';
import './setup';

describe('Admin Management & RBAC API Tests', () => {
  let adminCookie = '';
  let studentCookie = '';

  beforeAll(async () => {
    // Admin login
    const adminLoginRes = await request(app)
      .post('/api/auth/admin/login')
      .send({
        identifier: 'ADMIN999',
        password: 'TestAdminPass123!',
      });
    adminCookie = adminLoginRes.headers['set-cookie'][0];

    // Register a student for testing permissions
    const studentRegRes = await request(app)
      .post('/api/auth/register')
      .send({
        nameKh: 'រដ្ឋ ពិសិដ្ឋ',
        nameEn: 'Rath Piseth',
        identifier: 'STU-RBAC-01',
        category: 'STUDENT',
        faculty: 'Law',
      });
    studentCookie = studentRegRes.headers['set-cookie'][0];
  });

  it('1. Denies unauthenticated access to admin endpoints', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('2. Denies student access to admin endpoints (RBAC 403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Cookie', studentCookie);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('3. Admin can retrieve dashboard statistics with real aggregates', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats.totalUsers).toBeGreaterThan(0);
    expect(typeof res.body.stats.todayCheckIns).toBe('number');
  });

  it('4. Admin can list and search users', async () => {
    const res = await request(app)
      .get('/api/admin/users?search=Piseth')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.users.length).toBeGreaterThan(0);
    expect(res.body.users[0].identifier).toBe('STU-RBAC-01');
  });

  it('5. Admin can suspend a user and active sessions are revoked', async () => {
    const user = await prisma.user.findUnique({ where: { identifier: 'STU-RBAC-01' } });

    const res = await request(app)
      .patch(`/api/admin/users/${user!.id}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'SUSPENDED', reason: 'Disciplinary review' });

    expect(res.status).toBe(200);
    expect(res.body.user.status).toBe('SUSPENDED');

    // Attempt to access session with studentCookie should now be rejected as suspended
    const sessionRes = await request(app)
      .get('/api/auth/session')
      .set('Cookie', studentCookie);

    expect(sessionRes.status).toBe(403);
    expect(sessionRes.body.code).toBe('ACCOUNT_SUSPENDED');
  });

  it('6. Admin can reactivate a user', async () => {
    const user = await prisma.user.findUnique({ where: { identifier: 'STU-RBAC-01' } });

    const res = await request(app)
      .patch(`/api/admin/users/${user!.id}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'ACTIVE' });

    expect(res.status).toBe(200);
    expect(res.body.user.status).toBe('ACTIVE');
  });

  it('7. Admin can add a new location and update its active status', async () => {
    const createRes = await request(app)
      .post('/api/admin/locations')
      .set('Cookie', adminCookie)
      .send({
        code: 'LOC-NEW-AUDITORIUM',
        nameKh: 'សាលមហោស្រពធំ',
        nameEn: 'Grand Auditorium',
        category: 'HALL',
        canCheckIn: true,
        canCheckOut: true,
        isActive: true,
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.location.code).toBe('LOC-NEW-AUDITORIUM');

    // Soft deactivation
    const updateRes = await request(app)
      .patch(`/api/admin/locations/${createRes.body.location.id}`)
      .set('Cookie', adminCookie)
      .send({ isActive: false });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.location.isActive).toBe(false);
  });
});
