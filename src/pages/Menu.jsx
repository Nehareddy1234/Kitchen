import React, { useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Menu.css';

const CATEGORIES = ['Combos/Thali', 'Curries', 'Rotis', 'Rice', 'Drinks'];

export default function Menu() {
  const { menuItems, addMenuItem, removeMenuItem, toggleMenuItemEnabled } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Item name is required.');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      setError('Please enter a valid price greater than 0.');
      return;
    }

    // Default image if none provided
    const imageUrl = image.trim() || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=200&h=200';

    try {
      await addMenuItem({
        name: name.trim(),
        category,
        price: parseFloat(price),
        image: imageUrl
      });
      setName('');
      setPrice('');
      setImage('');
      setSuccess('Menu item added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Failed to add item: ${err.message}`);
    }
  };

  return (
    <div className="menu-management-page">
      <header className="menu-management-header">
        <div>
          <h1>Menu Management</h1>
          <p className="text-muted">Manage restaurant dishes, add new items, or enable/disable them</p>
        </div>
      </header>

      <div className="menu-management-content">
        {/* Add Item Form */}
        <div className="add-item-card card">
          <h2>Add New Dish</h2>
          <form onSubmit={handleSubmit} className="add-item-form">
            {error && (
              <div className="form-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="form-success">
                <Check size={16} />
                <span>{success}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="item-name">Dish Name *</label>
              <input
                id="item-name"
                type="text"
                placeholder="e.g. Garlic Naan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="item-category">Category *</label>
                <select
                  id="item-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="item-price">Price (₹) *</label>
                <input
                  id="item-price"
                  type="number"
                  placeholder="e.g. 50"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="item-image">Image URL (Optional)</label>
              <input
                id="item-image"
                type="url"
                placeholder="https://example.com/dish.jpg"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
              <span className="helper-text">Leaves default placeholder if empty</span>
            </div>

            <button type="submit" className="btn btn-primary submit-btn">
              <Plus size={18} /> Add to Menu
            </button>
          </form>
        </div>

        {/* Menu Items List */}
        <div className="items-list-card card">
          <h2>Current Dishes ({menuItems.length})</h2>
          <div className="items-table-container">
            {menuItems.length === 0 ? (
              <p className="empty-msg">No dishes in the menu. Add one above!</p>
            ) : (
              <table className="menu-items-table">
                <thead>
                  <tr>
                    <th>Dish</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map(item => (
                    <tr key={item.id} className={item.enabled ? '' : 'item-disabled'}>
                      <td>
                        <div className="table-dish-info">
                          <div className="dish-img" style={{ backgroundImage: `url(${item.image})` }}></div>
                          <div className="dish-details">
                            <span className="dish-name">{item.name}</span>
                            <span className="dish-mobile-category">{item.category}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="dish-category-badge">{item.category}</span>
                      </td>
                      <td>
                        <strong className="dish-price">₹{item.price}</strong>
                      </td>
                      <td>
                        <button
                          className={`status-toggle-btn ${item.enabled ? 'enabled' : 'disabled'}`}
                          onClick={() => toggleMenuItemEnabled(item.id)}
                          title={item.enabled ? 'Click to Disable' : 'Click to Enable'}
                        >
                          {item.enabled ? (
                            <>
                              <ToggleRight size={24} color="var(--success)" />
                              <span className="status-text">Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft size={24} color="var(--text-muted)" />
                              <span className="status-text">Disabled</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td>
                        <button
                          className="delete-dish-btn"
                          onClick={async () => {
                            try {
                              await removeMenuItem(item.id);
                            } catch (err) {
                              setError(`Failed to remove item: ${err.message}`);
                            }
                          }}
                          title="Remove from Menu"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
