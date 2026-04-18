// src/components/FeaturedProductCard/FeaturedProductCard.js

'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './FeaturedProductCard.module.css';
import { motion } from 'framer-motion';
import { BsCartPlus } from 'react-icons/bs';

const FeaturedProductCard = ({ product, index }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
        delay: index * 0.1
      }
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log(`Produto "${product.name}" adicionado ao carrinho!`);
  };

  const numericPrice = Number(product.price) || 0;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <Link href={`/product/${product.slug}`} className={styles.productCard}>
        {/* Imagem do Produto (à esquerda) */}
        <div className={styles.imageWrapper}>
          <Image
            src={product.imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className={styles.cardImage}
          />
        </div>

        {/* Informações do Produto (à direita) */}
        <div className={styles.cardInfo}>
          <h5 className={styles.cardTitle}>{product.name}</h5>
          <p className={styles.cardPrice}>R$ {numericPrice.toFixed(2).replace('.', ',')}</p>
          <motion.button
            className={styles.addToCartBtn}
            onClick={handleAddToCart}
            whileHover={{ scale: 1.1, backgroundColor: 'var(--reveste-crimson-muted)' }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            <BsCartPlus />
          </motion.button>
        </div>
      </Link>
    </motion.div>
  );
};

export default FeaturedProductCard;