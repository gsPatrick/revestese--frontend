// src/components/ProductPage/ProductDetails.js

'use client';
import React, { useState, useEffect } from 'react';
import styles from './ProductDetails.module.css';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation'; // 1. Importar o useRouter para o redirecionamento
import { BsCartPlus, BsHeart, BsHeartFill, BsDash, BsPlus, BsCheckLg } from 'react-icons/bs';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

const ProductDetails = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState(product.variations[0]);
  const [added, setAdded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(true);

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter(); // 2. Instanciar o router

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoadingFavorite(true);
      api.get(`/favoritos/verificar/${product.id}`)
        .then(response => {
          setIsFavorite(response.data.isFavorito);
        })
        .catch(error => {
          console.error("Erro ao verificar favorito:", error);
          setIsFavorite(false);
        })
        .finally(() => {
          setIsLoadingFavorite(false);
        });
    } else {
      setIsFavorite(false);
      setIsLoadingFavorite(false);
    }
  }, [isAuthenticated, product.id]);


  const handleQuantityChange = (amount) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  const handleVariationChange = (variation) => {
    setSelectedVariation(variation);
  };

  // Função para o botão "Adicionar ao Carrinho" (continua na página)
  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariation);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  // 3. Nova função para o botão "Comprar Agora" (adiciona e redireciona)
  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariation);
    // Redireciona para a página do carrinho
    router.push('/cart');
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      alert("Você precisa estar logado para adicionar produtos aos favoritos.");
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
    } catch (error) {
      console.error("Erro ao atualizar favoritos:", error.response?.data?.erro || error.message);
      alert("Ocorreu um erro ao atualizar sua lista de desejos. Tente novamente.");
    } finally {
      setIsLoadingFavorite(false);
    }
  };


  return (
    <div className={styles.detailsContainer}>
      <h1 className={styles.productTitle}>{product.name}</h1>
      <p className={styles.productPrice}>R$ {selectedVariation.price.toFixed(2).replace('.', ',')}</p>
      
      {product.description && (
        <p className={styles.productShortDescription}>{product.description}</p>
      )}

      <div className={styles.variationsContainer}>
        <h3 className={styles.variationsLabel}>Variações:</h3>
        {product.variations.map((variation) => (
          <label 
            key={variation.id} 
            className={`${styles.variationItem} ${selectedVariation.id === variation.id ? styles.active : ''}`}
          >
            <input
              type="radio"
              name="product-variation"
              className={styles.variationRadio}
              checked={selectedVariation.id === variation.id}
              onChange={() => handleVariationChange(variation)}
            />
            <div className={styles.variationContent}>
              <span className={styles.variationName}>{variation.name}</span>
              <span className={styles.variationPrice}>R$ {variation.price.toFixed(2).replace('.', ',')}</span>
              <span className={styles.variationStock}>{variation.stock} em estoque</span>
            </div>
          </label>
        ))}
      </div>

      <div className={styles.actionsWrapper}>
        <div className={styles.quantitySelector}>
          <button onClick={() => handleQuantityChange(-1)} aria-label="Diminuir quantidade"><BsDash /></button>
          <span>{quantity}</span>
          <button onClick={() => handleQuantityChange(1)} aria-label="Aumentar quantidade"><BsPlus /></button>
        </div>
        <motion.button 
          className={`${styles.addToCartButton} ${added ? styles.added : ''}`}
          whileHover={{ scale: added ? 1 : 1.05, filter: added ? 'none' : 'brightness(1.1)' }}
          whileTap={{ scale: added ? 1 : 0.95 }}
          onClick={handleAddToCart}
          disabled={added}
        >
          {added ? (
            <>
              <BsCheckLg /> Adicionado!
            </>
          ) : (
            <>
              <BsCartPlus /> Adicionar ao Carrinho
            </>
          )}
        </motion.button>
      </div>

      {/* 4. Adicionar o novo botão "Comprar Agora" logo abaixo do wrapper de ações */}
      <motion.button
        className={styles.buyNowButton}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleBuyNow}
      >
        Comprar Agora
      </motion.button>

      <motion.button 
        className={`${styles.wishlistButton} ${isFavorite ? styles.isFavorite : ''}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleToggleFavorite}
        disabled={isLoadingFavorite}
      >
        {isFavorite ? <BsHeartFill /> : <BsHeart />}
        {isLoadingFavorite ? 'Carregando...' : (isFavorite ? 'Remover da Lista de Desejos' : 'Adicionar à Lista de Desejos')}
      </motion.button>
    </div>
  );
};
export default ProductDetails;