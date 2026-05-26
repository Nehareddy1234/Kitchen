import React, { useState } from 'react';
import { ShoppingCart, Search, Minus, Plus, Trash2, Banknote, CreditCard, SmartphoneNfc, CheckCircle2, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function CustomerMenu() {
  const { menuItems, placeOrder } = useApp();
  const { currentUser, logout } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('Dine-In');
  const [tableNo, setTableNo] = useState(currentUser?.displayName || 'Table');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  const categories = ['All', ...new Set(menuItems.filter(i => i.available !== false).map(i => i.category))];

  const filteredItems = menuItems.filter(item => {
    if (item.available === false) return false;
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev =>
      prev.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c)
    );
  };

  const removeItem = (id) => setCart(prev => prev.filter(c => c.id !== id));

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    const now = new Date();

    // Format cart items for placeOrder function
    const cartForOrder = cart.map(c => ({
      id: c.id,
      name: c.name,
      price: c.price,
      category: c.category || 'Other',
      quantity: c.qty,
      addOns: { Roti: 0, Curry: 0 },
    }));

    // For Dine-In try to parse table number, else null for Takeaway
    const tableIdMatch = orderType === 'Dine-In' ? tableNo.match(/\d+/) : null;
    const tableId = tableIdMatch ? parseInt(tableIdMatch[0], 10) : null;

    placeOrder(cartForOrder, tableId);
    const genId = '#ORD-CUST-' + Date.now().toString().slice(-4);
    setOrderId(genId);
    setCart([]);
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ background: '#fff', borderRadius: '24px', padding: '3rem 2rem', textAlign: 'center', maxWidth: '400px', width: '100%', boxShadow: '0 16px 48px rgba(0,0,0,0.1)' }}>
          <div style={{ width: '80px', height: '80px', background: '#eafaf1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <CheckCircle2 size={44} color="#28a745" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1a2e', margin: '0 0 0.5rem 0' }}>Order Placed!</h2>
          <p style={{ color: '#6c757d', marginBottom: '1rem' }}>Your order <strong>{orderId}</strong> has been sent to the kitchen.</p>
          <p style={{ color: '#adb5bd', fontSize: '0.85rem', marginBottom: '2rem' }}>A waiter will serve you shortly. 🍽️</p>
          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 700, borderRadius: '12px', marginBottom: '0.5rem' }}
            onClick={() => setOrderPlaced(false)}
          >
            Order More
          </button>
          <button
            className="btn btn-outline"
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 700, borderRadius: '12px', color: '#dc3545', borderColor: '#dc3545' }}
            onClick={logout}
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <header style={{
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        padding: '1rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🍽️</span>
          <div>
            <h1 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Neha's Kitchen</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', margin: 0 }}>Welcome, {currentUser?.displayName}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)', borderRadius: '12px',
            padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
            color: '#fff', cursor: 'pointer',
          }}>
            <ShoppingCart size={20} />
            <span style={{ fontWeight: 700 }}>{cartCount} items</span>
            {cartCount > 0 && (
              <span style={{
                background: '#e84118', color: '#fff', borderRadius: '50%',
                width: '20px', height: '20px', fontSize: '0.72rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
              }}>{cartCount}</span>
            )}
          </div>

          <button
            onClick={logout}
            style={{
              background: 'rgba(232,65,24,0.15)',
              border: '1px solid rgba(232,65,24,0.4)',
              borderRadius: '12px',
              padding: '0.5rem 1.05rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#ff4d4d',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.85rem',
              transition: 'background 0.2s',
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, gap: '0', maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '1.5rem', gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* Menu Section */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Search */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #dee2e6', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Search size={18} color="#adb5bd" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', flex: 1, fontSize: '0.95rem' }}
            />
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  whiteSpace: 'nowrap', padding: '0.5rem 1.1rem',
                  borderRadius: '20px', border: 'none', cursor: 'pointer',
                  background: selectedCategory === cat ? '#e84118' : '#fff',
                  color: selectedCategory === cat ? '#fff' : '#6c757d',
                  fontWeight: selectedCategory === cat ? 700 : 500,
                  fontSize: '0.85rem',
                  boxShadow: selectedCategory === cat ? '0 4px 12px rgba(232,65,24,0.3)' : '0 1px 4px rgba(0,0,0,0.06)',
                  transition: 'all 0.18s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
            {filteredItems.map(item => (
              <div
                key={item.id}
                style={{
                  background: '#fff', borderRadius: '16px', overflow: 'hidden',
                  border: '1px solid #f1f3f5',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex', flexDirection: 'column',
                }}
              >
                <div style={{
                  height: '130px', background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2.5rem',
                }}>
                  🍛
                </div>
                <div style={{ padding: '0.85rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#1a1a2e', lineHeight: 1.3 }}>{item.name}</h3>
                  <span style={{ fontSize: '0.75rem', color: '#adb5bd', marginBottom: 'auto' }}>{item.category}</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                    <strong style={{ color: '#e84118', fontSize: '1rem' }}>₹{item.price}</strong>
                    <button
                      onClick={() => addToCart(item)}
                      style={{
                        background: '#e84118', color: '#fff', border: 'none',
                        borderRadius: '8px', padding: '0.35rem 0.75rem',
                        fontWeight: 700, fontSize: '1.2rem', cursor: 'pointer',
                        lineHeight: 1,
                      }}
                    >+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Panel */}
        <div style={{ width: '320px', flexShrink: 0, position: 'sticky', top: '90px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f3f5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingCart size={20} color="#e84118" />
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Your Order</h2>
            </div>

            {/* Order Type */}
            <div style={{ padding: '1rem', borderBottom: '1px solid #f1f3f5' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {['Dine-In', 'Takeaway'].map(type => (
                  <button
                    key={type}
                    onClick={() => setOrderType(type)}
                    style={{
                      flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      background: orderType === type ? '#1a1a2e' : '#f8f9fa',
                      color: orderType === type ? '#fff' : '#6c757d',
                      fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.15s',
                    }}
                  >{type}</button>
                ))}
              </div>
              {orderType === 'Dine-In' && (
                <input
                  type="text"
                  value={tableNo}
                  onChange={e => setTableNo(e.target.value)}
                  placeholder="Table number / name"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #dee2e6', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                />
              )}
            </div>

            {/* Cart Items */}
            <div style={{ maxHeight: '280px', overflowY: 'auto', padding: '0.75rem 1rem' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: '#adb5bd' }}>
                  <ShoppingCart size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '0.85rem' }}>Tap + to add items</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>{item.name}</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#e84118', fontWeight: 600 }}>₹{item.price * item.qty}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button onClick={() => updateQty(item.id, -1)} style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid #dee2e6', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}><Minus size={12} /></button>
                        <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center', fontSize: '0.9rem' }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid #dee2e6', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}><Plus size={12} /></button>
                      </div>
                      <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', padding: '0.25rem' }}><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment + Total + CTA */}
            <div style={{ padding: '1rem', borderTop: '1px solid #f1f3f5', background: '#fafafa' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#adb5bd', marginBottom: '0.5rem' }}>PAYMENT</p>
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
                {[
                  { id: 'Cash', icon: <Banknote size={14} /> },
                  { id: 'UPI', icon: <SmartphoneNfc size={14} /> },
                  { id: 'Card', icon: <CreditCard size={14} /> },
                ].map(({ id, icon }) => (
                  <button
                    key={id}
                    onClick={() => setPaymentMethod(id)}
                    style={{
                      flex: 1, padding: '0.4rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      background: paymentMethod === id ? '#1a1a2e' : '#fff',
                      color: paymentMethod === id ? '#fff' : '#6c757d',
                      fontWeight: 600, fontSize: '0.75rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.15s',
                    }}
                  >
                    {icon} {id}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 600 }}>Total</span>
                <strong style={{ fontSize: '1.2rem', color: '#1a1a2e' }}>₹{cartTotal.toLocaleString()}</strong>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={cart.length === 0}
                style={{
                  width: '100%', padding: '0.9rem', borderRadius: '12px', border: 'none',
                  background: cart.length === 0 ? '#dee2e6' : 'linear-gradient(135deg, #e84118, #c0392b)',
                  color: '#fff', fontWeight: 700, fontSize: '1rem',
                  cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                  boxShadow: cart.length > 0 ? '0 4px 16px rgba(232,65,24,0.3)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
