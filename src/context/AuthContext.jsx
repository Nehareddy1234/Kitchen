import React, { createContext, useContext, useState } from 'react';

// ─────────────────────────────────────────────────────
//  Predefined Users
//  To add more users, just push to this array.
// ─────────────────────────────────────────────────────
const USERS = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    displayName: 'Admin',
    avatar: 'AD',
  },
  {
    id: 2,
    username: 'accounts',
    password: 'acc123',
    role: 'account_manager',
    displayName: 'Accounts',
    avatar: 'AC',
  },
  {
    id: 3,
    username: 'waiter1',
    password: 'wait123',
    role: 'waiter',
    displayName: 'Waiter 1',
    avatar: 'W1',
  },
  {
    id: 4,
    username: 'waiter2',
    password: 'wait456',
    role: 'waiter',
    displayName: 'Waiter 2',
    avatar: 'W2',
  },
  {
    id: 5,
    username: 'table1',
    password: 'cust123',
    role: 'customer',
    displayName: 'Table 1',
    avatar: 'T1',
  },
  {
    id: 6,
    username: 'table2',
    password: 'cust456',
    role: 'customer',
    displayName: 'Table 2',
    avatar: 'T2',
  },
];

// ─────────────────────────────────────────────────────
//  Role-based allowed nav paths
// ─────────────────────────────────────────────────────
export const ROLE_NAV = {
  admin: ['/', '/pos', '/orders', '/tables', '/menu', '/grocery', '/history', '/analytics', '/store/pos', '/store/inventory', '/store/history', '/store/analytics'],
  account_manager: ['/', '/pos', '/orders', '/tables', '/menu', '/history', '/analytics', '/store/pos', '/store/inventory', '/store/history', '/store/analytics'],
  waiter: ['/pos', '/orders', '/tables', '/grocery', '/store/pos'],
  customer: ['/customer-menu'],
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('rc_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = (username, password) => {
    const user = USERS.find(
      u => u.username === username.trim() && u.password === password
    );
    if (user) {
      const { password: _pw, ...safeUser } = user;
      setCurrentUser(safeUser);
      sessionStorage.setItem('rc_user', JSON.stringify(safeUser));
      return { success: true, user: safeUser };
    }
    return { success: false, error: 'Invalid username or password.' };
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('rc_user');
  };

  const hasAccess = (path) => {
    if (!currentUser) return false;
    const allowed = ROLE_NAV[currentUser.role] || [];
    return allowed.includes(path);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, hasAccess, employees: USERS }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
