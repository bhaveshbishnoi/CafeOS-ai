"use client";
import React from 'react';
import { useCafeStore, API_URL } from '../store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Users, ShoppingBag } from 'lucide-react';

interface AnalyticsProps {
  stats: any;
  staffMetrics: any[];
  leaderboard: any[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 14px', fontSize: '0.8rem' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
        {payload.map((e: any, i: number) => (
          <p key={i} style={{ color: e.color }}>
            {e.name}: <strong>₹{Number(e.value).toLocaleString()}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage({ stats, staffMetrics, leaderboard }: AnalyticsProps) {
  if (!stats) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--text-muted)' }}>
        Loading analytics...
      </div>
    );
  }

  const salesTrend = stats.salesTrend || [];
  const peakHours = stats.peakHours || [];
  const paymentBreakdown = stats.paymentBreakdown || [];
  const wasteByReason = stats.wasteByReason || [];

  return (
    <div className="animate-fade-in">
      {/* Revenue Overview */}
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card purple">
          <div className="stat-icon purple"><DollarSign size={20} /></div>
          <div className="stat-value">₹{(stats.revenue || 0).toLocaleString()}</div>
          <div className="stat-label">Gross Revenue</div>
        </div>
        <div className="stat-card emerald">
          <div className="stat-icon emerald"><TrendingUp size={20} /></div>
          <div className="stat-value">₹{(stats.netRevenue || stats.revenue * 0.65 || 0).toLocaleString()}</div>
          <div className="stat-label">Net Revenue (est.)</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon cyan"><ShoppingBag size={20} /></div>
          <div className="stat-value">{(stats.orders || 0).toLocaleString()}</div>
          <div className="stat-label">Orders</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><Users size={20} /></div>
          <div className="stat-value">{(stats.customers || 0).toLocaleString()}</div>
          <div className="stat-label">Customers</div>
        </div>
      </div>

      {/* Charts */}
      <div className="two-col" style={{ marginBottom: 24 }}>
        {/* Sales Trend */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📈 Daily Revenue (30 Days)</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={salesTrend} barSize={8}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#7c3aed" radius={[3, 3, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hours */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">⏰ Peak Hours</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={peakHours.length > 0 ? peakHours : Array.from({ length: 12 }, (_, i) => ({ hour: `${i + 8}:00`, orders: 0 }))} barSize={8}>
                <XAxis dataKey="hour" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="orders" fill="#06b6d4" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="two-col">
        {/* Payment Methods */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">💳 Payment Methods</span>
          </div>
          <div className="card-body">
            {paymentBreakdown.length > 0 ? paymentBreakdown.map((pm: any, i: number) => {
              const colors = ['#7c3aed', '#06b6d4', '#f59e0b', '#10b981', '#ef4444'];
              const total = paymentBreakdown.reduce((s: number, p: any) => s + p.count, 0);
              const pct = total > 0 ? Math.round((pm.count / total) * 100) : 0;
              return (
                <div key={pm.method} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 500 }}>
                      {pm.method === 'UPI' ? '📱' : pm.method === 'CASH' ? '💵' : pm.method === 'CARD' ? '💳' : '🔄'} {pm.method}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>{pm.count} orders ({pct}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                  </div>
                </div>
              );
            }) : (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>No payment data</div>
            )}
          </div>
        </div>

        {/* Staff Performance */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">👨‍💼 Staff Performance</span>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Staff</th><th>Orders</th><th>Revenue</th><th>Score</th></tr>
            </thead>
            <tbody>
              {staffMetrics.slice(0, 6).map((s: any) => {
                const score = Math.min(100, Math.round((s.ordersProcessed / 100) * 60 + (s.revenue / 50000) * 40));
                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar" style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', color: 'white', fontSize: '0.65rem' }}>
                          {s.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{s.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.role?.replace(/_/g, ' ')}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{s.ordersProcessed || 0}</td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>₹{(s.revenue || 0).toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ width: 50 }}>
                          <div className="progress-fill" style={{ width: `${score}%`, background: score > 70 ? '#10b981' : score > 40 ? '#f59e0b' : '#ef4444' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{score}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {staffMetrics.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No staff data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
