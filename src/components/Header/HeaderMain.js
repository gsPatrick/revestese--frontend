import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './Header.module.css';

// Ícones
import { BsSearch, BsPerson, BsHeart, BsCart } from 'react-icons/bs';
import { HiOutlineBars3 } from 'react-icons/hi2'; // Ícone de menu hambúrguer

const HeaderMain = ({ onMenuToggle }) => { // Recebe prop para toggle do menu
  return (
    <div className={styles.mainBar}>
      <div className={styles.mainBarContent}>
        {/* Logo */}
        <Link href="/" className={styles.mainLogo}>
          <span>Reveste-se</span>
        </Link>

        {/* Search Bar (Oculta em mobile) */}
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Buscar peças, coleções..."
            className={styles.searchInput}
          />
          <button className={styles.searchButton} aria-label="Buscar">
            <BsSearch className={styles.searchIcon} />
          </button>
        </div>

        {/* Account, Favorites, Cart Icons (Parcialmente oculta em mobile) */}
        <div className={styles.mainActionIcons}>
          {/* Minha Conta e Favoritos ocultos no mobile */}
          <Link href="/my-account" className={`${styles.mainActionLink} ${styles.hideOnMobile}`}>
            <BsPerson className={styles.mainIcon} />
            <span>Minha Conta</span>
          </Link>
          <Link href="/favorites" className={`${styles.mainActionLink} ${styles.hideOnMobile}`}>
            <BsHeart className={styles.mainIcon} />
            <span>Favoritos</span>
          </Link>
          {/* Carrinho sempre visível */}
          <Link href="/cart" className={styles.mainActionLink}>
            <BsCart className={styles.mainIcon} />
            <span>Carrinho</span>
          </Link>
          {/* Menu Hambúrguer (Visível apenas em mobile) */}
          <button
            className={styles.mobileMenuButton}
            aria-label="Abrir Menu"
            onClick={onMenuToggle} // Aciona o toggle do menu lateral
          >
            <HiOutlineBars3 className={styles.hamburgerIcon} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderMain;