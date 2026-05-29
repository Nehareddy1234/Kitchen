import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  Calendar, 
  Tag,
  TrendingDown,
  FileText,
  AlertCircle
} from 'lucide-react';
import './Expenses.css';

const MOCK_INITIAL_EXPENSES = [
  { id: 1, description: 'Monthly Rent', category: 'Rent', amount: 25000, date: '2026-05-01' },
  { id: 2, description: 'Fresh Vegetables & Dairy', category: 'Ingredients', amount: 18500, date: '2026-05-15' },
  { id: 3, description: 'Staff Salaries', category: 'Salaries', amount: 48000, date: '2026-05-28' },
  { id: 4, description: 'Electricity & Water Bill', category: 'Utilities', amount: 4200, date: '2026-05-10' },
  { id: 5, description: 'Social Media Ads & Flyers', category: 'Marketing', amount: 3000, date: '2026-05-05' },
  { id: 6, description: 'Kitchen Spoons & Plates replacement', category: 'Miscellaneous', amount: 1200, date: '2026-05-20' },
];

const CATEGORIES = [
  { name: 'Ingredients', color: '#ff7675', bg: 'rgba(255, 118, 117, 0.15)' },
  { name: 'Rent', color: '#00b894', bg: 'rgba(0, 184, 148, 0.15)' },
  { name: 'Utilities', color: '#0984e3', bg: 'rgba(9, 132, 227, 0.15)' },
  { name: 'Salaries', color: '#6c5ce7', bg: 'rgba(108, 92, 231, 0.15)' },
  { name: 'Marketing', color: '#fdcb6e', bg: 'rgba(253, 203, 110, 0.15)' },
  { name: 'Miscellaneous', color: '#b2bec3', bg: 'rgba(178, 190, 195, 0.15)' },
];

export default function Expenses() {
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('nk_expenses');
    return saved ? JSON.parse(saved) : MOCK_INITIAL_EXPENSES;
  });

  // State for adding new expense
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Ingredients');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('nk_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Handle Add
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!description.trim() || !amount || parseFloat(amount) <= 0) return;

    const newExpense = {
      id: Date.now(),
      description: description.trim(),
      category,
      amount: parseFloat(amount),
      date
    };

    setExpenses(prev => [newExpense, ...prev]);
    setDescription('');
    setAmount('');
    setCategory('Ingredients');
    setDate(new Date().toISOString().split('T')[0]);
    setShowAddForm(false);
  };

  // Handle Delete
  const handleDeleteExpense = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    }
  };

  // Calculations
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const categoryTotals = CATEGORIES.reduce((acc, cat) => {
    const total = expenses
      .filter(exp => exp.category === cat.name)
      .reduce((sum, exp) => sum + exp.amount, 0);
    acc[cat.name] = total;
    return acc;
  }, {});

  const topCategory = Object.keys(categoryTotals).reduce((a, b) => 
    categoryTotals[a] > categoryTotals[b] ? a : b, 
    CATEGORIES[0].name
  );

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'All' || exp.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="expenses-page">
      <header className="expenses-header">
        <div>
          <h1>Expenses Management</h1>
          <p className="text-muted">Track store expenditures, bills, and resource allocations</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={18} style={{ marginRight: '0.4rem' }} /> Add Expense
        </button>
      </header>

      {/* Stats row */}
      <div className="expenses-stats-grid">
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: 'rgba(232, 65, 24, 0.1)', color: '#e84118' }}>
            <DollarSign size={22} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Expenditures</p>
            <h2 className="stat-value">₹{totalSpent.toLocaleString('en-IN')}</h2>
            <span className="stat-sub">Across all recorded bills</span>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ background: 'rgba(108, 92, 231, 0.1)', color: '#6c5ce7' }}>
            <TrendingDown size={22} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Highest Cost Center</p>
            <h2 className="stat-value">{topCategory}</h2>
            <span className="stat-sub">₹{categoryTotals[topCategory]?.toLocaleString('en-IN') || 0} spent</span>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ background: 'rgba(0, 184, 148, 0.1)', color: '#00b894' }}>
            <Calendar size={22} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Bills Filed</p>
            <h2 className="stat-value">{expenses.length} Records</h2>
            <span className="stat-sub">Stored locally in your profile</span>
          </div>
        </div>
      </div>

      <div className="expenses-main-layout">
        
        {/* Category Breakdown Breakdown */}
        <div className="expenses-breakdown-card card">
          <h3>Expenditures Breakdown</h3>
          <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '1.5rem' }}>Spendings analyzed by categories</p>
          
          <div className="breakdown-list">
            {CATEGORIES.map(cat => {
              const amount = categoryTotals[cat.name] || 0;
              const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
              return (
                <div key={cat.name} className="breakdown-item">
                  <div className="breakdown-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="category-dot" style={{ background: cat.color }}></span>
                      <strong style={{ fontSize: '0.875rem' }}>{cat.name}</strong>
                    </div>
                    <span className="breakdown-amount">
                      ₹{amount.toLocaleString('en-IN')} <span className="text-muted" style={{ fontSize: '0.75rem', marginLeft: '0.25rem' }}>({percentage.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill" 
                      style={{ 
                        width: `${percentage}%`, 
                        background: cat.color 
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expenses List & Form */}
        <div className="expenses-list-section">
          
          {/* Add Expense Form (Toggled) */}
          {showAddForm && (
            <div className="expense-form-card card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Add New Expense</h3>
                <button className="close-btn" onClick={() => setShowAddForm(false)}>&times;</button>
              </div>
              <form onSubmit={handleAddExpense} className="expense-form">
                <div className="form-group">
                  <label>Description</label>
                  <input 
                    type="text" 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="e.g., Water Bill, Staff lunch, etc." 
                    required 
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Amount (₹)</label>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="Amount in Rupees" 
                      min="1"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}>
                      {CATEGORIES.map(cat => (
                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required 
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Record</button>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAddForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Table Container */}
          <div className="expense-table-card card">
            <div className="table-header-filters">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search description..." 
                />
              </div>
              <div className="filter-box">
                <Filter size={16} className="filter-icon" />
                <select 
                  value={selectedCategoryFilter} 
                  onChange={e => setSelectedCategoryFilter(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="expenses-table">
                <thead>
                  <tr>
                    <th>Expense Description</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'center', width: '60px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                          <AlertCircle size={32} />
                          <strong>No recorded expenses found</strong>
                          <span style={{ fontSize: '0.8rem' }}>Try clearing filters or add a new record!</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map(exp => {
                      const catInfo = CATEGORIES.find(c => c.name === exp.category) || CATEGORIES[CATEGORIES.length - 1];
                      return (
                        <tr key={exp.id}>
                          <td>
                            <div className="expense-desc-cell">
                              <FileText size={16} className="desc-icon" />
                              <span>{exp.description}</span>
                            </div>
                          </td>
                          <td>
                            <span 
                              className="category-badge" 
                              style={{ 
                                background: catInfo.bg, 
                                color: catInfo.color 
                              }}
                            >
                              <Tag size={10} style={{ marginRight: '0.3rem' }} />
                              {exp.category}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#e84118' }}>
                            - ₹{exp.amount.toLocaleString('en-IN')}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button className="delete-action-btn" onClick={() => handleDeleteExpense(exp.id)}>
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
