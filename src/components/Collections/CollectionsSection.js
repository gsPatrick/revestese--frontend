'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useFilter } from '@/context/FilterContext';
import styles from './CollectionsSection.module.css';
import { GiHanger, GiTrousers, GiRunningShoe, GiSunflower, GiDiamondRing } from 'react-icons/gi';

const collectionData = [
  {
    id: '1',
    name: 'Feminino',
    description: 'Roupas e looks femininos',
    icon: <GiHanger />,
    accent: 'var(--reveste-crimson)',
  },
  {
    id: '2',
    name: 'Masculino',
    description: 'Peças para o guarda-roupa masculino',
    icon: <GiTrousers />,
    accent: 'var(--reveste-crimson-dark)',
  },
  {
    id: '3',
    name: 'Calçados',
    description: 'Tênis, botas e sandálias únicos',
    icon: <GiRunningShoe />,
    accent: 'var(--reveste-gold-dark)',
  },
  {
    id: '5',
    name: 'Vintage',
    description: 'Peças com história e personalidade',
    icon: <GiSunflower />,
    accent: 'var(--reveste-crimson-light)',
  },
  {
    id: '4',
    name: 'Acessórios',
    description: 'Bolsas, cintos e joias especiais',
    icon: <GiDiamondRing />,
    accent: 'var(--reveste-gold)',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90 } },
};

const CollectionsSection = () => {
  const { setCategoryAndNavigate } = useFilter();

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

      <motion.div variants={itemVariants} className={styles.collectionsGrid}>
        {collectionData.map((collection) => (
          <motion.div
            key={collection.id}
            className={styles.collectionCard}
            style={{ '--card-accent': collection.accent }}
            whileHover={{ scale: 1.04, y: -6 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
          >
            <div className={styles.collectionIconContainer}>
              <span className={styles.collectionIcon} style={{ color: collection.accent }}>
                {collection.icon}
              </span>
            </div>
            <h3 className={styles.collectionName}>{collection.name}</h3>
            <p className={styles.collectionDescription}>{collection.description}</p>
            <Link
              href="/catalog"
              onClick={() => setCategoryAndNavigate(collection.id)}
              className={styles.viewCollectionLink}
            >
              Ver peças
              <span className={styles.arrowIcon}>→</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
};

export default CollectionsSection;
