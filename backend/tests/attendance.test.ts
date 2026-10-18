import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/prisma';
import './setup';

describe('Attendance Workflow API Tests', () => {
  let studentCookie = '';
  let gateLocationId = '';
  let labLocationId = '';
  let inactiveLocationId = '';

  beforeAll(async () => {
    // Register and login a student
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        nameKh: 'ហ៊ាង វិចិត្រ',
        nameEn: 'Heang Vichet',
        identifier: 'STU-ATT-01',
        category: 'STUDENT',
        faculty: 'Engineering',
      });
    studentCookie = regRes.headers['set-cookie'][0];

    // Get locations
    const gateLoc = await prisma.location.findUnique({ where: { code: 'LOC-TEST-GATE' } });
    const labLoc = await prisma.location.findUnique({ where: { code: 'LOC-TEST-LAB' } });
    const inactiveLoc = await prisma.location.findUnique({ where: { code: 'LOC-TEST-INACTIVE' } });

    gateLocationId = gateLoc!.id;
    labLocationId = labLoc!.id;
    inactiveLocationId = inactiveLoc!.id;
  });

  it('1. Successfully checks in at an active allowed location', async () => {
    const res = await request(app)
      .post('/api/attendance/check-in')
      .set('Cookie', studentCookie)
      .send({
        locationId: gateLocationId,
        note: 'Arrived for morning lecture',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.attendance.eventType).toBe('CHECK_IN');
    expect(res.body.attendance.location.code).toBe('LOC-TEST-GATE');
    expect(res.body.attendance.timestamp).toBeDefined();
  });

  it('2. Rejects consecutive check-in without an intervening check-out', async () => {
    const res = await request(app)
      .post('/api/attendance/check-in')
      .set('Cookie', studentCookie)
      .send({
        locationId: gateLocationId,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('ALREADY_CHECKED_IN');
  });

  it('3. Rejects check-in at an inactive location', async () => {
    // First let's check out to reset state
    await request(app)
      .post('/api/attendance/check-out')
      .set('Cookie', studentCookie)
      .send({ locationId: gateLocationId });

    const res = await request(app)
      .post('/api/attendance/check-in')
      .set('Cookie', studentCookie)
      .send({
        locationId: inactiveLocationId,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('LOCATION_INACTIVE');
  });

  it('4. Successfully checks in and then checks out with duration calculation', async () => {
    // Check in at Gate
    await request(app)
      .post('/api/attendance/check-in')
      .set('Cookie', studentCookie)
      .send({ locationId: gateLocationId });

    // Check out at Gate
    const checkOutRes = await request(app)
      .post('/api/attendance/check-out')
      .set('Cookie', studentCookie)
      .send({
        locationId: gateLocationId,
        note: 'Completed study session',
      });

    expect(checkOutRes.status).toBe(201);
    expect(checkOutRes.body.success).toBe(true);
    expect(checkOutRes.body.attendance.eventType).toBe('CHECK_OUT');
    expect(typeof checkOutRes.body.durationMinutes).toBe('number');
  });

  it('5. Rejects check-out when there is no active check-in', async () => {
    const res = await request(app)
      .post('/api/attendance/check-out')
      .set('Cookie', studentCookie)
      .send({ locationId: gateLocationId });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('NO_ACTIVE_CHECK_IN');
  });

  it('6. Rejects check-out at a location where check-out is not permitted', async () => {
    // Check in first at Gate
    await request(app)
      .post('/api/attendance/check-in')
      .set('Cookie', studentCookie)
      .send({ locationId: gateLocationId });

    // Try check-out at Lab where canCheckOut is false
    const res = await request(app)
      .post('/api/attendance/check-out')
      .set('Cookie', studentCookie)
      .send({ locationId: labLocationId });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('CHECK_OUT_NOT_ALLOWED');
  });

  it('7. Returns current status on dashboard', async () => {
    const res = await request(app)
      .get('/api/attendance/me')
      .set('Cookie', studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.currentStatus).toBe('CHECKED_IN');
  });

  it('8. Returns personal attendance history with pagination', async () => {
    const res = await request(app)
      .get('/api/attendance/me/history?page=1&limit=10')
      .set('Cookie', studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.events)).toBe(true);
    expect(res.body.pagination.total).toBeGreaterThan(0);
  });
});
