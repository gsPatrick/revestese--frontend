'use client';

import React from 'react';
import styles from './AccountPage.module.css';
import { motion } from 'framer-motion';

// O componente agora recebe 'orders' também, para contar as compras
const AccountDashboard = ({ user, orders }) => {
  // Função para formatar a data, com verificação para evitar erros
  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Data indisponível';
    }
    // O construtor new Date() funciona corretamente com o formato ISO "2025-07-06T21:10:24.000Z"
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className={styles.contentTitle}>Painel</h2>
      <p className={styles.welcomeMessage}>
        Olá, {user?.nome}! Aqui você acompanha seus pedidos, favoritos e dados pessoais.
      </p>
      <div className={styles.dashboardSummary}>
        <div className={styles.summaryCard}>
          <h4>Compras Recentes</h4>
          {/* Usa a quantidade real de pedidos recebidos via props */}
          <p>Você tem {orders?.length || 0} pedido(s) no seu histórico.</p>
        </div>
        <div className={styles.summaryCard}>
          <h4>Membro Desde</h4>
          {/* CORREÇÃO APLICADA AQUI: usert.dataCriacao em vez de user.memberSince */}
          <p>{formatDate(user?.dataCriacao)}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default AccountDashboard;