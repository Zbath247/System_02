import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { User, UserStatus } from '../types';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { t, isKhmer } = useLanguage();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers({
        page,
        limit: 15,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        role: roleFilter || undefined,
      });

      if (res.success) {
        setUsers(res.users);
        setPage(res.pagination.page);
        setTotalPages(res.pagination.totalPages);
        setTotal(res.pagination.total);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, statusFilter, roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleUpdateStatus = async (id: string, newStatus: UserStatus) => {
    try {
      await api.updateUserStatus(id, newStatus);
      fetchUsers();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleRevokeSessions = async (id: string) => {
    try {
      const res = await api.revokeUserSessions(id);
      alert(isKhmer ? `បានលុបចោល ${res.revokedCount} session!` : `Revoked ${res.revokedCount} session(s)!`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to revoke sessions:', err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {t.admin.userManagement}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {isKhmer ? `អ្នកប្រើប្រាស់សរុប៖ ${total} នាក់` : `Total users: ${total}`}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isKhmer ? 'ស្វែងរកតាម ID ឬឈ្មោះ...' : 'Search by ID or name...'}
                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:border-brand-500 text-xs sm:text-sm focus:outline-hidden bg-white w-48 sm:w-64"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              {t.common.search}
            </button>
          </form>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-500 font-bold mr-2">
            <Filter className="w-4 h-4" />
            <span>{t.common.filter}:</span>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="">{t.common.all} {t.common.status}</option>
            <option value="ACTIVE">{t.common.active}</option>
            <option value="PENDING_APPROVAL">{t.common.pending}</option>
            <option value="SUSPENDED">{t.common.suspended}</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="">{t.common.all} Roles</option>
            <option value="STUDENT">{t.roles.STUDENT}</option>
            <option value="TEACHER">{t.roles.TEACHER}</option>
            <option value="STAFF">{t.roles.STAFF}</option>
            <option value="ADMIN">{t.roles.ADMIN}</option>
            <option value="SUPER_ADMIN">{t.roles.SUPER_ADMIN}</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              {t.common.loading}
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              {isKhmer ? 'រកមិនឃើញអ្នកប្រើប្រាស់ទេ' : 'No users found.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Role / Category</th>
                    <th className="py-3 px-4">Faculty / Dept</th>
                    <th className="py-3 px-4">{t.common.status}</th>
                    <th className="py-3 px-4 text-right">{t.common.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        <div>{isKhmer ? u.nameKh : u.nameEn}</div>
                        <div className="text-[11px] text-slate-400 font-normal">
                          {isKhmer ? u.nameEn : u.nameKh}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                        {u.identifier}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                          {t.roles[u.role as keyof typeof t.roles] || u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        <div>{u.faculty}</div>
                        {u.classGroup && (
                          <div className="text-[11px] text-slate-400">{u.classGroup}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {u.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {t.common.active}
                          </span>
                        ) : u.status === 'PENDING_APPROVAL' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            {t.common.pending}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            {t.common.suspended}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center space-x-1">
                          {u.status === 'PENDING_APPROVAL' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(u.id, 'ACTIVE')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                            >
                              {t.admin.approve}
                            </button>
                          )}

                          {u.status === 'ACTIVE' && u.role !== 'SUPER_ADMIN' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(u.id, 'SUSPENDED')}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold border border-rose-200 transition-colors"
                            >
                              {t.admin.suspend}
                            </button>
                          )}

                          {u.status === 'SUSPENDED' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(u.id, 'ACTIVE')}
                              className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-xs font-bold border border-sky-200 transition-colors"
                            >
                              {t.admin.reactivate}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRevokeSessions(u.id)}
                            title={t.admin.revokeSessions}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-xs text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
