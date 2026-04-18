'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styles from './TrustBar.module.css';
import { BsShieldCheck, BsTruck, BsPatchCheck } from 'react-icons/bs';
import { FaLeaf, FaRecycle } from 'react-icons/fa';

const trustData = [
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
  {
    id: 'shipping',
    icon: <BsTruck />,
    text: 'Frete Fixo R$ 9,90',
    subtext: 'Para todo o Brasil',
  },
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};

const TrustBar = () => {
  return (
    <motion.section
      className={styles.trustBarSection}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
    >
      {trustData.map((item) => (
        <motion.div
          key={item.id}
          className={styles.trustItem}
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
