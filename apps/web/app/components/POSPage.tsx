"use client";
import React, { useState } from 'react';
import { useCafeStore, API_URL } from '../store';
import { Plus, Minus, Trash2, ShoppingCart, CreditCard, User, Table, Tag, CheckCircle } from 'lucide-react';

interface POSProps {
  menuItems: any[];
  tables: any[];
  customers: any[];
  onOrderPlaced: () => void;
}

const categories = ['All', 'Coffee', 'Tea', 'Food', 'Pastry', 'Beverage', 'Snack', 'Dessert'];

const ORDER_TYPES = ['DINE_IN', 'TAKEAWAY', 'DELIVERY'];
const PAYMENT_METHODS = ['UPI', 'CASH', 'CARD', 'WALLET', 'SPLIT'];

export default function POSPage({ menuItems, tables, customers, onOrderPlaced }: POSProps) {
  const { token, cart, addToCart, removeFromCart, updateCartQty, clearCart,
    selectedTableId, selectedTableName, setSelectedTable,
    selectedCustomerId, selectedCustomerName, setSelectedCustomer,
    selectedBranchId, discount, setDiscount } = useCafeStore();

  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [orderType, setOrderType] = useState('DINE_IN');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [placing, setPlacing] = useState(false);
  const [notification, setNotification] = useState('');

  const filtered = menuItems.filter(m => {
    const matchCat = category === 'All' || m.category === category;
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmt = Math.round(subtotal * (discount / 100));
  const total = subtotal - discountAmt;

  const handleCheckout = async () => {
    if (cart.length === 0 || !selectedBranchId) return;
    setPlacing(true);
    try {
      const res = await fetch(`${API_URL}/pos/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          branchId: selectedBranchId,
          type: orderType,
          paymentMethod,
          tableId: selectedTableId,
          customerId: selectedCustomerId,
          discount,
          items: cart.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
          splitPayments: paymentMethod === 'SPLIT' ? [
            { method: 'UPI', amount: Math.floor(total * 0.6) },
            { method: 'CASH', amount: Math.ceil(total * 0.4) }
          ] : undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        clearCart();
        onOrderPlaced();
        setNotification(data.lowStockAlerts?.length > 0 ? `⚠️ Low stock: ${data.lowStockAlerts.join(', ')}` : '✅ Order placed successfully!');
        setTimeout(() => setNotification(''), 5000);
      } else {
        setNotification(`❌ ${data.message}`);
        setTimeout(() => setNotification(''), 4000);
      }
    } catch {
      setNotification('❌ Connection error');
      setTimeout(() => setNotification(''), 4000);
    }
    setPlacing(false);
  };

  const availableCategories = ['All', ...Array.from(new Set(menuItems.map(m => m.category).filter(Boolean)))];

  return (
    <div className="animate-fade-in">
      {notification && (
        <div className={`alert ${notification.startsWith('✅') ? 'alert-success' : notification.startsWith('⚠️') ? 'alert-warning' : 'alert-danger'}`}
          style={{ marginBottom: 16 }}>
          {notification}
        </div>
      )}
      <div className="pos-layout">
        {/* Left: Menu */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
          {/* Search & Category filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
            <input
              className="input"
              placeholder="Search menu items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {availableCategories.map(cat => (
                <button
                  key={cat}
                  className={`tag${category === cat ? ' active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Menu grid */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            <div className="menu-grid">
              {filtered.map(item => (
                <div
                  key={item.id}
                  className={`menu-item-card${item.isAvailable === false ? ' out-of-stock' : ''}`}
                  onClick={() => {
                    if (item.isAvailable !== false) {
                      addToCart({ menuItemId: item.id, name: item.name, price: item.price, quantity: 1 });
                    }
                  }}
                >
                  <div style={{
                    width: '100%', height: 70,
                    background: `linear-gradient(135deg, ${item.category === 'Coffee' ? '#7c3aed22, #06b6d422' : '#06b6d422, #10b98122'})`,
                    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem', marginBottom: 4
                  }}>
                    {item.category === 'Coffee' ? '☕' :
                      item.category === 'Tea' ? '🍵' :
                        item.category === 'Food' ? '🍽️' :
                          item.category === 'Pastry' ? '🥐' :
                            item.category === 'Beverage' ? '🥤' :
                              item.category === 'Snack' ? '🍪' :
                                item.category === 'Dessert' ? '🍰' : '🍴'}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{item.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.category}</div>
                  <div style={{ fontWeight: 700, color: '#a78bfa', fontSize: '0.95rem' }}>₹{item.price}</div>
                  {item.isAvailable === false && (
                    <div style={{ fontSize: '0.65rem', color: '#f87171', fontWeight: 600 }}>OUT OF STOCK</div>
                  )}
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  No items found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Cart */}
        <div className="cart-panel">
          {/* Cart Header */}
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingCart size={18} color="#a78bfa" />
              <span style={{ fontWeight: 600 }}>Order</span>
            </div>
            {cart.length > 0 && (
              <button className="btn btn-danger btn-sm" onClick={clearCart} style={{ padding: '4px 10px', fontSize: '0.72rem' }}>
                Clear
              </button>
            )}
          </div>

          {/* Table & Customer */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <select className="input" style={{ fontSize: '0.78rem', padding: '7px 10px' }}
                value={selectedTableId || ''}
                onChange={e => {
                  const t = tables.find(t => t.id === e.target.value);
                  setSelectedTable(t?.id || null, t?.name || null);
                }}>
                <option value="">No Table</option>
                {tables.map(t => (
                  <option key={t.id} value={t.id} disabled={t.status === 'OCCUPIED'}>
                    {t.name} {t.status === 'OCCUPIED' ? '(Occ.)' : ''}
                  </option>
                ))}
              </select>

              <select className="input" style={{ fontSize: '0.78rem', padding: '7px 10px' }}
                value={selectedCustomerId || ''}
                onChange={e => {
                  const c = customers.find(c => c.id === e.target.value);
                  setSelectedCustomer(c?.id || null, c?.name || null);
                }}>
                <option value="">Walk-in</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <select className="input" style={{ fontSize: '0.78rem', padding: '7px 10px' }}
                value={orderType} onChange={e => setOrderType(e.target.value)}>
                {ORDER_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
              <select className="input" style={{ fontSize: '0.78rem', padding: '7px 10px' }}
                value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Cart Items */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 14px' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <ShoppingCart size={32} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
                <p style={{ fontSize: '0.85rem' }}>Cart is empty</p>
                <p style={{ fontSize: '0.75rem' }}>Tap a menu item to add</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.menuItemId} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
                  borderBottom: '1px solid var(--border-default)'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{item.price} ea.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => updateCartQty(item.menuItemId, item.quantity - 1)}
                      style={{ width: 24, height: 24, border: '1px solid var(--border-default)', borderRadius: 6, background: 'var(--bg-elevated)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}
                    ><Minus size={12} /></button>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: 18, textAlign: 'center' }}>{item.quantity}</span>
                    <button
                      onClick={() => updateCartQty(item.menuItemId, item.quantity + 1)}
                      style={{ width: 24, height: 24, border: '1px solid var(--border-default)', borderRadius: 6, background: 'var(--bg-elevated)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}
                    ><Plus size={12} /></button>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a78bfa', minWidth: 55, textAlign: 'right' }}>
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </div>
                  <button onClick={() => removeFromCart(item.menuItemId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', padding: 4 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Discount */}
          {cart.length > 0 && (
            <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag size={14} color="var(--text-muted)" />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flex: 1 }}>Discount %</span>
                <input
                  type="number" min={0} max={100} step={5}
                  value={discount} onChange={e => setDiscount(Number(e.target.value))}
                  className="input"
                  style={{ width: 70, padding: '5px 8px', fontSize: '0.8rem', textAlign: 'center' }}
                />
              </div>
            </div>
          )}

          {/* Total & Checkout */}
          <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border-default)', background: 'var(--bg-elevated)' }}>
            {discountAmt > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                <span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span>
              </div>
            )}
            {discountAmt > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#10b981', marginBottom: 6 }}>
                <span>Discount ({discount}%)</span><span>-₹{discountAmt.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700, marginBottom: 14 }}>
              <span>Total</span>
              <span style={{ color: '#a78bfa' }}>₹{total.toLocaleString()}</span>
            </div>
            <button
              id="checkout-btn"
              className="btn btn-primary w-full"
              style={{ justifyContent: 'center', padding: 12 }}
              onClick={handleCheckout}
              disabled={cart.length === 0 || placing}
            >
              {placing ? (
                <span className="animate-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
              ) : (
                <><CreditCard size={16} /> Place Order</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
