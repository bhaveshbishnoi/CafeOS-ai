"use client";
import React, { useState } from 'react';
import { useCafeStore, API_URL } from '../store';
import { Clock, CheckCircle2, Hourglass, Play, ChevronRight, XCircle, AlertCircle } from 'lucide-react';

const STATUS_ORDER = ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending', PREPARING: 'Preparing', READY: 'Ready', COMPLETED: 'Completed', CANCELLED: 'Cancelled'
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b', PREPARING: '#3b82f6', READY: '#10b981', COMPLETED: '#64748b', CANCELLED: '#ef4444'
};
const STATUS_BG: Record<string, string> = {
  PENDING: 'rgba(245,158,11,0.1)', PREPARING: 'rgba(59,130,246,0.1)',
  READY: 'rgba(16,185,129,0.1)', COMPLETED: 'rgba(100,116,139,0.08)', CANCELLED: 'rgba(239,68,68,0.1)'
};
const STATUS_ICONS: Record<string, React.ReactNode> = {
  PENDING: <Hourglass size={14} />, PREPARING: <Play size={14} />,
  READY: <CheckCircle2 size={14} />, COMPLETED: <CheckCircle2 size={14} />, CANCELLED: <XCircle size={14} />
};

interface KDSProps {
  orders: any[];
  onUpdate: () => void;
}

export default function KDSPage({ orders, onUpdate }: KDSProps) {
  const { token } = useCafeStore();
  const [filter, setFilter] = useState<string>('PENDING');

  const activeOrders = orders.filter(o => filter === 'ALL' ? true : o.status === filter);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await fetch(`${API_URL}/pos/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      onUpdate();
    } catch { /* ignore */ }
  };

  const getNextStatus = (current: string) => {
    const idx = STATUS_ORDER.indexOf(current);
    return idx >= 0 && idx < STATUS_ORDER.length - 2 ? STATUS_ORDER[idx + 1] : null;
  };

  const timeSince = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    return diff < 1 ? 'just now' : `${diff}m ago`;
  };

  const pending = orders.filter(o => o.status === 'PENDING').length;
  const preparing = orders.filter(o => o.status === 'PREPARING').length;
  const ready = orders.filter(o => o.status === 'READY').length;

  return (
    <div className="animate-fade-in">
      {/* Summary Strip */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Pending', count: pending, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Preparing', count: preparing, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
          { label: 'Ready', count: ready, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg, border: `1px solid ${s.color}30`,
            borderRadius: 12, padding: '14px 20px', flex: 1, display: 'flex', alignItems: 'center', gap: 12
          }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: '0.85rem', color: s.color, opacity: 0.8, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['ALL', ...STATUS_ORDER.slice(0, 4)].map(s => (
          <button
            key={s}
            className={`tag${filter === s ? ' active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'ALL' ? 'All Orders' : STATUS_LABELS[s]}
            {s !== 'ALL' && s !== 'COMPLETED' && (
              <span style={{
                background: STATUS_COLORS[s], color: 'white',
                borderRadius: 999, padding: '0 5px', fontSize: '0.65rem', fontWeight: 700
              }}>
                {orders.filter(o => o.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Order Cards */}
      {activeOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <CheckCircle2 size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p>No {filter !== 'ALL' ? filter.toLowerCase() : ''} orders</p>
        </div>
      ) : (
        <div className="kanban-board">
          {activeOrders.map(order => {
            const nextStatus = getNextStatus(order.status);
            const isUrgent = order.status === 'PENDING' && timeSince(order.createdAt).includes('m') &&
              parseInt(timeSince(order.createdAt)) > 10;
            return (
              <div
                key={order.id}
                className="card"
                style={{
                  borderColor: STATUS_COLORS[order.status] + '30',
                  borderLeft: `3px solid ${STATUS_COLORS[order.status]}`
                }}
              >
                <div style={{ padding: '14px 16px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        #{order.id?.slice(-6).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={10} /> {timeSince(order.createdAt)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span style={{
                        background: STATUS_BG[order.status],
                        color: STATUS_COLORS[order.status],
                        padding: '3px 8px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: 4
                      }}>
                        {STATUS_ICONS[order.status]} {STATUS_LABELS[order.status]}
                      </span>
                      {isUrgent && (
                        <span style={{ color: '#ef4444', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <AlertCircle size={10} /> URGENT
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Meta */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span style={{ background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 6 }}>
                      {order.type?.replace('_', ' ')}
                    </span>
                    {order.table && (
                      <span style={{ background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 6 }}>
                        🪑 {order.table.name}
                      </span>
                    )}
                    <span style={{ background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 6, marginLeft: 'auto', color: '#a78bfa', fontWeight: 600 }}>
                      ₹{order.total?.toLocaleString()}
                    </span>
                  </div>

                  {/* Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                    {(order.items || order.orderItems || []).map((item: any) => (
                      <div key={item.id} style={{
                        display: 'flex', justifyContent: 'space-between',
                        fontSize: '0.8rem', padding: '4px 0', borderBottom: '1px solid var(--border-default)'
                      }}>
                        <span>{item.menuItem?.name || item.name}</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>×{item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action */}
                  {nextStatus && (
                    <button
                      className="btn btn-primary w-full btn-sm"
                      style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '8px' }}
                      onClick={() => handleUpdateStatus(order.id, nextStatus)}
                    >
                      {STATUS_ICONS[nextStatus]}
                      Mark as {STATUS_LABELS[nextStatus]}
                      <ChevronRight size={14} />
                    </button>
                  )}
                  {order.status === 'READY' && (
                    <button
                      className="btn w-full btn-sm"
                      style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '8px', background: 'rgba(16,185,129,0.15)', color: '#34d399', marginTop: 6 }}
                      onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                    >
                      <CheckCircle2 size={14} /> Complete Order
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
