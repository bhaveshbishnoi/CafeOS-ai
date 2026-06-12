"use client";
import React, { useState } from 'react';
import { AlertTriangle, Package, TrendingDown, ArrowUpRight } from 'lucide-react';

interface InventoryProps {
  ingredients: any[];
  suppliers: any[];
  costings: any[];
}

const UNIT_ICONS: Record<string, string> = { kg: '⚖️', g: '⚖️', l: '🧴', ml: '🧴', pcs: '📦', units: '📦' };

export default function InventoryPage({ ingredients, suppliers, costings }: InventoryProps) {
  const [tab, setTab] = useState<'stock' | 'suppliers'>('stock');
  const [search, setSearch] = useState('');

  const filtered = ingredients.filter(i =>
    !search || i.name.toLowerCase().includes(search.toLowerCase())
  );

  const lowStock = ingredients.filter(i => i.stockLevel <= i.reorderLevel);
  const totalValue = ingredients.reduce((s, i) => s + (i.stockLevel * (i.costPerUnit || 0)), 0);

  return (
    <div className="animate-fade-in">
      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card emerald">
          <div className="stat-icon emerald"><Package size={20} /></div>
          <div className="stat-value">{ingredients.length}</div>
          <div className="stat-label">Total Ingredients</div>
        </div>
        <div className="stat-card rose">
          <div className="stat-icon rose"><AlertTriangle size={20} /></div>
          <div className="stat-value">{lowStock.length}</div>
          <div className="stat-label">Low Stock Alerts</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><TrendingDown size={20} /></div>
          <div className="stat-value">₹{Math.round(totalValue).toLocaleString()}</div>
          <div className="stat-label">Inventory Value</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon purple"><ArrowUpRight size={20} /></div>
          <div className="stat-value">{suppliers.length}</div>
          <div className="stat-label">Active Suppliers</div>
        </div>
      </div>

      {/* Low stock alerts */}
      {lowStock.length > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: 20 }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span>
            <strong>{lowStock.length} items</strong> are below reorder level:{' '}
            {lowStock.slice(0, 4).map(i => i.name).join(', ')}
            {lowStock.length > 4 && ` +${lowStock.length - 4} more`}
          </span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['stock', 'suppliers'] as const).map(t => (
          <button key={t} className={`tag${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t === 'stock' ? '📦 Stock Levels' : '🏭 Suppliers'}
          </button>
        ))}
      </div>

      {tab === 'stock' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Ingredient Stock</span>
            <input
              className="input"
              style={{ maxWidth: 240 }}
              placeholder="Search ingredients..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Reorder At</th>
                  <th>Cost / Unit</th>
                  <th>Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const pct = item.reorderLevel > 0 ? Math.min(100, (item.stockLevel / (item.reorderLevel * 3)) * 100) : 100;
                  const isLow = item.stockLevel <= item.reorderLevel;
                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>{UNIT_ICONS[item.unit] || '📦'}</span>
                          <span style={{ fontWeight: 600 }}>{item.name}</span>
                        </div>
                      </td>
                      <td><span className="badge badge-slate">{item.category || 'General'}</span></td>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                            {item.stockLevel} {item.unit}
                          </div>
                          <div className="progress-bar" style={{ width: 80, marginTop: 4 }}>
                            <div className="progress-fill" style={{
                              width: `${pct}%`,
                              background: isLow ? '#ef4444' : pct < 40 ? '#f59e0b' : '#10b981'
                            }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{item.reorderLevel} {item.unit}</td>
                      <td>₹{item.costPerUnit}</td>
                      <td style={{ fontWeight: 600 }}>₹{Math.round(item.stockLevel * (item.costPerUnit || 0)).toLocaleString()}</td>
                      <td>
                        {isLow ? (
                          <span className="badge badge-rose">⚠️ Low</span>
                        ) : (
                          <span className="badge badge-emerald">✓ OK</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>No ingredients found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'suppliers' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Supplier Directory</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Contact</th>
                <th>Items Supplied</th>
                <th>Lead Time</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.contact || 'N/A'}</td>
                  <td>
                    <span className="badge badge-purple">{s._count?.ingredients || 0} items</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{s.leadTimeDays || 2} days</td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>No suppliers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
