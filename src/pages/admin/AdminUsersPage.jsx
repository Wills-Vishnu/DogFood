import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Users } from 'lucide-react';
import { Alert, Badge, Card, CardContent, EmptyState, ErrorState } from '../../components/common';
import { PageSpinner, ProtectedPage } from '../../components/common/ProtectedPage';
import { MainLayout } from '../../layouts/MainLayout';
import { adminApi } from '../../api/endpoints';
import { useAuth } from '../../auth/AuthContext';
import { formatDate } from '../../utils/format';

const ROLES = ['participant', 'judge', 'organizer', 'admin'];

export const AdminUsersPage = () => (
  <ProtectedPage roles={['admin']}>
    <AdminUsers />
  </ProtectedPage>
);

const AdminUsers = () => {
  const { user: me } = useAuth();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(() => {
    setError(null);
    adminApi.users({ q: query, role }).then(setUsers).catch(err => setError(err.message));
  }, [query, role]);

  useEffect(() => {
    load();
  }, [load]);

  const update = async (target, changes) => {
    setNotice(null);
    try {
      const updated = await adminApi.updateUser(target.id, changes);
      setUsers(prev => prev.map(item => (item.id === updated.id ? updated : item)));
      setNotice({ type: 'success', message: `${updated.display_name} updated` });
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    }
  };

  return (
    <MainLayout>
      <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 font-medium mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-brand-900 mb-2">Users</h1>
        <p className="text-lg text-brand-600">Roles are enforced by the server on every request</p>
      </div>

      {notice && <Alert type={notice.type} message={notice.message} onClose={() => setNotice(null)} className="mb-6" />}

      <Card className="mb-6">
        <CardContent className="pt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400" />
            <input className="input pl-12" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} aria-label="Search users" />
          </div>
          <select className="input sm:w-48" value={role} onChange={e => setRole(e.target.value)} aria-label="Role filter">
            <option value="">All roles</option>
            {ROLES.map(item => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {error ? (
        <ErrorState title="Couldn't load users" message={error} onRetry={load} />
      ) : !users ? (
        <PageSpinner />
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" />
      ) : (
        <Card>
          <CardContent className="pt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-200 text-left">
                  <th className="py-3 px-4 font-semibold text-brand-900">Name</th>
                  <th className="py-3 px-4 font-semibold text-brand-900">Email</th>
                  <th className="py-3 px-4 font-semibold text-brand-900">Role</th>
                  <th className="py-3 px-4 font-semibold text-brand-900">Status</th>
                  <th className="py-3 px-4 font-semibold text-brand-900">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(item => {
                  const isMe = item.id === me.id;
                  return (
                    <tr key={item.id} className="border-b border-brand-100 hover:bg-brand-50">
                      <td className="py-3 px-4 text-brand-900 font-medium">
                        {item.display_name}
                        {isMe && <span className="text-brand-500 font-normal"> (you)</span>}
                      </td>
                      <td className="py-3 px-4 text-brand-600">{item.email}</td>
                      <td className="py-3 px-4">
                        <select
                          className="input py-1"
                          value={item.role}
                          disabled={isMe}
                          onChange={e => update(item, { role: e.target.value })}
                          aria-label={`Role for ${item.display_name}`}
                        >
                          {ROLES.map(option => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          disabled={isMe}
                          onClick={() => update(item, { is_active: !item.is_active })}
                          className="disabled:cursor-not-allowed"
                          title={isMe ? undefined : item.is_active ? 'Deactivate' : 'Reactivate'}
                        >
                          <Badge variant={item.is_active ? 'success' : 'danger'}>{item.is_active ? 'Active' : 'Deactivated'}</Badge>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-brand-600">{formatDate(item.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </MainLayout>
  );
};
