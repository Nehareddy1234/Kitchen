import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

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
          fetch('/api/menu').catch(() => null),
          fetch('/api/tables').catch(() => null),
          fetch('/api/orders').catch(() => null),
          fetch('/api/grocery').catch(() => null)
        ]);

        if (menuRes && menuRes.ok) setMenuItems(await menuRes.json());
        if (tablesRes && tablesRes.ok) setTables(await tablesRes.json());
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

  // Place a new order
  const placeOrder = async (cartItems, tableId) => {
    // Optimistic UI Update (Mock IDs)
    const mockOrderId = `#ORD-${Date.now()}`;
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId,
          items: cartItems.map(c => ({ menuItemId: c.id, quantity: c.quantity, addOns: c.addOns }))
        })
      });
      if (res.ok) {
        // Refresh data ideally, or rely on Realtime
      }
    } catch (e) {
      console.error("Failed to place order via API", e);
    }
    return mockOrderId;
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
      await fetch(`/api/orders/${orderId}`, {
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
        await fetch(`/api/orders/${orderId}`, {
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
      await fetch(`/api/tables/${tableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {}
  };

  const addMenuItem = async (item) => {
    setMenuItems(prev => [...prev, { ...item, id: Date.now() }]);
    try {
      await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
    } catch (e) {}
  };

  const removeMenuItem = (itemId) => {
    setMenuItems(prev => prev.filter(item => item.id !== itemId));
  };

  const toggleMenuItemEnabled = (itemId) => {
    setMenuItems(prev => prev.map(item => item.id === itemId ? { ...item, enabled: !item.enabled } : item));
  };

  const addGroceryItem = async (name, quantity, unit) => {
    setGroceryItems(prev => [...prev, { id: Date.now(), name, quantity, unit, purchased: false }]);
    try {
      await fetch('/api/grocery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, quantity, unit })
      });
    } catch (e) {}
  };

  const toggleGroceryItem = async (itemId) => {
    const item = groceryItems.find(i => i.id === itemId);
    if (item) {
      setGroceryItems(prev => prev.map(i => i.id === itemId ? { ...i, purchased: !i.purchased } : i));
      try {
        await fetch(`/api/grocery/${itemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ purchased: !item.purchased })
        });
      } catch (e) {}
    }
  };

  const removeGroceryItem = (itemId) => {
    setGroceryItems(prev => prev.filter(item => item.id !== itemId));
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
