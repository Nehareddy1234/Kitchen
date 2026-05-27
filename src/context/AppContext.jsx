import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

// Use relative URLs on Vercel (website), full URL in Capacitor (APK)
const isCapacitor = typeof window !== 'undefined' && window.Capacitor !== undefined;
const API_BASE = isCapacitor ? 'https://nehaskitchen.vercel.app' : '';

const initialTables = [
  { id: 1, name: 'T1', capacity: 4, status: 'available', order: null },
  { id: 2, name: 'T2', capacity: 2, status: 'available', order: null },
  { id: 3, name: 'T3', capacity: 6, status: 'available', order: null },
];

const initialMenuItems = [
  { id: 1, name: 'Deluxe Veg Thali', category: 'Combos/Thali', price: 250, image: '', enabled: true },
  { id: 2, name: 'Paneer Butter Masala', category: 'Curries', price: 180, image: '', enabled: true },
];

export function AppProvider({ children }) {
  const [appMode, setAppMode] = useState('restaurant'); // 'restaurant' | 'grocery'

  const [tables, setTables] = useState(initialTables);
  const [activeOrders, setActiveOrders] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [groceryItems, setGroceryItems] = useState([]);
  const [storeInventory, setStoreInventory] = useState([]);
  const [storeOrders, setStoreOrders] = useState([]);

  // Fetch initial data from backend (fallback to defaults if backend not ready)
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const [menuRes, tablesRes, ordersRes, groceryRes] = await Promise.all([
          fetch(`${API_BASE}/api/menu`).catch(() => null),
          fetch(`${API_BASE}/api/tables`).catch(() => null),
          fetch(`${API_BASE}/api/orders`).catch(() => null),
          fetch(`${API_BASE}/api/grocery`).catch(() => null)
        ]);

        if (menuRes && menuRes.ok) setMenuItems(await menuRes.json());
        if (tablesRes && tablesRes.ok) {
          const rawTables = await tablesRes.json();
          // Map `orders[]` array to `order` (latest active) for UI compatibility
          setTables(rawTables.map(t => ({ ...t, order: t.orders?.[0] || null })));
        }
        if (ordersRes && ordersRes.ok) {
          const allOrders = await ordersRes.json();
          setActiveOrders(allOrders.filter(o => o.status !== 'Paid'));
          setOrderHistory(allOrders.filter(o => o.status === 'Paid'));
        }
        if (groceryRes && groceryRes.ok) setGroceryItems(await groceryRes.json());
      } catch (err) {
        console.error("Backend not reachable. Falling back to local state.", err);
      }
    };
    fetchBackendData();
  }, []);

  // Responsive Layout States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(() => {
    return localStorage.getItem('sidebarMinimized') === 'true';
  });

  const toggleSidebarMinimized = () => {
    setSidebarMinimized(prev => {
      const next = !prev;
      localStorage.setItem('sidebarMinimized', String(next));
      return next;
    });
  };

  const toggleSidebarOpen = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  // Refresh all data from the backend
  const refreshData = async () => {
    try {
      const [menuRes, tablesRes, ordersRes, groceryRes] = await Promise.all([
        fetch(`${API_BASE}/api/menu`).catch(() => null),
        fetch(`${API_BASE}/api/tables`).catch(() => null),
        fetch(`${API_BASE}/api/orders`).catch(() => null),
        fetch(`${API_BASE}/api/grocery`).catch(() => null)
      ]);
      if (menuRes && menuRes.ok) setMenuItems(await menuRes.json());
      if (tablesRes && tablesRes.ok) {
        const rawTables = await tablesRes.json();
        setTables(rawTables.map(t => ({ ...t, order: t.orders?.[0] || null })));
      }
      if (ordersRes && ordersRes.ok) {
        const allOrders = await ordersRes.json();
        setActiveOrders(allOrders.filter(o => o.status !== 'Paid'));
        setOrderHistory(allOrders.filter(o => o.status === 'Paid'));
      }
      if (groceryRes && groceryRes.ok) setGroceryItems(await groceryRes.json());
    } catch (err) {
      console.error('Refresh failed', err);
    }
  };

  // Place a new order
  const placeOrder = async (cartItems, tableId) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId,
          items: cartItems.map(c => ({ menuItemId: c.id, quantity: c.quantity, addOns: c.addOns }))
        })
      });
      if (res.ok) {
        const newOrder = await res.json();
        setActiveOrders(prev => [newOrder, ...prev]);
        if (tableId) {
          setTables(prev => prev.map(t =>
            t.id === tableId ? { ...t, status: 'occupied', order: newOrder } : t
          ));
        }
        return newOrder.id;
      }
    } catch (e) {
      console.error("Failed to place order via API", e);
    }
    return `#ORD-${Date.now()}`;
  };

  const updateOrder = (orderId, cartItems, tableId) => {
    // Basic fallback stub for updating order
  };

  const updateOrderItemQuantity = (orderId, nameToUpdate, delta, isAddOn = null, addOnDelta = 0) => {
    // Basic fallback stub
  };

  const markOrderReady = async (orderId) => {
    setActiveOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Ready' } : o));
    try {
      await fetch(`${API_BASE}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Ready' })
      });
    } catch (e) {}
  };

  const closeOrder = async (orderId) => {
    const order = activeOrders.find(o => o.id === orderId);
    if (order) {
      setOrderHistory(prev => [{ ...order, status: 'Paid', closedAt: new Date().toLocaleTimeString() }, ...prev]);
      setActiveOrders(prev => prev.filter(o => o.id !== orderId));
      setTables(prev => prev.map(t => t.order?.id === orderId ? { ...t, status: 'available', order: null } : t));
      
      try {
        await fetch(`${API_BASE}/api/orders/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Paid' })
        });
      } catch (e) {}
    }
  };

  const freeTable = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    if (table?.order) closeOrder(table.order.id);
  };

  const updateTableStatus = async (tableId, newStatus) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: newStatus } : t));
    try {
      await fetch(`${API_BASE}/api/tables/${tableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {}
  };

  const addMenuItem = async (item) => {
    const tempId = Date.now();
    setMenuItems(prev => [...prev, { ...item, id: tempId }]);
    try {
      const res = await fetch(`${API_BASE}/api/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const savedItem = await res.json();
      setMenuItems(prev => prev.map(i => i.id === tempId ? savedItem : i));
    } catch (e) {
      console.error("Failed to save menu item to database. Keeping local state.", e);
    }
  };

  const removeMenuItem = async (itemId) => {
    setMenuItems(prev => prev.filter(item => item.id !== itemId));
    try {
      const res = await fetch(`${API_BASE}/api/menu/${itemId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    } catch (e) {
      console.error("Failed to delete menu item from database.", e);
    }
  };

  const toggleMenuItemEnabled = async (itemId) => {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;
    const nextEnabled = !item.enabled;
    setMenuItems(prev => prev.map(i => i.id === itemId ? { ...i, enabled: nextEnabled } : i));
    try {
      const res = await fetch(`${API_BASE}/api/menu/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextEnabled })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    } catch (e) {
      console.error("Failed to toggle menu item status in database.", e);
    }
  };

  const addGroceryItem = async (name, quantity, unit) => {
    const tempId = Date.now();
    setGroceryItems(prev => [...prev, { id: tempId, name, quantity, unit, purchased: false }]);
    try {
      const res = await fetch(`${API_BASE}/api/grocery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, quantity, unit })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const savedItem = await res.json();
      setGroceryItems(prev => prev.map(i => i.id === tempId ? savedItem : i));
    } catch (e) {
      console.error("Failed to save grocery item to database.", e);
    }
  };

  const toggleGroceryItem = async (itemId) => {
    const item = groceryItems.find(i => i.id === itemId);
    if (item) {
      setGroceryItems(prev => prev.map(i => i.id === itemId ? { ...i, purchased: !i.purchased } : i));
      try {
        await fetch(`${API_BASE}/api/grocery/${itemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ purchased: !item.purchased })
        });
      } catch (e) {}
    }
  };

  const removeGroceryItem = async (itemId) => {
    setGroceryItems(prev => prev.filter(item => item.id !== itemId));
    try {
      const res = await fetch(`${API_BASE}/api/grocery/${itemId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    } catch (e) {
      console.error("Failed to delete grocery item from database.", e);
    }
  };

  const clearPurchasedGrocery = () => {
    setGroceryItems(prev => prev.filter(item => !item.purchased));
  };

  const addStoreItem = (item) => {
    setStoreInventory(prev => [{ ...item, id: `G${Date.now()}` }, ...prev]);
  };

  const updateStoreItemStock = (id, newStock) => {
    setStoreInventory(prev => prev.map(item => item.id === id ? { ...item, stock: Math.max(0, newStock) } : item));
  };
  
  const checkoutStoreOrder = (cartItems, paymentMethod) => {
    return `#GRO-${Date.now().toString().slice(-4)}`;
  };

  return (
    <AppContext.Provider value={{
      appMode, setAppMode,
      tables, activeOrders, orderHistory, menuItems, groceryItems, storeInventory, storeOrders,
      placeOrder, updateOrder, updateOrderItemQuantity, markOrderReady, closeOrder, freeTable, updateTableStatus,
      addMenuItem, removeMenuItem, toggleMenuItemEnabled,
      addGroceryItem, toggleGroceryItem, removeGroceryItem, clearPurchasedGrocery,
      addStoreItem, updateStoreItemStock, checkoutStoreOrder,
      sidebarOpen, sidebarMinimized, toggleSidebarMinimized, toggleSidebarOpen, closeSidebar
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
