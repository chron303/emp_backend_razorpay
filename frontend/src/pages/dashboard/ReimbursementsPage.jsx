import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLES } from '../../constants/roles.js';
import { STATUS } from '../../constants/status.js';
import { getReimbursements, makeDecision } from '../../services/reimbursement.service.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { LoadingContainer } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ErrorState } from '../../components/common/ErrorState.jsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.jsx';
import { toast } from 'react-toastify';
import { formatCurrency, formatDate, getErrorMessage } from '../../utils/formatters.js';
import { CheckCircle2, XCircle, Receipt } from 'lucide-react';

export default function ReimbursementsPage() {
  const { user } = useAuth();
  const [reimbursements, setReimbursements] = useState([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [error, setError]                   = useState(null);
  const [filter, setFilter]                 = useState('ALL');

  // Decision dialog
  const [dialog, setDialog] = useState({ open: false, reimb: null, decision: null });
  const [deciding, setDeciding] = useState(false);

  const role = user?.role;
  const canDecide = [ROLES.RM, ROLES.APE, ROLES.CFO].includes(role);

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

  const filtered = filter === 'ALL'
    ? reimbursements
    : reimbursements.filter((r) => r.status === filter);

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

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reimbursements</h1>
          <p className="page-subtitle">
            {role === ROLES.EMP  && 'Your submitted requests'}
            {role === ROLES.RM   && 'Requests from your team members'}
            {role === ROLES.APE  && 'RM-approved requests awaiting your review'}
            {role === ROLES.CFO  && 'All reimbursement requests across the organisation'}
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchData}>Refresh</button>
      </div>

      {/* Filter Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {['ALL', STATUS.PENDING, STATUS.APPROVED, STATUS.REJECTED].map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            {f !== 'ALL' && (
              <span style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '99px',
                padding: '0.1rem 0.45rem',
                fontSize: '0.72rem',
                marginLeft: '0.25rem',
              }}>
                {reimbursements.filter((r) => r.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Receipt size={18} />
            {filter === 'ALL' ? 'All Requests' : `${filter.charAt(0) + filter.slice(1).toLowerCase()} Requests`}
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {filtered.length} record{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {isLoading ? (
          <LoadingContainer />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchData} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No reimbursements" description="Nothing matches the current filter." />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>RM Decision</th>
                  <th>APE Decision</th>
                  <th>Submitted</th>
                  {canDecide && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td style={{ color: 'var(--text-disabled)' }}>{r.id}</td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{r.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                        {r.description?.slice(0, 55)}{r.description?.length > 55 ? '…' : ''}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {formatCurrency(r.amount)}
                    </td>
                    <td><StatusBadge status={r.status} /></td>
                    <td><StatusBadge status={r.rmDecision} /></td>
                    <td><StatusBadge status={r.apeDecision} /></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {formatDate(r.createdAt)}
                    </td>
                    {canDecide && (
                      <td>
                        {r.status === STATUS.PENDING ? (
                          <div className="action-row">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => setDialog({ open: true, reimb: r, decision: STATUS.APPROVED })}
                            >
                              <CheckCircle2 size={14} /> Approve
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => setDialog({ open: true, reimb: r, decision: STATUS.REJECTED })}
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-disabled)' }}>Closed</span>
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

      <ConfirmDialog
        isOpen={dialog.open}
        title={dialog.decision === STATUS.APPROVED ? 'Approve Reimbursement' : 'Reject Reimbursement'}
        message={`This will ${dialog.decision?.toLowerCase()} reimbursement #${dialog.reimb?.id} — "${dialog.reimb?.title}". Continue?`}
        confirmLabel={dialog.decision === STATUS.APPROVED ? 'Yes, Approve' : 'Yes, Reject'}
        confirmVariant={dialog.decision === STATUS.APPROVED ? 'success' : 'danger'}
        isLoading={deciding}
        onConfirm={confirmDecision}
        onCancel={() => setDialog({ open: false, reimb: null, decision: null })}
      />
    </div>
  );
}
