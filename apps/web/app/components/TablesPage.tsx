"use client";
import React, { useState } from 'react';
import { useCafeStore, API_URL } from '../store';
import { Calendar, CheckSquare, XSquare, Clock, Plus, X } from 'lucide-react';

interface TablesProps {
  tables: any[];
  onUpdate: () => void;
}

const STATUS_COLOR: Record<string, string> = {
  AVAILABLE: '#10b981', OCCUPIED: '#ef4444', RESERVED: '#f59e0b', CLEANING: '#3b82f6'
};
const STATUS_BG: Record<string, string> = {
  AVAILABLE: 'rgba(16,185,129,0.12)', OCCUPIED: 'rgba(239,68,68,0.12)',
  RESERVED: 'rgba(245,158,11,0.12)', CLEANING: 'rgba(59,130,246,0.12)'
};

export default function TablesPage({ tables, onUpdate }: TablesProps) {
  const { token, selectedBranchId } = useCafeStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [reservation, setReservation] = useState({ name: '', phone: '', dateTime: '', partySize: 2 });

  const updateTableStatus = async (tableId: string, status: string) => {
    try {
      await fetch(`${API_URL}/pos/tables/${tableId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      onUpdate();
    } catch { }
  };

  const createReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranchId || !selectedTable) return;
    try {
      await fetch(`${API_URL}/pos/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          branchId: selectedBranchId, tableId: selectedTable.id,
          customerName: reservation.name, customerPhone: reservation.phone,
          dateTime: reservation.dateTime, partySize: reservation.partySize
        })
      });
      setShowModal(false);
      setReservation({ name: '', phone: '', dateTime: '', partySize: 2 });
      onUpdate();
    } catch { }
  };

  const counts = {
    available: tables.filter(t => t.status === 'AVAILABLE').length,
    occupied: tables.filter(t => t.status === 'OCCUPIED').length,
    reserved: tables.filter(t => t.status === 'RESERVED').length,
    cleaning: tables.filter(t => t.status === 'CLEANING').length,
  };

  return (
    <div className="animate-fade-in">
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {Object.entries(counts).map(([status, count]) => (
          <div key={status} style={{
            background: STATUS_BG[status.toUpperCase()],
            border: `1px solid ${STATUS_COLOR[status.toUpperCase()]}30`,
            borderRadius: 12, padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: 12
          }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: STATUS_COLOR[status.toUpperCase()] }}>{count}</div>
            <div style={{ fontSize: '0.8rem', color: STATUS_COLOR[status.toUpperCase()], textTransform: 'capitalize' }}>{status}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => { setSelectedTable(tables[0]); setShowModal(true); }}>
          <Plus size={16} /> New Reservation
        </button>
      </div>

      {/* Table Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {tables.map(table => (
          <div key={table.id} className="card" style={{ borderColor: STATUS_COLOR[table.status] + '40', overflow: 'hidden' }}>
            <div style={{ height: 4, background: STATUS_COLOR[table.status] }} />
            <div style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{table.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Capacity: {table.capacity}</div>
                </div>
                <span style={{
                  background: STATUS_BG[table.status], color: STATUS_COLOR[table.status],
                  padding: '3px 8px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600
                }}>
                  {table.status}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {table.status !== 'AVAILABLE' && (
                  <button className="btn btn-success btn-sm" onClick={() => updateTableStatus(table.id, 'AVAILABLE')}>
                    <CheckSquare size={12} /> Free
                  </button>
                )}
                {table.status === 'AVAILABLE' && (
                  <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                    onClick={() => updateTableStatus(table.id, 'OCCUPIED')}>
                    <XSquare size={12} /> Occupy
                  </button>
                )}
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setSelectedTable(table); setShowModal(true); }}
                >
                  <Calendar size={12} /> Reserve
                </button>
              </div>
            </div>
          </div>
        ))}
        {tables.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No tables configured</div>
        )}
      </div>

      {/* Reservation Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700 }}>New Reservation</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={createReservation} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Table</label>
                <select className="input" value={selectedTable?.id || ''} onChange={e => setSelectedTable(tables.find(t => t.id === e.target.value))}>
                  {tables.filter(t => t.status === 'AVAILABLE').map(t => (
                    <option key={t.id} value={t.id}>{t.name} (cap: {t.capacity})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Customer Name</label>
                <input className="input" required placeholder="Guest name" value={reservation.name} onChange={e => setReservation(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Phone</label>
                <input className="input" placeholder="+91..." value={reservation.phone} onChange={e => setReservation(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Date & Time</label>
                  <input type="datetime-local" className="input" required value={reservation.dateTime} onChange={e => setReservation(p => ({ ...p, dateTime: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Party Size</label>
                  <input type="number" min={1} max={20} className="input" value={reservation.partySize} onChange={e => setReservation(p => ({ ...p, partySize: parseInt(e.target.value) }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Calendar size={14} /> Create Reservation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
