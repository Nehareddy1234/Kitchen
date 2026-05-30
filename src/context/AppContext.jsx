import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

// Use relative URLs on Vercel (website), full URL in Capacitor (APK)
const isCapacitor = typeof window !== 'undefined' && window.Capacitor !== undefined;
const API_BASE = isCapacitor ? 'https://nehaskitchen.vercel.app' : '';

const initialTables = [
  { id: 1, name: 'T1', capacity: 4, status: 'available', order: null },
  { id: 2, name: 'T2', capacity: 2, status: 'available', order: null },
  { id: 3, name: 'T3', capacity: 6, status: 'available', order: null },
  { id: 4, name: 'T4', capacity: 4, status: 'available', order: null },
  { id: 5, name: 'T5', capacity: 4, status: 'available', order: null },
  { id: 6, name: 'T6', capacity: 6, status: 'available', order: null },
  { id: 7, name: 'T7', capacity: 2, status: 'available', order: null },
];

// No hardcoded fallback — always load from the database
const initialMenuItems = [];

const mergeLocalActiveOrders = (previousOrders, backendOrders) => {
  const localOrders = previousOrders.filter(order => String(order.id).startsWith('local-'));
  const backendIds = new Set(backendOrders.map(order => order.id));
  return [
    ...localOrders.filter(order => !backendIds.has(order.id)),
    ...backendOrders,
  ];
};

export function AppProvider({ children }) {
  const [appMode, setAppMode] = useState('restaurant'); // 'restaurant' | 'grocery'

  const [tables, setTables] = useState(initialTables);
  const [paymentMethods, setPaymentMethods] = useState({});

  const handlePaymentChange = (orderId, method) => {
    setPaymentMethods(prev => ({ ...prev, [orderId]: method }));
  };

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
        // Tables are already mapped by the backend (order is the active order)
        if (tablesRes && tablesRes.ok) setTables(await tablesRes.json());
        if (ordersRes && ordersRes.ok) {
          const allOrders = await ordersRes.json();
          const backendActiveOrders = allOrders.filter(o => o.status !== 'Paid');
          setActiveOrders(prev => mergeLocalActiveOrders(prev, backendActiveOrders));
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
      if (tablesRes && tablesRes.ok) setTables(await tablesRes.json());
      if (ordersRes && ordersRes.ok) {
        const allOrders = await ordersRes.json();
        const backendActiveOrders = allOrders.filter(o => o.status !== 'Paid');
        setActiveOrders(prev => mergeLocalActiveOrders(prev, backendActiveOrders));
        setOrderHistory(allOrders.filter(o => o.status === 'Paid'));
      }
      if (groceryRes && groceryRes.ok) setGroceryItems(await groceryRes.json());
    } catch (err) {
      console.error('Refresh failed', err);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshData();
    }, 5000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const buildLocalOrder = (cartItems, tableId, id = `local-${Date.now()}`) => {
    const now = new Date();
    const addOnTotal = (item) => ((item.addOns?.Roti || 0) * 15) + ((item.addOns?.Curry || 0) * 40);
    const total = cartItems.reduce((sum, item) => sum + (item.price + addOnTotal(item)) * item.quantity, 0);
    return {
      id,
      orderNumber: Date.now().toString().slice(-6),
      table: tableId ? `Table ${tables.find(t => t.id === tableId)?.name || tableId}` : 'Takeaway',
      itemList: cartItems.map(item => `${item.name} x${item.quantity}`),
      total,
      status: 'Preparing',
      time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      createdAt: now.toISOString(),
    };
  };

  const upsertActiveOrder = (order) => {
    setActiveOrders(prev => {
      const exists = prev.some(o => o.id === order.id);
      return exists ? prev.map(o => o.id === order.id ? order : o) : [order, ...prev];
    });
  };

  const setTableOrder = (tableId, order) => {
    if (tableId) {
      setTables(prev => prev.map(t =>
        t.id === tableId ? { ...t, status: 'occupied', order } : t
      ));
    }
  };

  const removeOptimisticOrder = (orderId, tableId) => {
    setActiveOrders(prev => prev.filter(order => order.id !== orderId));
    if (tableId) {
      setTables(prev => prev.map(t =>
        t.id === tableId && t.order?.id === orderId
          ? { ...t, status: 'available', order: null }
          : t
      ));
    }
  };

  // Place a new order
  const placeOrder = async (cartItems, tableId) => {
    const tempId = `local-${Date.now()}`;
    const optimisticOrder = buildLocalOrder(cartItems, tableId, tempId);
    upsertActiveOrder(optimisticOrder);
    setTableOrder(tableId, optimisticOrder);

    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send price per item so backend can accurately compute the total (incl. add-ons)
        body: JSON.stringify({
          tableId: tableId || null,
          items: cartItems.map(c => ({
            menuItemId: c.id,
            quantity: c.quantity,
            addOns: c.addOns || null,
            price: c.price,
          }))
        })
      });
      if (res.ok) {
        const newOrder = await res.json(); // already mapped: has itemList, table string, time
        setActiveOrders(prev => prev.map(o => o.id === tempId ? newOrder : o));
        setTableOrder(tableId, newOrder);
        return newOrder.id;
      } else {
        const err = await res.json().catch(() => ({}));
        console.error('placeOrder API error:', err);
        removeOptimisticOrder(tempId, tableId);
        throw new Error(err.details || err.error || `Failed to place order (${res.status})`);
      }
    } catch (e) {
      console.error('Failed to place order via API', e);
      removeOptimisticOrder(tempId, tableId);
      throw e;
    }
  };

  const updateOrder = async (orderId, cartItems, tableId) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: tableId || null,
          items: cartItems.map(c => ({
            menuItemId: c.id,
            quantity: c.quantity,
            addOns: c.addOns || null,
            price: c.price,
          }))
        })
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        setActiveOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
        // Sync table assignment
        setTables(prev => prev.map(t => {
          if (t.order?.id === orderId) {
            return tableId && t.id === tableId
              ? { ...t, status: 'occupied', order: updatedOrder }
              : { ...t, status: 'available', order: null };
          }
          if (tableId && t.id === tableId) return { ...t, status: 'occupied', order: updatedOrder };
          return t;
        }));
        return updatedOrder.id;
      } else {
        const err = await res.json().catch(() => ({}));
        console.error('updateOrder API error:', err);
      }
    } catch (e) {
      console.error('Failed to update order via API', e);
    }
    return null;
  };

  const updateOrderItemQuantity = (orderId, nameToUpdate, delta, isAddOn = null, addOnDelta = 0) => {
    // Inline quantity adjustment — reflects in UI only (use Edit Order for full changes)
    setActiveOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const newItemList = (o.itemList || []).map(itemStr => {
        const match = itemStr.match(/^(.+) x(\d+)$/);
        if (!match) return itemStr;
        const name = match[1];
        const qty = parseInt(match[2], 10);
        const cleanName = name.replace(/\s*\([^)]+\)/g, '').trim();
        if (cleanName !== nameToUpdate) return itemStr;
        const newQty = qty + delta;
        if (newQty <= 0) return null;
        return `${name} x${newQty}`;
      }).filter(Boolean);
      return { ...o, itemList: newItemList };
    }));
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

  const closeOrder = async (orderId, paymentMethod = 'Cash') => {
    const order = activeOrders.find(o => o.id === orderId);
    if (order) {
      const paidOrder = { ...order, status: 'Paid', closedAt: new Date().toLocaleTimeString(), paymentMethod };
      setOrderHistory(prev => [paidOrder, ...prev]);
      setActiveOrders(prev => prev.filter(o => o.id !== orderId));
      setTables(prev => prev.map(t => t.order?.id === orderId ? { ...t, status: 'available', order: null } : t));

      try {
        await fetch(`${API_BASE}/api/orders/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Paid', paymentMethod })
        });
      } catch (e) { console.error('closeOrder API error', e); }
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
    // Optimistic update
    setMenuItems(prev => [...prev, { ...item, id: tempId, enabled: true }]);
    try {
      const res = await fetch(`${API_BASE}/api/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.details || errBody.error || `HTTP ${res.status}`);
      }
      const savedItem = await res.json();
      // Replace temp item with real DB item (gets real id)
      setMenuItems(prev => prev.map(i => i.id === tempId ? savedItem : i));
    } catch (e) {
      console.error('addMenuItem failed — rolling back:', e.message);
      // Rollback optimistic update
      setMenuItems(prev => prev.filter(i => i.id !== tempId));
      throw e; // re-throw so the UI can show an error
    }
  };

  const removeMenuItem = async (itemId) => {
    const snapshot = menuItems.find(i => i.id === itemId);
    // Optimistic update
    setMenuItems(prev => prev.filter(item => item.id !== itemId));
    try {
      const res = await fetch(`${API_BASE}/api/menu/${itemId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.details || errBody.error || `HTTP ${res.status}`);
      }
    } catch (e) {
      console.error('removeMenuItem failed — rolling back:', e.message);
      // Rollback: put the item back
      if (snapshot) setMenuItems(prev => [...prev, snapshot]);
      throw e;
    }
  };

  const toggleMenuItemEnabled = async (itemId) => {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;
    const nextEnabled = !item.enabled;
    // Optimistic update
    setMenuItems(prev => prev.map(i => i.id === itemId ? { ...i, enabled: nextEnabled } : i));
    try {
      const res = await fetch(`${API_BASE}/api/menu/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextEnabled })
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.details || errBody.error || `HTTP ${res.status}`);
      }
    } catch (e) {
      console.error('toggleMenuItemEnabled failed — rolling back:', e.message);
      // Rollback
      setMenuItems(prev => prev.map(i => i.id === itemId ? { ...i, enabled: item.enabled } : i));
      throw e;
    }
  };

  const updateMenuItem = async (itemId, updatedItem) => {
    const snapshot = menuItems.find(i => i.id === itemId);
    if (!snapshot) return;
    // Optimistic update
    setMenuItems(prev => prev.map(i => i.id === itemId ? { ...i, ...updatedItem } : i));
    try {
      const res = await fetch(`${API_BASE}/api/menu/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.details || errBody.error || `HTTP ${res.status}`);
      }
      const savedItem = await res.json();
      setMenuItems(prev => prev.map(i => i.id === itemId ? savedItem : i));
    } catch (e) {
      console.error('updateMenuItem failed — rolling back:', e.message);
      // Rollback
      setMenuItems(prev => prev.map(i => i.id === itemId ? snapshot : i));
      throw e;
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
      refreshData,
      placeOrder, updateOrder, updateOrderItemQuantity, markOrderReady, closeOrder, freeTable, updateTableStatus,
      addMenuItem, removeMenuItem, toggleMenuItemEnabled, updateMenuItem,
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
