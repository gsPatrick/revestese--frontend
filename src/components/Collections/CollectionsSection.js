'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useFilter } from '@/context/FilterContext';
import api from '@/services/api';
import styles from './CollectionsSection.module.css';

// ── Todos os ícones usados no admin ──────────────────────────────────────────
import {
  GiHanger, GiDress, GiTrousers, GiRunningShoe, GiAmpleDress,
  GiMonclerJacket, GiBelt, GiNecklace, GiSunglasses,
  GiBriefcase, GiWinterHat, GiSocks, GiWool,
} from 'react-icons/gi';
import { BsHandbag, BsBag, BsShop } from 'react-icons/bs';
import { FaTshirt, FaHatCowboy, FaShoePrints, FaChild } from 'react-icons/fa';
import { MdOutlineCheckroom, MdOutlineSpa } from 'react-icons/md';

const ICON_MAP = {
  GiHanger:           GiHanger,
  GiDress:            GiDress,
  GiAmpleDress:       GiAmpleDress,
  GiAmpleDressFem:    GiAmpleDress,
  GiTrousers:         GiTrousers,
  FaTshirt:           FaTshirt,
  GiMonclerJacket:    GiMonclerJacket,
  GiRunningShoe:      GiRunningShoe,
  FaShoePrints:       FaShoePrints,
  BsHandbag:          BsHandbag,
  BsBag:              BsBag,
  GiBelt:             GiBelt,
  GiNecklace:         GiNecklace,
  GiSunglasses:       GiSunglasses,
  FaHatCowboy:        FaHatCowboy,
  GiWinterHat:        GiWinterHat,
  GiSocks:            GiSocks,
  GiBriefcase:        GiBriefcase,
  GiWool:             GiWool,
  MdOutlineCheckroom: MdOutlineCheckroom,
  FaChild:            FaChild,
  BsShop:             BsShop,
  MdOutlineSpa:       MdOutlineSpa,
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://geral-revestese-api.r954jc.easypanel.host';

function isImageUrl(icone) {
  if (!icone) return false;
  return icone.startsWith('/') || icone.startsWith('http');
}

function getImageSrc(icone) {
  return icone.startsWith('http') ? icone : `${API_BASE}${icone}`;
}

function renderIcon(icone, size = 96) {
  if (!icone) return <GiHanger size={size} />;
  if (isImageUrl(icone)) return null; // handled separately in card
  const Icon = ICON_MAP[icone] || GiHanger;
  return <Icon size={size} />;
}

// Paleta de cores por índice
const ACCENTS = [
  'var(--reveste-crimson)',
  'var(--reveste-crimson-dark)',
  'var(--reveste-gold-dark)',
  'var(--reveste-crimson-light)',
  'var(--reveste-gold)',
  '#6b7280',
  'var(--reveste-crimson)',
  'var(--reveste-gold-dark)',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90 } },
};

// Skeleton card
const SkeletonCard = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.skeletonIcon} />
    <div className={styles.skeletonTitle} />
    <div className={styles.skeletonText} />
  </div>
);

const CollectionsSection = () => {
  const { setCategoryAndNavigate } = useFilter();
  const [categorias, setCategorias] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    api.get('/categorias')
      .then(r => setCategorias((r.data || []).filter(c => c.ativo !== false)))
      .catch(() => setCategorias([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.section
      className={styles.collectionsSection}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.h2 variants={itemVariants} className={styles.sectionTitle}>
        Categorias
      </motion.h2>
      <motion.p variants={itemVariants} className={styles.sectionSubtitle}>
        Encontre a peça perfeita para cada estilo
      </motion.p>

      {/* ── Loading ── */}
      {loading && (
        <div className={styles.collectionsGrid}>
          {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* ── Categorias da API ── */}
      {!loading && categorias.length > 0 && (
        <motion.div variants={itemVariants} className={styles.collectionsGrid}>
          {categorias.map((cat, i) => {
            const hasImage = isImageUrl(cat.icone);
            return (
              <motion.div
                key={cat.id}
                className={`${styles.collectionCard} ${hasImage ? styles.collectionCardImg : ''}`}
                style={{ '--card-accent': ACCENTS[i % ACCENTS.length] }}
                whileHover={{ scale: 1.04, y: -6 }}
                transition={{ type: 'spring', stiffness: 280, damping: 18 }}
              >
                {hasImage ? (
                  <div className={styles.collectionCoverImg}>
                    <img src={getImageSrc(cat.icone)} alt={cat.nome} />
                  </div>
                ) : (
                  <div className={styles.collectionIconContainer}>
                    <span className={styles.collectionIcon} style={{ color: ACCENTS[i % ACCENTS.length] }}>
                      {renderIcon(cat.icone)}
                    </span>
                  </div>
                )}
                <div className={styles.collectionBody}>
                  <h3 className={styles.collectionName}>{cat.nome}</h3>
                  <p className={styles.collectionDescription}>
                    {cat.descricao || 'Explore as peças desta categoria'}
                  </p>
                  <Link
                    href="/catalog"
                    onClick={() => setCategoryAndNavigate(String(cat.id))}
                    className={styles.viewCollectionLink}
                  >
                    Ver peças
                    <span className={styles.arrowIcon}>→</span>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ── Estado vazio ── */}
      {!loading && categorias.length === 0 && (
        <motion.div variants={itemVariants} className={styles.emptyState}>
          <span className={styles.emptyIcon}><GiHanger /></span>
          <h3 className={styles.emptyTitle}>Em breve novas coleções</h3>
          <p className={styles.emptyText}>
            Estamos organizando o acervo. Enquanto isso, explore todas as peças disponíveis.
          </p>
          <Link href="/catalog" className={styles.emptyBtn}>
            Ver acervo completo →
          </Link>
        </motion.div>
      )}
    </motion.section>
  );
};

export default CollectionsSection;
