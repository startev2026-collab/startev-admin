import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

export default function StoreManagement() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ store_id: '', store_name: '', password: '', address: '', contact_number: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { fetchStores(); }, []);

  const fetchStores = async () => {
    try {
      const res = await api.get('/stores');
      setStores(res.data.stores);
    } catch (err) { toast.error('Failed to load stores'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ store_id: '', store_name: '', password: '', address: '', contact_number: '' });
    setShowModal(true);
  };

  const openEdit = (store) => {
    setEditing(store);
    setForm({ store_id: store.store_id, store_name: store.store_name, password: '', address: store.address || '', contact_number: store.contact_number || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/stores/${editing.id}`, form);
        toast.success('Store updated');
      } else {
        await api.post('/stores', form);
        toast.success('Store created');
      }
      setShowModal(false);
      fetchStores();
    } catch (err) { toast.error(err.response?.data?.error || 'Save failed'); }
  };

  const handleDelete = async (store) => {
    if (!confirm(`Delete store ${store.store_name}?`)) return;
    try {
      await api.delete(`/stores/${store.id}`);
      toast.success('Store deleted');
      fetchStores();
    } catch (err) { toast.error(err.response?.data?.error || 'Delete failed'); }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600 }}>Store Management</h2>
        <button className="btn btn-primary" onClick={openCreate}><HiOutlinePlus /> Add Store</button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr><th>Store ID</th><th>Name</th><th>Address</th><th>Contact</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {stores.map((s) => (
              <tr key={s.id}>
                <td><span className="badge badge-purple">{s.store_id}</span></td>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.store_name}</td>
                <td>{s.address}</td>
                <td>{s.contact_number}</td>
                <td>
                  <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => openEdit(s)}><HiOutlinePencil /></button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s)}><HiOutlineTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Store' : 'Add Store'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><HiOutlineX /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Store ID</label>
                  <input className="form-input" value={form.store_id} disabled={!!editing}
                    onChange={(e) => setForm({ ...form, store_id: e.target.value })} required placeholder="e.g. S004" />
                </div>
                <div className="form-group">
                  <label className="form-label">Store Name</label>
                  <input className="form-input" value={form.store_name}
                    onChange={(e) => setForm({ ...form, store_name: e.target.value })} required placeholder="Store name" />
                </div>
                <div className="form-group" style={{ position: 'relative' }}>
                  <label className="form-label">{editing ? 'New Password (leave blank to keep current)' : 'Password'}</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input className="form-input" type={showPassword ? "text" : "password"} value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editing} placeholder="Shared store password" 
                      style={{ paddingRight: '40px', width: '100%' }} />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ 
                        position: 'absolute', right: '10px', background: 'none', border: 'none', 
                        color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' 
                      }}
                    >
                      {showPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea className="form-textarea" value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full address" />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Number</label>
                  <input className="form-input" value={form.contact_number}
                    onChange={(e) => setForm({ ...form, contact_number: e.target.value })} placeholder="Phone number" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
