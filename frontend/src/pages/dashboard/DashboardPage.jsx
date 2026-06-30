import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLES } from '../../constants/roles.js';
import { STATUS } from '../../constants/status.js';
import { getReimbursements, createReimbursement, makeDecision } from '../../services/reimbursement.service.js';
import { formatCurrency, formatDate, getErrorMessage } from '../../utils/formatters.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { LoadingContainer } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ErrorState } from '../../components/common/ErrorState.jsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.jsx';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  PlusCircle, Receipt, CheckCircle2, XCircle,
  Clock, DollarSign, TrendingUp, Users,
} from 'lucide-react';
import { Spinner } from '../../components/common/Spinner.jsx';

// ── Zod schema for create reimbursement ─────────────────────────────────────
const createSchema = z.object({
  title:       z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required'),
  amount:      z.coerce.number({ invalid_type_error: 'Must be a number' }).positive('Must be > 0'),
});

// ── EMP: Create Reimbursement Form ───────────────────────────────────────────
function CreateReimbursementForm({ onCreated }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(createSchema),
  });

  const onSubmit = async (data) => {
    try {
      await createReimbursement(data);
      toast.success('Reimbursement submitted!');
      reset();
      onCreated();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to submit reimbursement'));
    }
  };

  return (
    <div className="card mb-6">
      <div className="card-header">
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlusCircle size={18} color="var(--primary)" /> New Reimbursement Request
        </h3>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label" htmlFor="reimb-title">Title</label>
            <input
              id="reimb-title"
              type="text"
              placeholder="e.g. Travel to client site"
              className={`form-input${errors.title ? ' error' : ''}`}
              {...register('title')}
            />
            {errors.title && <span className="form-error">{errors.title.message}</span>}
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label" htmlFor="reimb-desc">Description</label>
            <textarea
              id="reimb-desc"
              rows={3}
              placeholder="Provide details of the expense…"
              className={`form-input${errors.description ? ' error' : ''}`}
              style={{ resize: 'vertical' }}
              {...register('description')}
            />
            {errors.description && <span className="form-error">{errors.description.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reimb-amount">Amount (₹)</label>
            <input
              id="reimb-amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              className={`form-input${errors.amount ? ' error' : ''}`}
              {...register('amount')}
            />
            {errors.amount && <span className="form-error">{errors.amount.message}</span>}
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              id="submit-reimb"
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? <><Spinner /> Submitting…</> : 'Submit Request'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ── Stats Row ────────────────────────────────────────────────────────────────
function StatsRow({ items }) {
  return (
    <div className="stats-grid">
      {items.map((s) => {
        const Icon = s.icon;
        return (
          <div className="stat-card" key={s.label}>
            <div className={`stat-icon stat-icon-${s.color}`}>
              <Icon size={22} />
            </div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Decision Buttons (RM / APE / CFO) ────────────────────────────────────────
function DecisionButtons({ reimb, onDecision }) {
  return (
    <div className="action-row">
      <button
        className="btn btn-success btn-sm"
        onClick={() => onDecision(reimb, STATUS.APPROVED)}
      >
        <CheckCircle2 size={14} /> Approve
      </button>
      <button
        className="btn btn-danger btn-sm"
        onClick={() => onDecision(reimb, STATUS.REJECTED)}
      >
        <XCircle size={14} /> Reject
      </button>
    </div>
  );
}

// ── Reimbursements Table ─────────────────────────────────────────────────────
function ReimbursementsTable({ items, canDecide, onDecision }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Amount</th>
            <th>Status</th>
            <th>RM</th>
            <th>APE</th>
            <th>Created</th>
            {canDecide && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id}>
              <td style={{ color: 'var(--text-disabled)' }}>{r.id}</td>
              <td>
                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{r.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  {r.description?.slice(0, 60)}{r.description?.length > 60 ? '…' : ''}
                </div>
              </td>
              <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {formatCurrency(r.amount)}
              </td>
              <td><StatusBadge status={r.status} /></td>
              <td><StatusBadge status={r.rmDecision} /></td>
              <td><StatusBadge status={r.apeDecision} /></td>
              <td style={{ fontSize: '0.8rem' }}>{formatDate(r.createdAt)}</td>
              {canDecide && (
                <td>
                  {r.status === STATUS.PENDING
                    ? <DecisionButtons reimb={r} onDecision={onDecision} />
                    : <span style={{ color: 'var(--text-disabled)', fontSize: '0.8rem' }}>Closed</span>
                  }
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main Dashboard Page ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const [reimbursements, setReimbursements] = useState([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [error, setError]                   = useState(null);

  // Decision dialog state
  const [dialog, setDialog] = useState({ open: false, reimb: null, decision: null });
  const [deciding, setDeciding] = useState(false);

  const role = user?.role;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getReimbursements();
      setReimbursements(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDecision = (reimb, decision) => {
    setDialog({ open: true, reimb, decision });
  };

  const confirmDecision = async () => {
    setDeciding(true);
    try {
      await makeDecision({ reimbursementId: dialog.reimb.id, decision: dialog.decision });
      toast.success(`Reimbursement ${dialog.decision.toLowerCase()} successfully`);
      setDialog({ open: false, reimb: null, decision: null });
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Decision failed'));
    } finally {
      setDeciding(false);
    }
  };

  // ── Stats ────────────────────────────────────────────────────────────────
  const total    = reimbursements.length;
  const pending  = reimbursements.filter((r) => r.status === STATUS.PENDING).length;
  const approved = reimbursements.filter((r) => r.status === STATUS.APPROVED).length;
  const rejected = reimbursements.filter((r) => r.status === STATUS.REJECTED).length;

  const stats = [
    { label: 'Total',    value: total,    icon: Receipt,       color: 'primary' },
    { label: 'Pending',  value: pending,  icon: Clock,         color: 'warning' },
    { label: 'Approved', value: approved, icon: CheckCircle2,  color: 'success' },
    { label: 'Rejected', value: rejected, icon: XCircle,       color: 'danger'  },
  ];

  const canDecide = [ROLES.RM, ROLES.APE, ROLES.CFO].includes(role);

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {role === ROLES.EMP  && 'My Dashboard'}
            {role === ROLES.RM   && 'Team Dashboard'}
            {role === ROLES.APE  && 'APE Dashboard'}
            {role === ROLES.CFO  && 'CFO Dashboard'}
          </h1>
          <p className="page-subtitle">
            {role === ROLES.EMP  && 'Submit and track your reimbursement requests'}
            {role === ROLES.RM   && 'Review and manage your team\'s reimbursements'}
            {role === ROLES.APE  && 'Approve RM-cleared reimbursements for payment'}
            {role === ROLES.CFO  && 'Full visibility into all reimbursement activity'}
          </p>
        </div>
      </div>

      {/* EMP: Create form */}
      {role === ROLES.EMP && <CreateReimbursementForm onCreated={fetchData} />}

      {/* Stats */}
      <StatsRow items={stats} />

      {/* Reimbursements table */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ margin: 0 }}>
            {role === ROLES.EMP ? 'My Requests' : 'Reimbursements'}
          </h3>
          <button className="btn btn-ghost btn-sm" onClick={fetchData}>Refresh</button>
        </div>

        {isLoading ? (
          <LoadingContainer />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchData} />
        ) : reimbursements.length === 0 ? (
          <EmptyState
            title="No reimbursements yet"
            description={role === ROLES.EMP ? 'Submit your first request above.' : 'Nothing to show here.'}
          />
        ) : (
          <ReimbursementsTable
            items={reimbursements}
            canDecide={canDecide}
            onDecision={handleDecision}
          />
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={dialog.open}
        title={dialog.decision === STATUS.APPROVED ? 'Approve Reimbursement' : 'Reject Reimbursement'}
        message={`Are you sure you want to ${dialog.decision?.toLowerCase()} this reimbursement request? This action will be recorded.`}
        confirmLabel={dialog.decision === STATUS.APPROVED ? 'Yes, Approve' : 'Yes, Reject'}
        confirmVariant={dialog.decision === STATUS.APPROVED ? 'success' : 'danger'}
        isLoading={deciding}
        onConfirm={confirmDecision}
        onCancel={() => setDialog({ open: false, reimb: null, decision: null })}
      />
    </div>
  );
}
