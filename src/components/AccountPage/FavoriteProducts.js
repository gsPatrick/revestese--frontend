// src/components/AccountPage/FavoriteProducts.js

'use client';

import React from 'react';
import styles from './AccountPage.module.css';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { BsHeartbreak, BsTrash } from 'react-icons/bs';
import api from '@/services/api'; // Importar a API para a função de remover

const FavoriteProducts = ({ favorites }) => {
  // Função para remover um item dos favoritos
  const handleRemoveFavorite = async (productId) => {
    if (!confirm('Tem certeza que deseja remover este item dos seus favoritos?')) {
      return;
    }
    try {
      await api.delete(`/favoritos/${productId}`);
      // Idealmente, você atualizaria o estado aqui para remover o item da UI
      // Para uma solução simples, vamos recarregar a página.
      window.location.reload(); 
    } catch (error) {
      console.error("Erro ao remover favorito:", error);
      alert("Não foi possível remover o item. Tente novamente.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className={styles.contentTitle}>Meus Favoritos</h2>
      {favorites && favorites.length > 0 ? (
        <div className={styles.favoritesGrid}>
          {favorites.map(product => {
            // --- CORREÇÃO DO PREÇO ---
            // 1. Acessa a primeira variação, se existir.
            const firstVariation = product.variacoes?.[0];
            // 2. Converte o preço (que é string) para número. Se não existir, usa 0.
            const priceAsNumber = Number(firstVariation?.preco) || 0;
            // 3. Formata para exibição.
            const formattedPrice = priceAsNumber.toFixed(2).replace('.', ',');

            return (
              <div key={product.id} className={styles.favoriteCard}>
                <Link href={`/product/${product.slug || product.id}`} passHref>
                    <Image 
                      // A URL da imagem já vem completa do backend, então está correto.
                      src={product.imagens?.[0] || 'https://placehold.co/150x150.png'} 
                      alt={product.nome} 
                      width={150} 
                      height={150}
                      className={styles.favoriteImage} // Adicionar uma classe para estilo se necessário
                    />
                </Link>
                <h4 className={styles.favoriteName}>{product.nome}</h4>
                <p className={styles.favoritePrice}>R$ {formattedPrice}</p>
                <div className={styles.favoriteActions}>
                  <Link href={`/product/${product.slug || product.id}`} className={styles.viewProductBtn}>Ver Produto</Link>
                  <button 
                    onClick={() => handleRemoveFavorite(product.id)}
                    className={styles.removeFavoriteBtn} 
                    aria-label="Remover dos favoritos"
                  >
                    <BsTrash />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className={styles.emptyStateContainer}>
            <BsHeartbreak className={styles.emptyStateIcon} />
            <h3 className={styles.emptyStateTitle}>Nenhum favorito ainda</h3>
            <p className={styles.emptyStateText}>Explore o acervo e salve as peças que mais te encantaram.</p>
        </div>
      )}
    </motion.div>
  );
};

export default FavoriteProducts;