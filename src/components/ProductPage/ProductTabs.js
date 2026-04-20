'use client';
import React, { useState } from 'react';
import styles from './ProductTabs.module.css';
import { motion } from 'framer-motion';

const ProductTabs = ({ product }) => {
  const [activeTab, setActiveTab] = useState('details');

  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabHeaders}>
        <button onClick={() => setActiveTab('details')} className={activeTab === 'details' ? styles.active : ''}>Detalhes</button>
        <button onClick={() => setActiveTab('specs')} className={activeTab === 'specs' ? styles.active : ''}>Especificações</button>
      </div>
      <div className={styles.tabContent}>
        {activeTab === 'details' && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}}>
            <h4>Sobre a Peça</h4>
            <p>{product.description}</p>
          </motion.div>
        )}
        {activeTab === 'specs' && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}}>
            <ul>
              <li><strong>ISBN:</strong> {product.specs.isbn}</li>
              <li><strong>Número de Páginas:</strong> {product.specs.pages}</li>
              <li><strong>Dimensões:</strong> {product.specs.dimensions}</li>
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
};
export default ProductTabs;