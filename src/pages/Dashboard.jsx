import { useState, useEffect } from 'react';
import api from '../api/axios';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  HiOutlineUsers, HiOutlineUserGroup, HiOutlineOfficeBuilding, HiOutlineTruck,
  HiOutlineCheckCircle, HiOutlineClock, HiOutlineCurrencyRupee, HiOutlineChartBar
} from 'react-icons/hi';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [storeRevenue, setStoreRevenue] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/analytics'),
      api.get('/admin/store-revenue'),
      api.get('/admin/monthly-revenue'),
    ]).then(([analyticsRes, storeRes, monthlyRes]) => {
      setAnalytics(analyticsRes.data);
      setStoreRevenue(storeRes.data.store_revenue);
      setMonthlyRevenue(monthlyRes.data.monthly_revenue);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const formatCurrency = (val) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
    return `₹${val}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{label}</p>
          <p style={{ color: payload[0].fill || payload[0].stroke || 'var(--primary)', fontWeight: 500, margin: 0 }}>
            Revenue: ₹{Number(payload[0].value).toLocaleString('en-IN')}
          </p>
        </div>
      );
    }
    return null;
  };

  const stats = [
    { label: 'Total Users', value: analytics?.total_users, icon: <HiOutlineUsers />, color: 'purple' },
    { label: 'Total Employees', value: analytics?.total_employees, icon: <HiOutlineUserGroup />, color: 'blue' },
    { label: 'Total Stores', value: analytics?.total_stores, icon: <HiOutlineOfficeBuilding />, color: 'amber' },
    { label: 'Total Bikes', value: analytics?.total_bikes, icon: <HiOutlineTruck />, color: 'green' },
    { label: 'Available Bikes', value: analytics?.available_bikes, icon: <HiOutlineCheckCircle />, color: 'green' },
    { label: 'Rented Bikes', value: analytics?.rented_bikes, icon: <HiOutlineClock />, color: 'amber' },
    { label: 'Total Deposit', value: `₹${(analytics?.total_deposit || 0).toLocaleString('en-IN')}`, icon: <HiOutlineCurrencyRupee />, color: 'green' },
    { label: 'Total Revenue', value: `₹${(analytics?.total_rental_revenue || 0).toLocaleString('en-IN')}`, icon: <HiOutlineChartBar />, color: 'purple' },
    { label: 'Active Rentals', value: analytics?.active_rentals, icon: <HiOutlineClock />, color: 'blue' },
  ];

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-xl)' }}>
        Analytics Dashboard
      </h2>

      <div className="card-grid" style={{ marginBottom: 'var(--space-2xl)' }}>
        {stats.map((stat, i) => (
          <div className="stat-card" key={i}>
            <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
            <div className="stat-info">
              <h3>{stat.value ?? 0}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-xl)' }}>
        {/* Store Revenue */}
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-lg)' }}>Store-wise Revenue</h3>
          {storeRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={storeRevenue} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorStore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="var(--primary-light)" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="store_name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} angle={-15} textAnchor="end" height={40} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} width={60} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(56, 142, 60, 0.05)' }} />
                <Bar dataKey="revenue" fill="url(#colorStore)" radius={[6, 6, 0, 0]} maxBarSize={50} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No revenue data yet</p>
          )}
        </div>

        {/* Monthly Revenue */}
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-lg)' }}>Monthly Revenue Trend</h3>
          {monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorMonth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorMonth)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No revenue data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
