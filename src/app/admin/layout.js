'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './admin.module.css';
import {
  BsSpeedometer2, BsBox, BsTags, BsReceipt, BsTicketPerforated,
  BsPeople, BsBoxArrowRight, BsList, BsX,
} from 'react-icons/bs';
import { GiHanger } from 'react-icons/gi';

const NAV = [
  { href: '/admin/dashboard', icon: <BsSpeedometer2 />, label: 'Dashboard' },
  { href: '/admin/produtos',  icon: <BsBox />,          label: 'Produtos'   },
  { href: '/admin/categorias',icon: <BsTags />,          label: 'Categorias' },
  { href: '/admin/pedidos',   icon: <BsReceipt />,       label: 'Pedidos'    },
  { href: '/admin/cupons',    icon: <BsTicketPerforated />, label: 'Cupons'  },
];

export default function AdminLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [ready,    setReady]    = useState(false);
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    // Login page handles its own auth — skip guard
    if (pathname === '/admin/login') { setReady(true); return; }
    const token = localStorage.getItem('reveste_token');
    const user  = JSON.parse(localStorage.getItem('reveste_user') || '{}');
    if (!token || user?.tipo !== 'admin') {
      router.replace('/admin/login');
    } else {
      setReady(true);
    }
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem('reveste_token');
    localStorage.removeItem('reveste_user');
    router.replace('/admin/login');
  };

  if (!ready) return null;

  // Login page: render without sidebar
  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <div className={styles.shell}>
      {/* ── Sidebar ── */}
      <aside className={`${styles.sidebar} ${sideOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarLogo}>
          <GiHanger className={styles.logoIcon} />
          <span>Reveste-se</span>
          <span className={styles.logoBadge}>admin</span>
        </div>

        <nav className={styles.nav}>
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${pathname.startsWith(item.href) ? styles.navActive : ''}`}
              onClick={() => setSideOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          <BsBoxArrowRight /> Sair
        </button>
      </aside>

      {/* Overlay mobile */}
      {sideOpen && <div className={styles.overlay} onClick={() => setSideOpen(false)} />}

      {/* ── Main ── */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.hamburger} onClick={() => setSideOpen(v => !v)}>
            {sideOpen ? <BsX size={22} /> : <BsList size={22} />}
          </button>
          <span className={styles.topbarTitle}>
            {NAV.find(n => pathname.startsWith(n.href))?.label ?? 'Admin'}
          </span>
          <Link href="/" className={styles.topbarSite} target="_blank">
            Ver site →
          </Link>
        </header>

        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}
