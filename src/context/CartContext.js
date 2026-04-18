'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Criar o Contexto
const CartContext = createContext();

// 2. Criar o Provedor do Contexto (Provider)
export const CartProvider = ({ children }) => {
  // Estado para armazenar os itens do carrinho
  // Tentamos carregar do localStorage, ou começamos com um array vazio
  const [cartItems, setCartItems] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('revesteCart');
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  // Salvar no localStorage sempre que o carrinho mudar
  useEffect(() => {
    localStorage.setItem('revesteCart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Função para adicionar um item ao carrinho
  const addToCart = (product, quantity, variation) => {
    setCartItems(prevItems => {
      // Verifica se o item com a mesma variação já existe
      const existingItem = prevItems.find(
        item => item.id === product.id && item.variation.id === variation.id
      );

      if (existingItem) {
        // Se existe, atualiza a quantidade
        return prevItems.map(item =>
          item.id === product.id && item.variation.id === variation.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Se não existe, adiciona como um novo item
        return [...prevItems, { ...product, quantity, variation }];
      }
    });
  };

  // Função para remover um item do carrinho
  const removeFromCart = (productId, variationId) => {
    setCartItems(prevItems =>
      prevItems.filter(
        item => !(item.id === productId && item.variation.id === variationId)
      )
    );
  };

  // Função para atualizar a quantidade de um item
  const updateQuantity = (productId, variationId, newQuantity) => {
    if (newQuantity < 1) {
      // Se a quantidade for menor que 1, remove o item
      removeFromCart(productId, variationId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId && item.variation.id === variationId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Função para limpar o carrinho
  const clearCart = () => {
    setCartItems([]);
  };

  // O valor que será provido para os componentes filhos
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// 3. Criar um Hook customizado para facilitar o uso do contexto
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};