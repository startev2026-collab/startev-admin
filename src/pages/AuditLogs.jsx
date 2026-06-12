import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/admin/audit-logs?limit=200');
      setLogs(res.data.logs);
    } catch (err) { toast.error('Failed to load audit logs'); }
    finally { setLoading(false); }
  };

  const actionBadge = (action) => {
    const map = { create: 'badge-success', update: 'badge-info', delete: 'badge-error' };
    return <span className={`badge ${map[action] || 'badge-info'}`}>{action}</span>;
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
        Audit Logs
      </h2>

      {logs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No audit logs yet</h3>
          <p>Admin actions will be recorded here.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Timestamp</th><th>Action</th><th>Entity</th><th>Details</th></tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: 'var(--font-size-xs)', whiteSpace: 'nowrap' }}>
                    {new Date(log.created_at).toLocaleString('en-IN')}
                  </td>
                  <td>{actionBadge(log.action)}</td>
                  <td style={{ textTransform: 'capitalize' }}>{log.entity_type}</td>
                  <td style={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
