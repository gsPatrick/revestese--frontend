'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './TrustBar.module.css';
import { BsShieldCheck, BsTruck, BsPatchCheck } from 'react-icons/bs';
import { FaLeaf, FaRecycle } from 'react-icons/fa';

const BASE_ITEMS = [
  {
    id: 'circular',
    icon: <FaRecycle />,
    text: 'Moda Circular',
    subtext: 'Cada peça ganha uma nova vida',
  },
  {
    id: 'security',
    icon: <BsShieldCheck />,
    text: 'Compra Segura',
    subtext: 'Protegida pelo MercadoPago',
  },
  // Item de frete — injetado dinamicamente conforme config
  {
    id: 'eco',
    icon: <FaLeaf />,
    text: 'Consumo Consciente',
    subtext: 'Fashion com propósito',
  },
  {
    id: 'guarantee',
    icon: <BsPatchCheck />,
    text: 'Peças Verificadas',
    subtext: 'Autenticidade garantida',
  },
];

const FRETE_GRATIS_ITEM = {
  id: 'shipping',
  icon: <BsTruck />,
  text: 'Frete Grátis',
  subtext: 'Para todo o Brasil 🎉',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};

const TrustBar = () => {
  const [items, setItems] = useState(BASE_ITEMS);

  useEffect(() => {
    fetch('https://geral-revestese-api.r954jc.easypanel.host/api/configuracoes/loja/publicas')
      .then(r => r.json())
      .then(cfg => {
        const freteGratis = cfg.FRETE_GRATIS === true || cfg.FRETE_GRATIS === 'true';
        if (freteGratis) {
          // Injeta o card de frete logo após segurança (posição 2)
          setItems([BASE_ITEMS[0], BASE_ITEMS[1], FRETE_GRATIS_ITEM, BASE_ITEMS[2], BASE_ITEMS[3]]);
        }
        // Se false: não injeta — o card não aparece
      })
      .catch(() => {});
  }, []);

  return (
    <motion.section
      className={styles.trustBarSection}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
    >
      {items.map((item) => (
        <motion.div
          key={item.id}
          className={`${styles.trustItem} ${item.id === 'shipping' ? styles.trustItemFrete : ''}`}
          variants={itemVariants}
          whileHover={{ y: -6, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className={styles.trustIcon}>{item.icon}</div>
          <div className={styles.trustText}>
            <h4>{item.text}</h4>
            <p>{item.subtext}</p>
          </div>
        </motion.div>
      ))}
    </motion.section>
  );
};

export default TrustBar;
