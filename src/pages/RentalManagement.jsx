import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineSearch, HiOutlineDownload } from 'react-icons/hi';

export default function RentalManagement() {
  const [rentals, setRentals] = useState([]);
  const [stores, setStores] = useState([]);
  const [filter, setFilter] = useState('all');
  const [storeFilter, setStoreFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/stores')])
      .then(([storesRes]) => setStores(storesRes.data.stores))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchRentals();
  }, [filter, storeFilter]);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      let params = [];
      if (filter !== 'all') params.push(`status=${filter}`);
      if (storeFilter) params.push(`store_id=${storeFilter}`);
      const query = params.length ? `?${params.join('&')}` : '';
      const res = await api.get(`/rentals${query}`);
      setRentals(res.data.rentals);
    } catch (err) { toast.error('Failed to load rentals'); }
    finally { setLoading(false); }
  };

  const filtered = rentals.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      r.users?.name?.toLowerCase().includes(s) ||
      r.users?.phone?.includes(s) ||
      r.bikes?.bike_number?.toLowerCase().includes(s)
    );
  });

  const exportExcel = async () => {
    try {
      const res = await api.get('/admin/export/rentals', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `rentals_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      toast.success('Excel downloaded!');
    } catch (err) { toast.error('Export failed'); }
  };

  const exportPdf = async () => {
    try {
      const res = await api.get('/admin/export/revenue-pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue_report_${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      toast.success('PDF downloaded!');
    } catch (err) { toast.error('Export failed'); }
  };

  const handleCancelRental = async (rentalId) => {
    if (!window.confirm('Are you sure you want to cancel this rental?')) return;
    try {
      await api.put(`/rentals/${rentalId}/cancel`);
      toast.success('Rental cancelled successfully');
      fetchRentals(); // Refresh the list
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel rental');
    }
  };

  const statusBadge = (status) => {
    const map = { active: 'badge-success', expired: 'badge-error', returned: 'badge-info', cancelled_by_admin: 'badge-error' };
    return <span className={`badge ${map[status] || 'badge-info'}`}>{status.replace('_', ' ')}</span>;
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600 }}>Rental Management</h2>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <button className="btn btn-secondary btn-sm" onClick={exportExcel}><HiOutlineDownload /> Excel</button>
          <button className="btn btn-secondary btn-sm" onClick={exportPdf}><HiOutlineDownload /> PDF</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
        <select className="form-select" value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)} style={{ width: 200 }}>
          <option value="">All Stores</option>
          {stores.map((s) => <option key={s.store_id} value={s.store_id}>{s.store_name}</option>)}
        </select>
        <div className="search-bar" style={{ width: 260 }}>
          <HiOutlineSearch />
          <input className="form-input" placeholder="Search..." value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="tabs">
        {['all', 'active', 'returned', 'expired', 'cancelled_by_admin'].map((f) => (
          <button key={f} className={`tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>{f.replace(/_/g, ' ')}</button>
        ))}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No rentals found</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Customer</th><th>Phone</th><th>Bike</th><th>Store</th><th>Plan</th><th>Start</th><th>Expiry</th><th>Amount</th><th>Payment</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.users?.name}</td>
                  <td>{r.users?.phone}</td>
                  <td>
                    <div>{r.bikes?.bike_model}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>#{r.bikes?.bike_number}</div>
                  </td>
                  <td>{r.stores?.store_name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{r.rental_plan}</td>
                  <td>{new Date(r.start_date).toLocaleDateString('en-IN')}</td>
                  <td>{new Date(r.expiry_date).toLocaleDateString('en-IN')}</td>
                  <td style={{ fontWeight: 600 }}>₹{parseFloat(r.amount).toLocaleString('en-IN')}</td>
                  <td><span className={`badge ${r.payment_status === 'completed' ? 'badge-success' : 'badge-warning'}`}>{r.payment_status}</span></td>
                  <td>{statusBadge(r.rental_status)}</td>
                  <td>
                    {r.rental_status === 'active' && (
                      <button className="btn btn-sm btn-ghost" style={{ color: 'var(--error)' }} onClick={() => handleCancelRental(r.id)}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
