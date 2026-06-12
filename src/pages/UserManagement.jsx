import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlinePhone, HiOutlineMail, HiOutlineIdentification, HiOutlineCamera,
  HiOutlineCheckCircle, HiOutlineEye, HiOutlineX, HiOutlineSearch, HiOutlineTrash
} from 'react-icons/hi';

const ID_TYPE_LABELS = {
  aadhar: 'Aadhaar Card',
  driving_licence: 'Driving License',
  passport: 'Passport',
  voter_id: 'Voter ID',
  pan: 'PAN Card',
  electricity_bill: 'Electricity Bill',
};

function parseIdDocuments(user) {
  // New format: id_proof_url is a JSON array string
  if (user.id_proof_url && user.id_proof_url.startsWith('[')) {
    try {
      return JSON.parse(user.id_proof_url);
    } catch { return []; }
  }
  // Legacy format: single URL string
  if (user.id_proof_url) {
    return [{
      type: user.id_proof_type || 'unknown',
      url: user.id_proof_url,
      is_verified_original: true,
    }];
  }
  return [];
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users);
    } catch (err) {
      toast.error('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete customer "${userName}"? This will permanently delete their account, rentals, and payments.`)) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('Customer deleted successfully');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete customer');
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    return !q ||
      u.name?.toLowerCase().includes(q) ||
      u.phone?.includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      String(u.id).includes(q);
  });

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, color: 'var(--text-main)' }}>User Management</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-xs)' }}>
            All registered customers · {users.length} total
          </p>
        </div>
        <div style={{ position: 'relative', minWidth: 260 }}>
          <HiOutlineSearch size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" placeholder="Search by name, phone, email..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36, fontSize: '13px' }} />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading" style={{ height: 200 }}><div className="spinner"></div></div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Selfie</th>
                  <th>ID Documents</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const docs = parseIdDocuments(user);
                  const isExpanded = expandedUser === user.id;

                  return (
                    <tr key={user.id} style={{ verticalAlign: 'top' }}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{user.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {user.id}</div>
                        {user.father_name && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>F: {user.father_name}</div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                          <HiOutlinePhone size={14} className="text-muted" /> {user.phone}
                        </div>
                        {user.alt_phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginTop: '2px', color: 'var(--text-muted)' }}>
                            <HiOutlinePhone size={12} /> {user.alt_phone} (alt)
                          </div>
                        )}
                        {user.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginTop: '2px' }}>
                            <HiOutlineMail size={14} className="text-muted" /> {user.email}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${user.is_first_login ? 'badge-blue' : 'badge-green'}`}>
                          {user.is_first_login ? 'New' : 'Active'}
                        </span>
                      </td>
                      {/* Selfie */}
                      <td>
                        {user.selfie_url ? (
                          <div style={{ cursor: 'pointer' }} onClick={() => setLightboxImg(user.selfie_url)}>
                            <img src={user.selfie_url} alt="Selfie"
                              style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>N/A</span>
                        )}
                      </td>
                      {/* ID Docs */}
                      <td>
                        {docs.length > 0 ? (
                          <div>
                            {docs.slice(0, isExpanded ? docs.length : 1).map((doc, i) => (
                              <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                marginBottom: i < docs.length - 1 ? '6px' : 0,
                                padding: '4px 8px', borderRadius: '6px',
                                background: doc.is_verified_original ? 'rgba(16,185,129,0.08)' : 'transparent',
                                border: doc.is_verified_original ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent',
                              }}>
                                <a href={doc.url} target="_blank" rel="noopener noreferrer"
                                  onClick={(e) => { e.preventDefault(); setLightboxImg(doc.url); }}
                                  style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontSize: '12px', fontWeight: 500 }}>
                                  <HiOutlineIdentification size={14} />
                                  {ID_TYPE_LABELS[doc.type] || doc.type}
                                </a>
                                {doc.is_verified_original && (
                                  <HiOutlineCheckCircle size={14} style={{ color: '#10b981', flexShrink: 0 }} title="Original Verified" />
                                )}
                              </div>
                            ))}
                            {docs.length > 1 && !isExpanded && (
                              <button type="button" onClick={() => setExpandedUser(user.id)}
                                style={{
                                  background: 'none', border: 'none', color: 'var(--primary)',
                                  fontSize: '11px', cursor: 'pointer', padding: '2px 0', fontWeight: 500,
                                }}>
                                +{docs.length - 1} more document{docs.length - 1 > 1 ? 's' : ''}
                              </button>
                            )}
                            {isExpanded && docs.length > 1 && (
                              <button type="button" onClick={() => setExpandedUser(null)}
                                style={{
                                  background: 'none', border: 'none', color: 'var(--text-muted)',
                                  fontSize: '11px', cursor: 'pointer', padding: '2px 0',
                                }}>
                                Show less
                              </button>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>N/A</span>
                        )}
                      </td>
                      <td style={{ maxWidth: 180, fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {user.current_address || <span className="text-muted">N/A</span>}
                      </td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px' }}
                        >
                          <HiOutlineTrash size={14} /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>
                      {search ? 'No users match your search.' : 'No users found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Image Lightbox */}
      {lightboxImg && (
        <div onClick={() => setLightboxImg(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, cursor: 'pointer',
        }}>
          <button onClick={() => setLightboxImg(null)} style={{
            position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)',
            border: 'none', borderRadius: '50%', width: 40, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', cursor: 'pointer',
          }}>
            <HiOutlineX size={24} />
          </button>
          <img src={lightboxImg} alt="Document"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: '12px', objectFit: 'contain', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }} />
        </div>
      )}
    </div>
  );
}
