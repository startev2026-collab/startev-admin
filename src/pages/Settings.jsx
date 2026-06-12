import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineCog, HiOutlineSave } from 'react-icons/hi';

export default function Settings() {
  const [settings, setSettings] = useState({
    default_fine_amount: '300',
    fine_system_enabled: 'true'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      if (res.data.settings) {
        setSettings(prev => ({ ...prev, ...res.data.settings }));
      }
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/settings', settings);
      toast.success('Settings updated successfully');
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>System Settings</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-xs)' }}>Manage global configuration</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-md)' }}>
          <div className="stat-icon purple"><HiOutlineCog /></div>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>Fine & Renewal Settings</h2>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Enable Fine System</label>
            <select
              className="form-select"
              name="fine_system_enabled"
              value={settings.fine_system_enabled}
              onChange={handleChange}
            >
              <option value="true">Enabled - Charge fines for overdue rentals</option>
              <option value="false">Disabled - Do not charge fines</option>
            </select>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-xs)' }}>
              Controls whether the system automatically calculates and applies overdue fines.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Default Fine Amount (per 24 hours)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>₹</span>
              <input
                type="number"
                className="form-input"
                name="default_fine_amount"
                value={settings.default_fine_amount}
                onChange={handleChange}
                style={{ paddingLeft: 36 }}
                min="0"
                step="1"
              />
            </div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-xs)' }}>
              The base fine amount charged immediately upon expiry, and added again every 24 hours the rental remains overdue.
            </p>
          </div>

          <div style={{ marginTop: 'var(--space-xl)', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <HiOutlineSave /> {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
