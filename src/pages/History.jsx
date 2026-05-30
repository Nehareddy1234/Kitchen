import React, { useState } from 'react';
import { Search, Calendar, DollarSign, ShoppingBag, Eye, Printer, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './History.css';

export default function History() {
  const { orderHistory } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dateFilter, setDateFilter] = useState('All');

  const formatDateKey = (value) => {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    const parts = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);

    const year = parts.find(part => part.type === 'year')?.value;
    const month = parts.find(part => part.type === 'month')?.value;
    const day = parts.find(part => part.type === 'day')?.value;
    return year && month && day ? `${year}-${month}-${day}` : null;
  };

  const getOrderDateKey = (order) => {
    const timestampKey = formatDateKey(order.paidAt || order.createdAt);
    if (timestampKey) return timestampKey;

    const dateStr = order.date;
    if (!dateStr || dateStr === 'Today') {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

    const match = String(dateStr).match(/^(\d{1,2})\s+([A-Za-z]{3,})\.?(?:\s+(\d{4}))?$/);
    if (match) {
      const monthMap = {
        jan: '01', january: '01',
        feb: '02', february: '02',
        mar: '03', march: '03',
        apr: '04', april: '04',
        may: '05',
        jun: '06', june: '06',
        jul: '07', july: '07',
        aug: '08', august: '08',
        sep: '09', sept: '09', september: '09',
        oct: '10', october: '10',
        nov: '11', november: '11',
        dec: '12', december: '12',
      };
      const day = match[1].padStart(2, '0');
      const month = monthMap[match[2].toLowerCase()];
      const year = match[3] || String(new Date().getFullYear());
      if (month) return `${year}-${month}-${day}`;
    }

    return dateStr;
  };

  const filteredByDate = dateFilter === 'All' 
    ? orderHistory 
    : orderHistory.filter(o => getOrderDateKey(o) === dateFilter);

  const filteredHistory = filteredByDate.filter(order => {
    const matchesId = order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesNumber = order.orderNumber ? String(order.orderNumber).includes(searchQuery) : false;
    const matchesTable = (order.table || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesId || matchesNumber || matchesTable;
  });

  const getPaymentMethod = (order) => order.paymentMethod || 'Cash';

  const totalRevenue = filteredByDate.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = filteredByDate.length;
  const cashTotal = filteredByDate.reduce((sum, order) => sum + (getPaymentMethod(order) === 'Cash' ? order.total : 0), 0);
  const upiTotal = filteredByDate.reduce((sum, order) => sum + (getPaymentMethod(order) === 'UPI' ? order.total : 0), 0);

  const [showEODModal, setShowEODModal] = useState(false);

  // Calculate dish counts for EOD report
  const eodDishCounts = {};
  filteredByDate.forEach(order => {
    order.itemList?.forEach(itemStr => {
      const parts = itemStr.split(' x');
      const namePart = parts[0].replace(/\s*\([^)]+\)/g, '').trim();
      const qty = parseInt(parts[1] || '1', 10);
      
      eodDishCounts[namePart] = (eodDishCounts[namePart] || 0) + qty;
    });
  });

  const sortedEODDishes = Object.entries(eodDishCounts).sort((a,b) => b[1] - a[1]);

  return (
    <div className="history-page">
      <header className="history-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Order History</h1>
          <p className="text-muted">Review all completed and paid orders received till now</p>
        </div>
        <div className="date-filter-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--card-bg, #fff)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Calendar size={18} className="text-muted" />
          <input 
            type="date"
            value={dateFilter === 'All' ? '' : dateFilter}
            onChange={(e) => setDateFilter(e.target.value || 'All')}
            style={{ border: 'none', background: 'transparent', color: 'var(--text-main)', outline: 'none', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}
          />
          <button 
            className={`btn ${dateFilter === 'All' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}
            onClick={() => setDateFilter('All')}
          >
            Till Date
          </button>
          <button 
            className="btn btn-primary" 
            style={{ marginLeft: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            onClick={() => setShowEODModal(true)}
          >
            <FileText size={16} />
            EOD Report
          </button>
        </div>
      </header>

      {/* Summary Row */}
      <div className="history-summary-row">
        <div className="summary-card card">
          <div className="summary-icon" style={{ background: 'rgba(76, 209, 55, 0.1)', color: 'var(--success)' }}>
            <DollarSign size={20} />
          </div>
          <div className="summary-info">
            <span className="summary-label">Total History Revenue</span>
            <strong className="summary-value">₹{totalRevenue.toLocaleString()}</strong>
          </div>
        </div>

        <div className="summary-card card">
          <div className="summary-icon" style={{ background: 'rgba(9, 132, 227, 0.1)', color: 'var(--primary)' }}>
            <ShoppingBag size={20} />
          </div>
          <div className="summary-info">
            <span className="summary-label">Total Paid Orders</span>
            <strong className="summary-value">{totalOrders} Orders</strong>
          </div>
        </div>
      </div>

      <div className="history-content">
        {/* Table list */}
        <div className="history-list-card card">
          <div className="list-header">
            <h2>Order Logs</h2>
            <div className="search-bar">
              <Search size={18} className="text-muted" />
              <input
                type="text"
                placeholder="Search by Order No. or Table..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="history-table-container">
            {filteredHistory.length === 0 ? (
              <p className="empty-msg">No historical orders match the search criteria.</p>
            ) : (
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Order No.</th>
                    <th>Date &amp; Time</th>
                    <th>Table</th>
                    <th>Items Count</th>
                    <th>Total Bill</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map(order => (
                    <tr key={order.id}>
                      <td><strong className="order-id">#{order.orderNumber}</strong> <span className="text-muted" style={{ fontSize: '0.75rem' }}>({order.id.slice(0, 8)})</span></td>
                      <td>
                        <div className="date-time">
                          <span>{order.date || 'Today'}</span>
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>at {order.closedAt}</span>
                        </div>
                      </td>
                      <td><span className="table-badge">{order.table}</span></td>
                      <td>{order.itemList?.length || 0} items</td>
                      <td><strong className="price-label">₹{order.total}</strong></td>
                      <td>{getPaymentMethod(order)}</td>
                      <td>
                        <button
                          className="btn btn-outline detail-btn"
                          onClick={() => setSelectedOrder(order)}
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Eye size={14} /> View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Selected Order Detail Sidebar / Popup */}
        {selectedOrder && (
          <div className="order-detail-modal">
            <div className="modal-content card">
              <div className="modal-header">
                <h3>Order #{selectedOrder.orderNumber} <span className="text-muted" style={{ fontSize: '1rem', fontWeight: 'normal' }}>({selectedOrder.id.slice(0, 8)})</span> Details</h3>
                <button className="close-btn" onClick={() => setSelectedOrder(null)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="detail-row">
                  <span>Payment Method</span>
                  <span className="status-paid-badge">{getPaymentMethod(selectedOrder)}</span>
                </div>
                <div className="detail-row">
                  <span>Table/Type</span>
                  <strong>{selectedOrder.table}</strong>
                </div>
                <div className="detail-row">
                  <span>Completed At</span>
                  <span>{selectedOrder.date || 'Today'} at {selectedOrder.closedAt}</span>
                </div>

                <div className="item-breakdown" style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-muted)' }}>Dishes Ordered</h4>
                  <ul className="modal-items-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedOrder.itemList?.map((item, idx) => (
                      <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="detail-row total" style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <span>Grand Total</span>
                  <strong>₹{selectedOrder.total}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EOD Report Modal */}
        {showEODModal && (
          <div className="order-detail-modal">
            <div className="modal-content card" style={{ maxWidth: '500px', width: '90%' }}>
              <div className="modal-header">
                <h3>End of Day Report</h3>
                <span className="badge-cat" style={{ marginLeft: '1rem' }}>{dateFilter === 'All' ? 'All-Time' : dateFilter}</span>
                <button className="close-btn" onClick={() => setShowEODModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="detail-row">
                  <span>Total Revenue Collected</span>
                  <strong style={{ color: 'var(--success)', fontSize: '1.1rem' }}>₹{totalRevenue.toLocaleString()}</strong>
                </div>
                <div className="detail-row">
                  <span>Total Cash Collected</span>
                  <strong>₹{cashTotal.toLocaleString()}</strong>
                </div>
                <div className="detail-row">
                  <span>Total UPI Collected</span>
                  <strong>₹{upiTotal.toLocaleString()}</strong>
                </div>
                <div className="detail-row">
                  <span>Total Orders Processed</span>
                  <strong>{totalOrders}</strong>
                </div>

                <div className="item-breakdown" style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>Dish Quantities Sold</h4>
                  {sortedEODDishes.length === 0 ? (
                    <p className="text-muted">No dishes sold for this date.</p>
                  ) : (
                    <ul className="modal-items-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '350px', overflowY: 'auto' }}>
                      {sortedEODDishes.map(([dish, qty], idx) => (
                        <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', padding: '0.4rem 0', borderBottom: '1px dashed var(--border-color)' }}>
                          <span style={{ fontWeight: 500 }}>{dish}</span>
                          <strong>x{qty}</strong>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="modal-actions" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button className="btn btn-outline" onClick={() => setShowEODModal(false)}>Close</button>
                  <button className="btn btn-primary" onClick={() => { alert('Printing End of Day Report to thermal printer...'); setShowEODModal(false); }} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <Printer size={16} /> Print Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
