import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLES, ROLE_LABELS } from '../../constants/roles.js';
import { getEmployees } from '../../services/employee.service.js';
import { assignRole } from '../../services/role.service.js';
import { RoleBadge } from '../../components/common/StatusBadge.jsx';
import { LoadingContainer, Spinner } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ErrorState } from '../../components/common/ErrorState.jsx';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../../utils/formatters.js';
import { Shield, UserCog } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const roleSchema = z.object({
  userId: z.coerce.number().int().positive('Select a user'),
  role:   z.enum([ROLES.EMP, ROLES.RM, ROLES.APE, ROLES.CFO], { required_error: 'Select a role' }),
});

export default function RolesPage() {
  const { user: me } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(roleSchema) });

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getEmployees();
      setEmployees(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const onSubmit = async (data) => {
    try {
      await assignRole(data);
      toast.success('Role assigned successfully');
      reset();
      fetchEmployees();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Role assignment failed'));
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Role Management</h1>
          <p className="page-subtitle">Assign roles to employees across the organisation</p>
        </div>
      </div>

      {/* Assign Role Card */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCog size={18} color="var(--primary)" /> Assign Role
          </h3>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="role-user">User</label>
              <select
                id="role-user"
                className={`form-input form-select${errors.userId ? ' error' : ''}`}
                {...register('userId')}
                defaultValue=""
              >
                <option value="" disabled>Select user…</option>
                {employees
                  .filter((e) => e.id !== me?.id) // can't reassign yourself
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} — {e.email} ({e.role})
                    </option>
                  ))}
              </select>
              {errors.userId && <span className="form-error">{errors.userId.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="role-select">New Role</label>
              <select
                id="role-select"
                className={`form-input form-select${errors.role ? ' error' : ''}`}
                {...register('role')}
                defaultValue=""
              >
                <option value="" disabled>Select role…</option>
                {Object.entries(ROLE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{key} — {label}</option>
                ))}
              </select>
              {errors.role && <span className="form-error">{errors.role.message}</span>}
            </div>

            <button
              id="assign-role-submit"
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ height: '42px' }}
            >
              {isSubmitting ? <><Spinner /> Assigning…</> : <><Shield size={16} /> Assign</>}
            </button>
          </div>
        </form>
      </div>

      {/* Employees with roles table */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ margin: 0 }}>All Users & Roles</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {employees.length} records
          </span>
        </div>

        {isLoading ? (
          <LoadingContainer />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchEmployees} />
        ) : employees.length === 0 ? (
          <EmptyState title="No users found" />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Current Role</th>
                  <th>Role Description</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td style={{ color: 'var(--text-disabled)' }}>{emp.id}</td>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                      {emp.name}
                      {emp.id === me?.id && (
                        <span style={{
                          marginLeft: '0.5rem',
                          fontSize: '0.7rem',
                          background: 'var(--primary-muted)',
                          color: 'var(--primary)',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '99px',
                        }}>you</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{emp.email}</td>
                    <td><RoleBadge role={emp.role} /></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {ROLE_LABELS[emp.role] || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
