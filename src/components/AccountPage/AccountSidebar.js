'use client';

import React from 'react';
import styles from './AccountPage.module.css';
import { useAuth } from '@/context/AuthContext';
import { BsGrid1X2, BsBoxSeam, BsHeart, BsPerson, BsBoxArrowRight, BsPinMapFill } from 'react-icons/bs';

const AccountSidebar = ({ activeView, setActiveView }) => {
  const { logout } = useAuth();
  const navItems = [
    { id: 'dashboard', label: 'Painel', icon: <BsGrid1X2 /> },
    { id: 'orders', label: 'Minhas Compras', icon: <BsBoxSeam /> },
    { id: 'addresses', label: 'Meus Endereços', icon: <BsPinMapFill /> },
    { id: 'favorites', label: 'Meus Favoritos', icon: <BsHeart /> },
    { id: 'details', label: 'Meus Dados', icon: <BsPerson /> },
  ];

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.sidebarNav}>
        <ul>
          {navItems.map(item => (
            <li key={item.id}>
              <button
                className={`${styles.navButton} ${activeView === item.id ? styles.active : ''}`}
                onClick={() => setActiveView(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <button className={styles.logoutButton} onClick={logout}>
        <BsBoxArrowRight />
        <span>Sair</span>
      </button>
    </aside>
  );
};

export default AccountSidebar;