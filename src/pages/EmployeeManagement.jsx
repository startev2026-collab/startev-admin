import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', store_id: '', username: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/employees'),
      api.get('/stores'),
    ]).then(([empRes, storeRes]) => {
      setEmployees(empRes.data.employees);
      setStores(storeRes.data.stores);
    }).catch(() => toast.error('Failed to load data')).finally(() => setLoading(false));
  }, []);

  const fetchEmployees = async () => {
    const res = await api.get('/employees');
    setEmployees(res.data.employees);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', store_id: '', username: '', password: '', phone: '' });
    setShowModal(true);
  };

  const openEdit = (emp) => {
    setEditing(emp);
    setForm({ name: emp.name, store_id: emp.store_id, username: emp.username, password: '', phone: emp.phone || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const data = { ...form };
        if (!data.password) delete data.password;
        await api.put(`/employees/${editing.id}`, data);
        toast.success('Employee updated');
      } else {
        await api.post('/employees', form);
        toast.success('Employee created');
      }
      setShowModal(false);
      fetchEmployees();
    } catch (err) { toast.error(err.response?.data?.error || 'Save failed'); }
  };

  const handleDelete = async (emp) => {
    if (!confirm(`Delete employee ${emp.name}?`)) return;
    try {
      await api.delete(`/employees/${emp.id}`);
      toast.success('Employee deleted');
      fetchEmployees();
    } catch (err) { toast.error(err.response?.data?.error || 'Delete failed'); }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600 }}>Employee Management</h2>
        <button className="btn btn-primary" onClick={openCreate}><HiOutlinePlus /> Add Employee</button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Username</th><th>Store</th><th>Phone</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{emp.name}</td>
                <td>{emp.username}</td>
                <td><span className="badge badge-purple">{emp.store_id}</span></td>
                <td>{emp.phone}</td>
                <td>
                  <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => openEdit(emp)}><HiOutlinePencil /></button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(emp)}><HiOutlineTrash /></button>
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
              <h2>{editing ? 'Edit Employee' : 'Add Employee'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><HiOutlineX /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-input" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Store</label>
                  <select className="form-select" value={form.store_id}
                    onChange={(e) => setForm({ ...form, store_id: e.target.value })} required>
                    <option value="">Select store</option>
                    {stores.map((s) => <option key={s.store_id} value={s.store_id}>{s.store_name} ({s.store_id})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input className="form-input" value={form.username} disabled={!!editing}
                    onChange={(e) => setForm({ ...form, username: e.target.value })} required />
                </div>
                <div className="form-group" style={{ position: 'relative' }}>
                  <label className="form-label">Password {editing && '(leave blank to keep current)'}</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input className="form-input" type={showPassword ? "text" : "password"} value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editing} 
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
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} />
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
