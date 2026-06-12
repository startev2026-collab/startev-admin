import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';

export default function BikeManagement() {
  const [bikes, setBikes] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [storeFilter, setStoreFilter] = useState('');
  const [form, setForm] = useState({
    bike_number: '', bike_model: '', bike_type: '', store_id: '',
    daily_price: '', weekly_price: '', monthly_price: '', status: 'available', image_url: '',
  });

  useEffect(() => {
    Promise.all([api.get('/bikes'), api.get('/stores')])
      .then(([bikesRes, storesRes]) => {
        setBikes(bikesRes.data.bikes);
        setStores(storesRes.data.stores);
      }).catch(() => toast.error('Failed to load data')).finally(() => setLoading(false));
  }, []);

  const fetchBikes = async () => {
    const params = storeFilter ? `?store_id=${storeFilter}` : '';
    const res = await api.get(`/bikes${params}`);
    setBikes(res.data.bikes);
  };

  useEffect(() => { if (!loading) fetchBikes(); }, [storeFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({ bike_number: '', bike_model: '', bike_type: '', store_id: '', daily_price: '', weekly_price: '', monthly_price: '', status: 'available', image_url: '' });
    setShowModal(true);
  };

  const openEdit = (bike) => {
    setEditing(bike);
    setForm({
      bike_number: bike.bike_number, bike_model: bike.bike_model, bike_type: bike.bike_type || '',
      store_id: bike.store_id, daily_price: bike.daily_price, weekly_price: bike.weekly_price,
      monthly_price: bike.monthly_price, status: bike.status, image_url: bike.image_url || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/bikes/${editing.id}`, form);
        toast.success('Bike updated');
      } else {
        await api.post('/bikes', form);
        toast.success('Bike added');
      }
      setShowModal(false);
      fetchBikes();
    } catch (err) { toast.error(err.response?.data?.error || 'Save failed'); }
  };

  const handleDelete = async (bike) => {
    if (!confirm(`Delete bike ${bike.bike_number}?`)) return;
    try {
      await api.delete(`/bikes/${bike.id}`);
      toast.success('Bike deleted');
      fetchBikes();
    } catch (err) { toast.error(err.response?.data?.error || 'Delete failed'); }
  };

  const statusBadge = (status) => {
    const map = { available: 'badge-success', rented: 'badge-warning', maintenance: 'badge-error' };
    return <span className={`badge ${map[status] || 'badge-info'}`}>{status}</span>;
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600 }}>Bike Management</h2>
        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
          <select className="form-select" value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)} style={{ width: 200 }}>
            <option value="">All Stores</option>
            {stores.map((s) => <option key={s.store_id} value={s.store_id}>{s.store_name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={openCreate}><HiOutlinePlus /> Add Bike</button>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr><th>Number</th><th>Model</th><th>Type</th><th>Store</th><th>Daily</th><th>Weekly</th><th>Monthly</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {bikes.map((b) => (
              <tr key={b.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.bike_number}</td>
                <td>{b.bike_model}</td>
                <td>{b.bike_type}</td>
                <td><span className="badge badge-purple">{b.store_id}</span></td>
                <td>₹{b.daily_price}</td>
                <td>₹{b.weekly_price}</td>
                <td>₹{b.monthly_price}</td>
                <td>{statusBadge(b.status)}</td>
                <td>
                  <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => openEdit(b)}><HiOutlinePencil /></button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(b)}><HiOutlineTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Bike' : 'Add Bike'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><HiOutlineX /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Bike Number</label>
                    <input className="form-input" value={form.bike_number} disabled={!!editing}
                      onChange={(e) => setForm({ ...form, bike_number: e.target.value })} required placeholder="e.g. BK011" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Model</label>
                    <input className="form-input" value={form.bike_model}
                      onChange={(e) => setForm({ ...form, bike_model: e.target.value })} required placeholder="e.g. Ather 450X" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={form.bike_type}
                      onChange={(e) => setForm({ ...form, bike_type: e.target.value })}>
                      <option value="">Select type</option>
                      <option value="Electric Scooter">Electric Scooter</option>
                      <option value="Electric Motorcycle">Electric Motorcycle</option>
                      <option value="Electric Cycle">Electric Cycle</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Store</label>
                    <select className="form-select" value={form.store_id}
                      onChange={(e) => setForm({ ...form, store_id: e.target.value })} required>
                      <option value="">Select store</option>
                      {stores.map((s) => <option key={s.store_id} value={s.store_id}>{s.store_name} ({s.store_id})</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Daily Price (₹)</label>
                    <input className="form-input" type="number" value={form.daily_price}
                      onChange={(e) => setForm({ ...form, daily_price: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Weekly Price (₹)</label>
                    <input className="form-input" type="number" value={form.weekly_price}
                      onChange={(e) => setForm({ ...form, weekly_price: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Monthly Price (₹)</label>
                    <input className="form-input" type="number" value={form.monthly_price}
                      onChange={(e) => setForm({ ...form, monthly_price: e.target.value })} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      <option value="available">Available</option>
                      <option value="rented">Rented</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Image URL (optional)</label>
                    <input className="form-input" value={form.image_url}
                      onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Cloudinary URL" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add Bike'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
