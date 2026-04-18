import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './Header.module.css';

// Ícone para dropdown
import { HiChevronDown, HiChevronRight } from 'react-icons/hi';

const HeaderNavBar = ({ isMobile }) => {
  const [isCatalogDropdownOpen, setIsCatalogDropdownOpen] = useState(false);

  const toggleCatalogDropdown = () => {
    setIsCatalogDropdownOpen(!isCatalogDropdownOpen);
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    {
      name: 'Catálogo',
      href: '/catalog',
      hasDropdown: true,
      dropdownContent: (
        <div className={styles.catalogDropdown}>
          <div className={styles.dropdownColumn}>
            <h4 className={styles.dropdownColumnTitle}>Por Categoria</h4>
            <ul>
              <li><Link href="/category/adulto" className={styles.dropdownLink}>Adulto</Link></li>
              <li><Link href="/category/infantil" className={styles.dropdownLink}>Infantil</Link></li>
              <li><Link href="/category/juvenil" className={styles.dropdownLink}>Juvenil</Link></li>
            </ul>
          </div>
          <div className={styles.dropdownColumn}>
            <h4 className={styles.dropdownColumnTitle}>Destaques</h4>
            <ul>
              <li><Link href="/featured/mais-vendidos" className={styles.dropdownLink}>Mais Vendidos</Link></li>
              <li><Link href="/featured/lancamentos" className={styles.dropdownLink}>Lançamentos</Link></li>
            </ul>
          </div>
        </div>
      ),
    },
    { name: 'Sobre Nós', href: '/about' },
  ];

  // Se for mobile, este componente não renderiza sua própria navegação
  // pois ela será integrada ao OffCanvasMenu
  if (isMobile) {
    return null;
  }

  return (
    <div className={styles.navBar}>
      <div className={styles.navBarContent}>
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {navLinks.map((link) => (
              <li key={link.name} className={styles.navItem}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className={styles.navItemWrapper}
                >
                  <Link
                    href={link.href}
                    className={styles.navLink}
                    onClick={link.hasDropdown ? (e) => { e.preventDefault(); toggleCatalogDropdown(); } : undefined}
                  >
                    {link.name}
                    {link.hasDropdown && (
                      <HiChevronDown className={`${styles.navLinkDropdownIcon} ${isCatalogDropdownOpen ? styles.rotated : ''}`} />
                    )}
                  </Link>
                  <span className={styles.navLinkUnderline}></span>
                </motion.div>
                {link.hasDropdown && isCatalogDropdownOpen && link.dropdownContent}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default HeaderNavBar;