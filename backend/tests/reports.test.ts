import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import './setup';

describe('Attendance Reports & CSV Export API Tests', () => {
  let adminCookie = '';

  beforeAll(async () => {
    const adminLoginRes = await request(app)
      .post('/api/auth/admin/login')
      .send({
        identifier: 'ADMIN999',
        password: 'TestAdminPass123!',
      });
    adminCookie = adminLoginRes.headers['set-cookie'][0];
  });

  it('1. Admin can retrieve filtered attendance report', async () => {
    const res = await request(app)
      .get('/api/reports/attendance?page=1&limit=20')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.records)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it('2. Admin can export attendance report as safe CSV with UTF-8 BOM', async () => {
    const res = await request(app)
      .get('/api/reports/attendance/export')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.headers['content-disposition']).toContain('attachment');
    expect(res.text.startsWith('\uFEFF')).toBe(true); // UTF-8 BOM for Khmer text in Excel
    expect(res.text).toContain('Student/Staff ID');
    expect(res.text).toContain('Khmer Name');
    expect(res.text).toContain('English Name');
  });
});
