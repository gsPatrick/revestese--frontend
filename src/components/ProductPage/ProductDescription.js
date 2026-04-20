'use client';
import React from 'react';
import styles from './ProductDescription.module.css';
import { motion } from 'framer-motion';

// Este componente substitui o antigo ProductTabs
const ProductDescription = ({ product }) => {
  return (
    <div className={styles.descriptionContainer}>
      <motion.div 
        className={styles.content}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
      >
        <h4>Sobre a Peça</h4>
        <p>{product.description}</p>
      </motion.div>
    </div>
  );
};

export default ProductDescription;