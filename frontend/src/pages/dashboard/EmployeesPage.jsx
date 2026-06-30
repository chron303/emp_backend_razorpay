import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLES } from '../../constants/roles.js';
import { getEmployees, assignManager, removeManager } from '../../services/employee.service.js';
import { RoleBadge } from '../../components/common/StatusBadge.jsx';
import { LoadingContainer, Spinner } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ErrorState } from '../../components/common/ErrorState.jsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.jsx';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../../utils/formatters.js';
import { Users, UserPlus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// ── Assign Manager Modal ─────────────────────────────────────────────────────
const assignSchema = z.object({
  employeeId: z.coerce.number().int().positive('Select an employee'),
  managerId:  z.coerce.number().int().positive('Select a manager'),
});

function AssignManagerModal({ employees, onClose, onAssigned }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(assignSchema),
  });

  const emps = employees.filter((e) => e.role === ROLES.EMP);
  const rms  = employees.filter((e) => e.role === ROLES.RM);

  const onSubmit = async (data) => {
    try {
      await assignManager(data);
      toast.success('Manager assigned successfully');
      onAssigned();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Assignment failed'));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={18} color="var(--primary)" /> Assign Manager
          </h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '0.25rem' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group mb-4">
            <label className="form-label" htmlFor="assign-emp">Employee (EMP)</label>
            <select
              id="assign-emp"
              className={`form-input form-select${errors.employeeId ? ' error' : ''}`}
              {...register('employeeId')}
              defaultValue=""
            >
              <option value="" disabled>Select employee…</option>
              {emps.map((e) => (
                <option key={e.id} value={e.id}>{e.name} ({e.email})</option>
              ))}
            </select>
            {errors.employeeId && <span className="form-error">{errors.employeeId.message}</span>}
          </div>

          <div className="form-group mb-4">
            <label className="form-label" htmlFor="assign-mgr">Manager (RM)</label>
            <select
              id="assign-mgr"
              className={`form-input form-select${errors.managerId ? ' error' : ''}`}
              {...register('managerId')}
              defaultValue=""
            >
              <option value="" disabled>Select manager…</option>
              {rms.map((r) => (
                <option key={r.id} value={r.id}>{r.name} ({r.email})</option>
              ))}
            </select>
            {errors.managerId && <span className="form-error">{errors.managerId.message}</span>}
          </div>

          <div className="modal-footer" style={{ margin: 0, padding: 0, border: 'none', marginTop: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <><Spinner /> Assigning…</> : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function EmployeesPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [removeTarget, setRemoveTarget]       = useState(null);
  const [removing, setRemoving]               = useState(false);

  const isCFO = user?.role === ROLES.CFO;

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

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await removeManager({ employeeId: removeTarget.id });
      toast.success('Manager assignment removed');
      setRemoveTarget(null);
      fetchEmployees();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Removal failed'));
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">
            {isCFO ? 'Manage all employees, assign managers' : 'View team members'}
          </p>
        </div>
        {isCFO && (
          <button
            id="assign-manager-btn"
            className="btn btn-primary"
            onClick={() => setShowAssignModal(true)}
          >
            <UserPlus size={16} /> Assign Manager
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} /> Employee Directory
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {employees.length} records
          </span>
        </div>

        {isLoading ? (
          <LoadingContainer />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchEmployees} />
        ) : employees.length === 0 ? (
          <EmptyState title="No employees found" />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  {isCFO && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td style={{ color: 'var(--text-disabled)' }}>{emp.id}</td>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{emp.name}</td>
                    <td style={{ fontSize: '0.85rem' }}>{emp.email}</td>
                    <td><RoleBadge role={emp.role} /></td>
                    {isCFO && (
                      <td>
                        {emp.role === ROLES.EMP && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setRemoveTarget(emp)}
                          >
                            <X size={14} /> Remove Manager
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Manager Modal */}
      {showAssignModal && (
        <AssignManagerModal
          employees={employees}
          onClose={() => setShowAssignModal(false)}
          onAssigned={fetchEmployees}
        />
      )}

      {/* Remove Manager Confirm */}
      <ConfirmDialog
        isOpen={!!removeTarget}
        title="Remove Manager Assignment"
        message={`Remove the manager assignment for ${removeTarget?.name}? They will become unmanaged.`}
        confirmLabel="Remove"
        confirmVariant="danger"
        isLoading={removing}
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}
