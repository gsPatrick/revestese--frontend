'use client';

import React from 'react';
import ProductCard from '@/components/ProductCard/ProductCard';
import styles from './ProductGrid.module.css';
import { motion, AnimatePresence } from 'framer-motion';

// Passamos isLoading e error como props
const ProductGrid = ({ products, isLoading, error }) => {
  
  // Condição de Carregamento
  if (isLoading) {
    return (
      <div className={styles.statusContainer}>
        <p className={styles.loadingText}>Buscando peças...</p>
      </div>
    );
  }

  // Condição de Erro
  if (error) {
    return (
      <div className={styles.statusContainer}>
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.gridContainer}>
      <AnimatePresence>
        {products.length > 0 ? (
          <motion.div
            className={styles.productGrid}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <ProductCard product={product} index={index} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          // ALTERAÇÃO AQUI: Nova estrutura para a mensagem de "vazio"
          <motion.div
            className={styles.noResults}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <h1 className={styles.noResultsTitle}>
              Nenhuma <span className={styles.highlight}>peça</span>
              <br />
              encontrada por aqui.
              <br />
              <span>Tente </span> mudar os <span className={styles.highlight}> filtros</span>
            </h1>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductGrid;