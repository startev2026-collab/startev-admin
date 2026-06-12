import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineShieldCheck, HiOutlineCog, HiOutlineCurrencyRupee } from 'react-icons/hi';

export default function DepositSettings() {
  const [config, setConfig] = useState({ required_amount: 2000 });
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txFilter, setTxFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editAmount, setEditAmount] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [txFilter]);

  const fetchAll = async () => {
    try {
      const [configRes, summaryRes, txRes] = await Promise.all([
        api.get('/deposits/config'),
        api.get('/deposits/summary'),
        api.get('/deposits/all-transactions'),
      ]);
      setConfig(configRes.data);
      setEditAmount(configRes.data.required_amount);
      setSummary(summaryRes.data);
      setTransactions(txRes.data.transactions);
    } catch (err) {
      toast.error('Failed to load deposit settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const params = txFilter !== 'all' ? `?type=${txFilter}` : '';
      const res = await api.get(`/deposits/all-transactions${params}`);
      setTransactions(res.data.transactions);
    } catch (err) {
      // silent
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await api.put('/deposits/config', { required_amount: parseFloat(editAmount) });
      toast.success('Deposit amount updated!');
      setConfig({ ...config, required_amount: parseFloat(editAmount) });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleRefund = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to refund ${userName}'s deposit?`)) return;
    try {
      const res = await api.post('/deposits/refund', {
        user_id: userId,
        notes: 'Admin-initiated refund',
      });
      toast.success(res.data.message);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Refund failed');
    }
  };

  const txTypeBadge = (type) => {
    const map = {
      deposit: { cls: 'badge-success', label: '💰 Deposit' },
      deduction: { cls: 'badge-error', label: '📉 Deduction' },
      refund: { cls: 'badge-info', label: '↩️ Refund' },
    };
    const badge = map[type] || { cls: 'badge-info', label: type };
    return <span className={`badge ${badge.cls}`}>{badge.label}</span>;
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, marginBottom: 'var(--space-xl)' }}>
        Deposit Settings & Management
      </h2>

      {/* Config + Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-xl)', marginBottom: 'var(--space-2xl)' }}>
        {/* Config Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
            <div className="stat-icon purple"><HiOutlineCog /></div>
            <h3 style={{ fontWeight: 600 }}>Required Deposit Amount</h3>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, margin: 0 }}>
              <label className="form-label">Amount (₹)</label>
              <input className="form-input" type="number" min="0" value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={handleSaveConfig} disabled={saving}
              style={{ height: 42 }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-sm)' }}>
            This amount is required from all users before they can rent a bike.
          </p>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
              <div className="stat-icon green"><HiOutlineCurrencyRupee /></div>
              <h3 style={{ fontWeight: 600 }}>Deposit Summary</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Total Collected</p>
                <p style={{ fontWeight: 700, color: 'var(--success)' }}>₹{summary.total_deposits.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Total Deducted</p>
                <p style={{ fontWeight: 700, color: 'var(--error)' }}>₹{summary.total_deductions.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Total Refunded</p>
                <p style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>₹{summary.total_refunds.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Net Held</p>
                <p style={{ fontWeight: 700, color: 'var(--primary-light)' }}>₹{summary.net_held.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Verified Users</p>
                <p style={{ fontWeight: 700 }}>{summary.verified_users} <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>✅</span></p>
              </div>
              <div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Pending Users</p>
                <p style={{ fontWeight: 700 }}>{summary.pending_users} <span className="badge badge-warning" style={{ fontSize: '0.6rem' }}>⚠️</span></p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Log */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <h3 style={{ fontWeight: 600 }}>All Deposit Transactions</h3>
        </div>

        <div className="tabs" style={{ marginBottom: 'var(--space-lg)' }}>
          {['all', 'deposit', 'deduction', 'refund'].map((f) => (
            <button key={f} className={`tab ${txFilter === f ? 'active' : ''}`}
              onClick={() => setTxFilter(f)} style={{ textTransform: 'capitalize' }}>{f}</button>
          ))}
        </div>

        {transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No transactions found</h3>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Performed By</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ fontSize: 'var(--font-size-sm)' }}>
                      {new Date(tx.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tx.users?.name || '—'}</td>
                    <td>{tx.users?.phone || '—'}</td>
                    <td>{txTypeBadge(tx.transaction_type)}</td>
                    <td style={{ fontWeight: 600, color: tx.amount > 0 ? 'var(--success)' : 'var(--error)' }}>
                      {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                    </td>
                    <td><span className="badge badge-success">{tx.payment_status}</span></td>
                    <td style={{ fontSize: 'var(--font-size-sm)', textTransform: 'capitalize' }}>
                      {tx.performed_by_role || '—'}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tx.notes || '—'}
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
