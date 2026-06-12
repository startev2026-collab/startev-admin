import { useState, useEffect } from 'react';
import api from '../api/axios';
import { HiOutlineCash, HiOutlineExclamationCircle, HiOutlineUsers } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function Fines() {
  const [finesData, setFinesData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFines();
  }, []);

  const fetchFines = async () => {
    try {
      const res = await api.get('/admin/fines');
      setFinesData(res.data);
    } catch (err) {
      toast.error('Failed to load fines data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const { overdue_rentals = [], metrics = {} } = finesData || {};

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>Fine Management</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-xs)' }}>Track overdue rentals and fine collection</p>
        </div>
        <button className="btn btn-secondary" onClick={() => { setLoading(true); fetchFines(); }}>
          Refresh Data
        </button>
      </div>

      <div className="card-grid" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="stat-card">
          <div className="stat-icon red"><HiOutlineExclamationCircle /></div>
          <div className="stat-info">
            <h3>{metrics.overdue_count || 0}</h3>
            <p>Overdue Rentals</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><HiOutlineCash /></div>
          <div className="stat-info">
            <h3>₹{(metrics.total_outstanding_fines || 0).toLocaleString('en-IN')}</h3>
            <p>Total Outstanding Fines</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><HiOutlineUsers /></div>
          <div className="stat-info">
            <h3>{metrics.users_with_fines || 0}</h3>
            <p>Users with Fines</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
          Currently Overdue Rentals
        </h3>

        {overdue_rentals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>All Good!</h3>
            <p>There are no overdue rentals with outstanding fines.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Bike</th>
                  <th>Store</th>
                  <th>Expiry Date</th>
                  <th>Fine Amount</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {overdue_rentals.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{r.users?.name || 'N/A'}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{r.users?.phone || ''}</div>
                    </td>
                    <td>
                      <div>{r.bikes?.bike_model}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>#{r.bikes?.bike_number}</div>
                    </td>
                    <td>{r.stores?.store_name}</td>
                    <td>
                      <span className="badge badge-error">
                        {new Date(r.expiry_date).toLocaleDateString('en-IN')}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--error)' }}>
                        ₹{parseFloat(r.fine_amount || 0).toLocaleString('en-IN')}
                      </strong>
                    </td>
                    <td>{r.fine_last_updated ? new Date(r.fine_last_updated).toLocaleDateString('en-IN') : 'N/A'}</td>
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
