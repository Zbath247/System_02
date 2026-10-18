const API_BASE = '/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...customConfig } = options;

  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const config: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include', // Include HTTP-only session cookies
    ...customConfig,
  };

  const response = await fetch(url, config);

  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      const error: any = new Error(data.message || 'API request failed');
      error.code = data.code;
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return data as T;
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response as any;
}

// Auth API
export const api = {
  // Public Config
  getPublicConfig: () => request('/config/public'),

  // Auth
  getSession: () => request('/auth/session'),
  register: (data: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  identify: (data: { identifier: string; name: string }) =>
    request('/auth/identify', { method: 'POST', body: JSON.stringify(data) }),
  adminLogin: (data: { identifier: string; password: string }) =>
    request('/auth/admin/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // Locations
  getActiveLocations: () => request('/locations/active'),

  // Attendance
  getMeStatus: () => request('/attendance/me'),
  getMyHistory: (page = 1, limit = 10) => request('/attendance/me/history', { params: { page, limit } }),
  checkIn: (data: { locationId: string; note?: string; idempotencyKey?: string }) =>
    request('/attendance/check-in', { method: 'POST', body: JSON.stringify(data) }),
  checkOut: (data: { locationId: string; note?: string; idempotencyKey?: string }) =>
    request('/attendance/check-out', { method: 'POST', body: JSON.stringify(data) }),

  // Admin
  getDashboardStats: () => request('/admin/stats'),
  getUsers: (params?: any) => request('/admin/users', { params }),
  getUserById: (id: string) => request(`/admin/users/${id}`),
  updateUserStatus: (id: string, status: string, reason?: string) =>
    request(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, reason }) }),
  updateUserRole: (id: string, role: string) =>
    request(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  revokeUserSessions: (id: string) =>
    request(`/admin/users/${id}/revoke-sessions`, { method: 'POST' }),
  getAdminLocations: () => request('/admin/locations'),
  createLocation: (data: any) => request('/admin/locations', { method: 'POST', body: JSON.stringify(data) }),
  updateLocation: (id: string, data: any) =>
    request(`/admin/locations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getAuditLogs: (page = 1, limit = 20) => request('/admin/audit-logs', { params: { page, limit } }),

  // Reports
  getReports: (params?: any) => request('/reports/attendance', { params }),
  getExportUrl: (params?: any) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    return `/api/reports/attendance/export?${searchParams.toString()}`;
  },
};
