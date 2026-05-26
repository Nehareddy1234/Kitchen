import React, { useState } from 'react';
import { Search, ShoppingCart, Trash2, CreditCard, Banknote, SmartphoneNfc } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Colorful category palette
const CATEGORY_COLORS = [
  { bg: '#fff3cd', text: '#856404', border: '#ffc107' },
  { bg: '#d1ecf1', text: '#0c5460', border: '#17a2b8' },
  { bg: '#d4edda', text: '#155724', border: '#28a745' },
  { bg: '#f8d7da', text: '#721c24', border: '#dc3545' },
  { bg: '#e2d9f3', text: '#432874', border: '#6f42c1' },
  { bg: '#fde8d8', text: '#7d3c10', border: '#fd7e14' },
  { bg: '#d6e4f7', text: '#0c2d6b', border: '#3b82f6' },
];

function getCatColor(index) {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

function CategoryPill({ cat, idx, isActive, onClick }) {
  const color = getCatColor(idx);
  const shadow = isActive ? ('0 2px 8px ' + color.border + '88') : 'none';
  return (
    <button
      onClick={onClick}
      style={{
        whiteSpace: 'nowrap',
        padding: '0.45rem 1.1rem',
        borderRadius: '20px',
        border: '2px solid ' + (isActive ? color.border : 'transparent'),
        background: isActive ? color.bg : '#f1f3f5',
        color: isActive ? color.text : '#6c757d',
        fontWeight: isActive ? 700 : 500,
        fontSize: '0.85rem',
        cursor: 'pointer',
        transition: 'all 0.18s',
        boxShadow: shadow,
        transform: isActive ? 'translateY(-2px)' : 'none',
      }}
    >
      {cat}
    </button>
  );
}

function ProductCard({ item, onAdd }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onAdd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        background: '#fff',
        transition: 'transform 0.15s, box-shadow 0.15s',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? '0 8px 20px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      <img src={item.image} alt={item.name} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
      <div style={{ padding: '0.75rem' }}>
        <h3 style={{ fontSize: '0.9rem', margin: '0 0 0.35rem 0', fontWeight: 600, lineHeight: 1.3 }}>{item.name}</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>₹{item.price}</span>
          <span style={{
            fontSize: '0.7rem',
            color: item.stock < 10 ? '#dc3545' : 'var(--text-muted)',
            background: item.stock < 10 ? '#fde8e8' : 'var(--bg-color)',
            padding: '0.15rem 0.4rem',
            borderRadius: '6px',
            fontWeight: 600,
          }}>
            Qty: {item.stock}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function GroceryPOS() {
  const { storeInventory, checkoutStoreOrder } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isProcessing, setIsProcessing] = useState(false);

  const categories = ['All', ...new Set(storeInventory.map(i => i.category))];

  const filteredInventory = storeInventory.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.barcode.includes(searchQuery);
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.stock > 0;
  });

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateCartQty = (id, delta) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id === id) {
          const product = storeInventory.find(p => p.id === id);
          const newQty = item.quantity + delta;
          if (newQty > product.stock || newQty < 1) return item;
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      checkoutStoreOrder(cart, paymentMethod);
      setCart([]);
      setIsProcessing(false);
      alert('Transaction Successful!');
    }, 600);
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>

      {/* Search Bar */}
      <div style={{ background: '#fff', padding: '0.75rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Search size={20} color="#999" />
        <input
          type="text"
          placeholder="Scan barcode or search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem', background: 'transparent' }}
          autoFocus
        />
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
        {categories.map((cat, idx) => (
          <CategoryPill
            key={cat}
            cat={cat}
            idx={idx}
            isActive={selectedCategory === cat}
            onClick={() => setSelectedCategory(cat)}
          />
        ))}
      </div>

      {/* Product Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
        {filteredInventory.map(item => (
          <ProductCard key={item.id} item={item} onAdd={() => addToCart(item)} />
        ))}
        {filteredInventory.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No products available.
          </div>
        )}
      </div>

      {/* Cart Section */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
          <ShoppingCart size={20} />
          Current Checkout
          {cart.length > 0 && (
            <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              {cart.length}
            </span>
          )}
        </h2>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
            <ShoppingCart size={36} style={{ opacity: 0.2, margin: '0 auto 0.75rem auto' }} />
            <p>Tap products above to add them here.</p>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cart.map(item => (
              <li key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>{item.name}</h4>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>₹{item.price}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-color)', borderRadius: '20px', padding: '0.25rem 0.5rem' }}>
                  <button onClick={() => updateCartQty(item.id, -1)} style={{ width: '28px', height: '28px', padding: 0, borderRadius: '50%', background: '#fff', border: '1px solid var(--border-color)', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                  <span style={{ fontWeight: 600, width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                  <button onClick={() => updateCartQty(item.id, 1)} style={{ width: '28px', height: '28px', padding: 0, borderRadius: '50%', background: '#fff', border: '1px solid var(--border-color)', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
                <button onClick={() => removeFromCart(item.id)} style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: '#dc3545', cursor: 'pointer' }}>
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Payment + Checkout */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Payment Method</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <button className={'btn ' + (paymentMethod === 'Cash' ? 'btn-primary' : 'btn-outline')} onClick={() => setPaymentMethod('Cash')} style={{ flex: 1, padding: '0.5rem', display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
              <Banknote size={16} /> Cash
            </button>
            <button className={'btn ' + (paymentMethod === 'UPI' ? 'btn-primary' : 'btn-outline')} onClick={() => setPaymentMethod('UPI')} style={{ flex: 1, padding: '0.5rem', display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
              <SmartphoneNfc size={16} /> UPI
            </button>
            <button className={'btn ' + (paymentMethod === 'Card' ? 'btn-primary' : 'btn-outline')} onClick={() => setPaymentMethod('Card')} style={{ flex: 1, padding: '0.5rem', display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
              <CreditCard size={16} /> Card
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Total</span>
            <strong style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>₹{cartTotal.toLocaleString()}</strong>
          </div>
          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 600, borderRadius: '10px', boxShadow: '0 4px 12px rgba(232,65,24,0.25)' }}
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Pay ₹' + cartTotal.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
}
