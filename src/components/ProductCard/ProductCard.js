'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './ProductCard.module.css';
import { BsHeart, BsHeartFill } from 'react-icons/bs';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const CONDITION_LABELS = {
  novo: { label: 'Novo', cls: 'novo' },
  'novo com etiqueta': { label: 'Novo c/ Etiqueta', cls: 'novo' },
  'muito bom': { label: 'Muito Bom', cls: 'seminovo' },
  'bom': { label: 'Bom Estado', cls: 'seminovo' },
  vintage: { label: 'Vintage', cls: 'vintage' },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 90, damping: 14, delay: (i || 0) * 0.08 },
  }),
};

const ProductCard = ({ product, index }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && product.id) {
      setIsLoadingFavorite(true);
      api.get(`/favoritos/verificar/${product.id}`)
        .then(r => setIsFavorite(r.data.isFavorito))
        .catch(() => setIsFavorite(false))
        .finally(() => setIsLoadingFavorite(false));
    } else {
      setIsFavorite(false);
      setIsLoadingFavorite(false);
    }
  }, [isAuthenticated, product.id]);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Você precisa estar logado para salvar produtos.');
      return;
    }
    setIsLoadingFavorite(true);
    try {
      if (isFavorite) {
        await api.delete(`/favoritos/${product.id}`);
        setIsFavorite(false);
      } else {
        await api.post('/favoritos', { produtoId: product.id });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Erro ao atualizar favoritos:', err.response?.data?.erro || err.message);
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const imageSrc = product.imageSrc || product.imagens?.[0] || 'https://placehold.co/400x500/f5f0e8/9A7A2E?text=Reveste-se';
  const price = product.price ?? product.variacoes?.[0]?.preco;

  // Derive condition badge
  const conditionRaw = (product.condicao || '').toLowerCase();
  const conditionInfo = CONDITION_LABELS[conditionRaw];

  const productHref = `/product/${product.slug || product.id}`;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className={styles.productCard}
    >
      {/* Image + overlays */}
      <div className={styles.productImageContainer}>
        <Link href={productHref} className={styles.productLink} aria-label={product.name}>
          <Image
            src={imageSrc}
            alt={product.name || 'Peça'}
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 25vw"
            className={styles.productImage}
          />

          {/* Hover overlay + quick view */}
          <div className={styles.imageOverlay}>
            <span className={styles.quickViewBtn}>Ver Peça</span>
          </div>
        </Link>

        {/* Badges */}
        <div className={styles.badgesWrapper}>
          {product.isNew && <span className={styles.newBadge}>Nova Chegada</span>}
          {conditionInfo && (
            <span className={`${styles.conditionBadge} ${styles[conditionInfo.cls]}`}>
              {conditionInfo.label}
            </span>
          )}
        </div>

        {/* Wishlist */}
        <motion.button
          className={`${styles.wishlistButton} ${isFavorite ? styles.isFavorite : ''}`}
          onClick={handleToggleFavorite}
          disabled={isLoadingFavorite}
          whileTap={{ scale: 0.88 }}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
        >
          {isFavorite ? <BsHeartFill /> : <BsHeart />}
        </motion.button>
      </div>

      {/* Info */}
      <Link href={productHref} className={styles.productLink}>
        <div className={styles.productInfo}>
          <h3 className={styles.productName}>{product.name || 'Peça sem nome'}</h3>
          {price != null && Number(price) > 0 && (
            <p className={styles.productPrice}>
              R$ {Number(price).toFixed(2).replace('.', ',')}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
