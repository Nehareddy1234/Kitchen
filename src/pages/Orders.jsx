import React from 'react';
import { ChefHat, CheckCircle, Clock, Printer, Edit, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Orders.css';

const statusConfig = {
  Preparing: { bg: 'rgba(253,203,110,0.2)', color: '#e17055', icon: <Clock size={14} /> },
  Ready:     { bg: 'rgba(0,184,148,0.15)',  color: '#00b894', icon: <CheckCircle size={14} /> },
};

export default function Orders() {
  const { activeOrders, markOrderReady, closeOrder, refreshData } = useApp();
  const navigate = useNavigate();

  return (
    <div className="orders-page">
      <header className="orders-header">
        <div>
          <h1>Active Orders</h1>
          <p className="text-muted">{activeOrders.length} order{activeOrders.length !== 1 ? 's' : ''} currently in progress</p>
        </div>
        <button className="btn btn-icon" onClick={refreshData} title="Refresh orders">
          <RefreshCw size={20} />
        </button>
      </header>

      {activeOrders.length === 0 ? (
        <div className="orders-empty">
          <ChefHat size={56} color="var(--border-color)" />
          <h3>No active orders</h3>
          <p className="text-muted">All orders have been served. Well done!</p>
        </div>
      ) : (
        <div className="orders-grid">
          {activeOrders.map(order => {
            const sc = statusConfig[order.status] || { bg: '#eee', color: '#666', icon: null };
            return (
              <div key={order.id} className="order-card card">
                <div className="order-card-header">
                  <div>
                    <span className="order-id">#{order.orderNumber || order.id}</span>
                    <span className="order-table">{order.table}</span>
                  </div>
                  <span className="order-status-badge" style={{ background: sc.bg, color: sc.color }}>
                    {sc.icon} {order.status}
                  </span>
                </div>

                <div className="order-items-list">
                  {(order.itemList || []).map((item, i) => (
                    <div key={i} className="order-item-row">{item}</div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <span className="order-time text-muted">{order.time}</span>
                  <span className="order-total">₹{order.total}</span>
                </div>

                <div className="order-actions">
                  <button className="btn btn-outline" onClick={() => navigate(`/pos?edit=${encodeURIComponent(order.id)}`)}>
                    <Edit size={15} /> Edit
                  </button>

                  {order.status === 'Preparing' && (
                    <button className="btn btn-outline" onClick={() => markOrderReady(order.id)}>
                      <CheckCircle size={15} /> Mark Ready
                    </button>
                  )}
                  {order.status === 'Ready' && (
                    <button className="btn btn-primary" onClick={() => closeOrder(order.id)}>
                      <Printer size={15} /> Bill &amp; Close
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
